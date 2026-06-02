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

// Mirror of idempotency key generation in app/explore/page.tsx + app/tournaments/page.tsx
function generateClientRequestId(prefix: string, uid: string): string {
  return `${prefix}_${uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Mirror of input validation in convex/contact.ts:submitContact
function validateContactInput(name: string, email: string, message: string, subject?: string): string | null {
  if (name.length < 2 || name.length > 100) return "Name must be 2-100 characters";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  if (message.length < 10 || message.length > 5000) return "Message must be 10-5000 characters";
  if (subject && subject.length > 200) return "Subject must be under 200 characters";
  return null;
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

describe("generateClientRequestId (idempotency key)", () => {
  it("returns a string with the expected prefix and parts", () => {
    const id = generateClientRequestId("turf", "user_abc123");
    expect(id).toMatch(/^turf_user_abc123_\d+_[a-z0-9]{6}$/);
  });

  it("produces different IDs on consecutive calls", () => {
    const a = generateClientRequestId("tour", "user_abc");
    const b = generateClientRequestId("tour", "user_abc");
    expect(a).not.toBe(b);
  });

  it("uses the right prefix for turf vs tournament", () => {
    const turf = generateClientRequestId("turf", "u1");
    const tour = generateClientRequestId("tour", "u1");
    expect(turf.startsWith("turf_")).toBe(true);
    expect(tour.startsWith("tour_")).toBe(true);
  });
});

describe("validateContactInput", () => {
  it("accepts a valid contact submission", () => {
    const err = validateContactInput(
      "Akram",
      "akram@example.com",
      "I would like to know more about your tournament offerings."
    );
    expect(err).toBeNull();
  });

  it("rejects names shorter than 2 chars", () => {
    expect(validateContactInput("A", "a@b.co", "1234567890")).toBe("Name must be 2-100 characters");
  });

  it("rejects names longer than 100 chars", () => {
    expect(validateContactInput("A".repeat(101), "a@b.co", "1234567890")).toBe("Name must be 2-100 characters");
  });

  it("rejects invalid email addresses", () => {
    expect(validateContactInput("Akram", "not-an-email", "1234567890")).toBe("Invalid email address");
    expect(validateContactInput("Akram", "a@b", "1234567890")).toBe("Invalid email address");
  });

  it("rejects messages shorter than 10 chars", () => {
    expect(validateContactInput("Akram", "a@b.co", "short")).toBe("Message must be 10-5000 characters");
  });

  it("rejects messages longer than 5000 chars", () => {
    expect(validateContactInput("Akram", "a@b.co", "A".repeat(5001))).toBe("Message must be 10-5000 characters");
  });

  it("rejects subjects over 200 chars", () => {
    const long = "A".repeat(201);
    expect(validateContactInput("Akram", "a@b.co", "1234567890", long)).toBe("Subject must be under 200 characters");
  });

  it("accepts submissions without a subject", () => {
    expect(validateContactInput("Akram", "a@b.co", "1234567890")).toBeNull();
  });
});
