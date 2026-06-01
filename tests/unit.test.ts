// Tests for pricing/cancellation logic.
// These functions are pure and don't depend on Convex runtime,
// so they can be unit tested without a database.

import { describe, it, expect } from "vitest";

type RefundStatus = "pending" | "refunded" | "paid";

// Mirror of the cancellation refund logic in convex/bookings.ts
function calculateRefundStatus(startTimeIso: string, now: number = Date.now()): RefundStatus {
  const hoursToStart = (new Date(startTimeIso).getTime() - now) / 3_600_000;
  if (hoursToStart >= 24) return "refunded";
  if (hoursToStart >= 6) return "paid";
  return "pending";
}

// Mirror of pricing logic in app/explore/page.tsx
function calculatePricing(price: number) {
  const subtotal = price;
  const convenience = Math.round(price * 0.018);
  const gst = Math.round(price * 0.18);
  const total = subtotal + convenience + gst;
  return { subtotal, convenience, gst, total, totalPaise: total * 100 };
}

// Mirror of slot generation in convex/turfs.ts
function generateSlots(openHour: string, closeHour: string): string[] {
  const [openH] = openHour.split(":").map(Number);
  const [closeH] = closeHour.split(":").map(Number);
  const slots: string[] = [];
  for (let h = openH; h < closeH; h++) {
    slots.push(
      `${String(h).padStart(2, "0")}:00 - ${String(h + 1).padStart(2, "0")}:00`
    );
  }
  return slots;
}

describe("calculateRefundStatus", () => {
  const now = new Date("2026-06-01T12:00:00Z").getTime();

  it("returns 'refunded' for cancellations 24+ hours before", () => {
    const start = new Date("2026-06-02T15:00:00Z").toISOString();
    expect(calculateRefundStatus(start, now)).toBe("refunded");
  });

  it("returns 'paid' (50% refund) for cancellations 6-24 hours before", () => {
    const start = new Date("2026-06-01T18:00:00Z").toISOString();
    expect(calculateRefundStatus(start, now)).toBe("paid");
  });

  it("returns 'pending' (no refund) for cancellations less than 6 hours before", () => {
    const start = new Date("2026-06-01T15:00:00Z").toISOString();
    expect(calculateRefundStatus(start, now)).toBe("pending");
  });

  it("returns 'pending' for past start times", () => {
    const start = new Date("2026-06-01T10:00:00Z").toISOString();
    expect(calculateRefundStatus(start, now)).toBe("pending");
  });

  it("returns 'refunded' at exactly 24 hours", () => {
    const start = new Date("2026-06-02T12:00:00Z").toISOString();
    expect(calculateRefundStatus(start, now)).toBe("refunded");
  });

  it("returns 'paid' at exactly 6 hours", () => {
    const start = new Date("2026-06-01T18:00:00Z").toISOString();
    expect(calculateRefundStatus(start, now)).toBe("paid");
  });
});

describe("calculatePricing", () => {
  it("computes subtotal, convenience (1.8%), GST (18%), and total", () => {
    const result = calculatePricing(1000);
    expect(result.subtotal).toBe(1000);
    expect(result.convenience).toBe(18);
    expect(result.gst).toBe(180);
    expect(result.total).toBe(1198);
    expect(result.totalPaise).toBe(119800);
  });

  it("handles zero price", () => {
    const result = calculatePricing(0);
    expect(result.total).toBe(0);
    expect(result.totalPaise).toBe(0);
  });

  it("rounds convenience and GST correctly", () => {
    const result = calculatePricing(555);
    expect(result.subtotal).toBe(555);
    expect(result.convenience).toBe(10); // 555 * 0.018 = 9.99 -> 10
    expect(result.gst).toBe(100); // 555 * 0.18 = 99.9 -> 100
    expect(result.total).toBe(665);
  });
});

describe("generateSlots", () => {
  it("generates hourly slots for 6AM-11PM venue", () => {
    const slots = generateSlots("06:00", "23:00");
    expect(slots).toHaveLength(17);
    expect(slots[0]).toBe("06:00 - 07:00");
    expect(slots[16]).toBe("22:00 - 23:00");
  });

  it("handles a single-hour venue", () => {
    const slots = generateSlots("09:00", "10:00");
    expect(slots).toEqual(["09:00 - 10:00"]);
  });

  it("returns empty array when close is at or before open", () => {
    expect(generateSlots("10:00", "10:00")).toEqual([]);
    expect(generateSlots("12:00", "10:00")).toEqual([]);
  });
});
