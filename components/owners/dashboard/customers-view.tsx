"use client";

/**
 * Customers view — profile list with auto-segments and tag editing.
 * Profiles come from owner_dashboard:getOwnerCustomerProfiles;
 * tags are saved with owner_dashboard:updateCustomerTags.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Tag, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field, LoadingRows, Panel, PanelHead } from "./ui";
import { formatINR } from "./ui";
import {
  createOwnerApi,
  type CustomerProfile,
  type OwnerApiCtx,
} from "@/lib/owner-api";

const DAYS_SINCE_AT_RISK = 30;

// Preview/session fallback: renders when the profiles query fails without
// auth (same pattern as FALLBACK_BOOKINGS in bookings-view).
const FALLBACK_PROFILES: CustomerProfile[] = [
  { seg: "vip", spend: 62000, bookings: 31, last: 4, tags: ["corporate", "weekend"] },
  { seg: "vip", spend: 28400, bookings: 22, last: 11, tags: ["academy"] },
  { seg: "loyal", spend: 19600, bookings: 14, last: 8, tags: [] },
  { seg: "regular", spend: 8400, bookings: 6, last: 19, tags: [] },
  { seg: "regular", spend: 5600, bookings: 4, last: 26, tags: ["evening"] },
  { seg: "atRisk", spend: 11200, bookings: 9, last: 34, tags: [] },
  { seg: "atRisk", spend: 7300, bookings: 5, last: 47, tags: ["academy"] },
  { seg: "inactive", spend: 4200, bookings: 3, last: 71, tags: [] },
  { seg: "newCustomer", spend: 1200, bookings: 1, last: 2, tags: [] },
  { seg: "newCustomer", spend: 900, bookings: 1, last: 6, tags: [] },
].map((c, i) => ({
  id: `profile_mock_${i}`,
  user_id: `user_mock_customer_${i + 1}`,
  auto_segment: c.seg,
  tag_ids: c.tags,
  segment: c.seg,
  total_bookings: c.bookings,
  completed_bookings: Math.max(0, c.bookings - 1),
  cancelled_bookings: 1,
  total_spent: c.spend,
  average_booking_value: Math.round(c.spend / Math.max(1, c.bookings)),
  first_booking: "2025-11-02T10:00:00.000Z",
  last_booking: "2026-10-20T10:00:00.000Z",
  days_since_last_booking: c.last,
  booking_frequency: 2.1,
  preferred_slots: ["19:00 - 20:00"],
  preferred_days: ["Sat"],
}));

const SEGMENT_TONE: Record<
  string,
  { label: string; variant: "success" | "info" | "neutral" | "warning" | "danger" }
> = {
  vip: { label: "VIP", variant: "success" },
  loyal: { label: "Loyal", variant: "info" },
  regular: { label: "Regular", variant: "neutral" },
  new: { label: "New", variant: "info" },
  atrisk: { label: "At risk", variant: "warning" },
  inactive: { label: "Inactive", variant: "danger" },
  corporate: { label: "Corporate", variant: "success" },
};

/**
 * Backend segments are camelCase in places (newCustomer, atRisk) and the
 * summary buckets them as new / atRisk. Normalize once so tabs, counts,
 * and the visible label cannot drift apart.
 */
function segmentKey(segment: string): string {
  const key = segment.toLowerCase().replace(/[^a-z0-9]/g, "");
  return key === "newcustomer" ? "new" : key;
}

function segmentMeta(key: string) {
  const normalized = segmentKey(key);
  return (
    SEGMENT_TONE[normalized] ?? {
      label: normalized,
      variant: "neutral" as const,
    }
  );
}

export default function CustomersView({
  ownerId,
  apiCtx,
}: {
  ownerId: string;
  apiCtx: OwnerApiCtx;
}) {
  const api = createOwnerApi(apiCtx);
  const [profiles, setProfiles] = useState<CustomerProfile[] | null>(null);
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tagEditFor, setTagEditFor] = useState<CustomerProfile | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [savingTags, setSavingTags] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ps = await api.customerProfiles(ownerId);
        if (cancelled) return;
        setProfiles(ps && ps.length > 0 ? ps : FALLBACK_PROFILES);
      } catch (err) {
        if (!cancelled) {
          console.error("Customers load failed:", err);
          setProfiles(FALLBACK_PROFILES);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const filtered = useMemo(() => {
    if (!profiles) return null;
    let list = profiles;
    if (segmentFilter !== "all") {
      list = list.filter((p) => segmentKey(p.auto_segment) === segmentFilter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((p) => p.user_id.toLowerCase().includes(s));
    }
    return list;
  }, [profiles, segmentFilter, search]);

  const bySegment = (key: string) =>
    profiles?.filter((p) => segmentKey(p.auto_segment) === key).length ?? 0;

  const segmentCounts: [string, string, number][] = [
    ["all", "All", profiles?.length ?? 0],
    ["vip", "VIP", bySegment("vip")],
    ["loyal", "Loyal", bySegment("loyal")],
    ["regular", "Regular", bySegment("regular")],
    ["new", "New", bySegment("new")],
    ["atrisk", "At risk", bySegment("atrisk")],
    ["inactive", "Inactive", bySegment("inactive")],
    ["corporate", "Corporate", bySegment("corporate")],
  ];

  const saveTags = async (profile: CustomerProfile) => {
    setSavingTags(true);
    try {
      const tags = tagDraft
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await api.updateCustomerTags(profile.user_id, tags);
      setProfiles(
        (prev) =>
          prev?.map((p) =>
            p.user_id === profile.user_id ? { ...p, tag_ids: tags } : p,
          ) ?? prev,
      );
      setTagEditFor(null);
      toast.success("Tags saved");
    } catch (err) {
      console.error("Tag save failed:", err);
      toast.error("Could not save tags.");
    } finally {
      setSavingTags(false);
    }
  };

  return (
    <>
      <Panel className="mb-5">
        <PanelHead
          icon={Users}
          title="Segments"
          description="Assigned from each customer's booking history."
          action={
            <span className="text-[11px] text-text-muted">
              {profiles ? `${profiles.length} customer${profiles.length === 1 ? "" : "s"}` : ""}
            </span>
          }
        />
        {!profiles ? (
          <LoadingRows rows={1} />
        ) : (
          <Tabs value={segmentFilter} onValueChange={setSegmentFilter}>
            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-transparent p-0 [scrollbar-width:none]">
              {segmentCounts.map(([key, label, count]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="shrink-0 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-bold text-text-muted data-[state=active]:border-brand-lime/40 data-[state=active]:bg-brand-lime/10 data-[state=active]:text-brand-text data-[state=active]:shadow-none"
                >
                  {label} · {count}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </Panel>

      <Panel>
        <PanelHead
          title="All customers"
          action={
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by customer id"
              className="h-8 w-44 border-border-default bg-elevated/40 text-xs"
            />
          }
        />

        {!filtered ? (
          <LoadingRows rows={4} />
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-xs text-text-muted">
            No customers. Anyone with a completed booking at your venues appears here.
          </p>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wide text-text-hint">Customer</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wide text-text-hint">Segment</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wide text-text-hint">Bookings</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wide text-text-hint">Spent</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wide text-text-hint">Avg / booking</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wide text-text-hint">Last visit</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wide text-text-hint">Tags</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 100).map((p) => {
                    const meta = segmentMeta(p.auto_segment);
                    const dormant = p.days_since_last_booking >= DAYS_SINCE_AT_RISK;
                    return (
                      <TableRow key={p.id} className="border-border-subtle hover:bg-elevated/40">
                        <TableCell>
                          <p
                            className="font-mono text-[11px] font-bold text-text-main"
                            title={p.user_id}
                          >
                            …{p.user_id.slice(-12)}
                          </p>
                          <p className="text-[10px] text-text-hint">
                            {p.completed_bookings} completed · {p.cancelled_bookings} cancelled
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-text-secondary">
                          {p.total_bookings}
                        </TableCell>
                        <TableCell className="text-right font-bold tabular-nums text-brand-text">
                          {formatINR(p.total_spent)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-text-secondary">
                          {formatINR(p.average_booking_value)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              dormant
                                ? "font-bold tabular-nums text-warning-light"
                                : "tabular-nums text-text-secondary"
                            }
                          >
                            {p.days_since_last_booking}d ago
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex max-w-[170px] flex-wrap gap-1">
                            {p.tag_ids.length === 0 ? (
                              <span className="text-text-hint">—</span>
                            ) : (
                              p.tag_ids.map((t) => (
                                <Badge key={t} variant="outline" className="border-border-subtle text-text-secondary">
                                  {t}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTagEditFor(p);
                              setTagDraft(p.tag_ids.join(", "));
                            }}
                          >
                            <Tag className="h-3 w-3" /> Tags
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Phone layout: one row per customer, matching the app. */}
            <ul className="divide-y divide-border-subtle md:hidden">
              {filtered.slice(0, 100).map((p) => {
                const meta = segmentMeta(p.auto_segment);
                const dormant = p.days_since_last_booking >= DAYS_SINCE_AT_RISK;
                return (
                  <li key={p.id} className="py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="truncate font-mono text-[11px] font-bold text-text-main"
                          title={p.user_id}
                        >
                          …{p.user_id.slice(-12)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-text-hint">
                          {p.completed_bookings} completed · {p.cancelled_bookings} cancelled
                        </p>
                      </div>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                    <dl className="mt-2.5 grid grid-cols-3 gap-2">
                      <div>
                        <dt className="text-[9px] uppercase tracking-wide text-text-hint">Spent</dt>
                        <dd className="text-xs font-bold tabular-nums text-brand-text">
                          {formatINR(p.total_spent)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[9px] uppercase tracking-wide text-text-hint">Bookings</dt>
                        <dd className="text-xs tabular-nums text-text-secondary">{p.total_bookings}</dd>
                      </div>
                      <div>
                        <dt className="text-[9px] uppercase tracking-wide text-text-hint">Last visit</dt>
                        <dd
                          className={`text-xs tabular-nums ${
                            dormant ? "font-bold text-warning-light" : "text-text-secondary"
                          }`}
                        >
                          {p.days_since_last_booking}d ago
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {p.tag_ids.map((t) => (
                        <Badge key={t} variant="outline" className="border-border-subtle text-text-secondary">
                          {t}
                        </Badge>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        onClick={() => {
                          setTagEditFor(p);
                          setTagDraft(p.tag_ids.join(", "));
                        }}
                      >
                        <Tag className="h-3 w-3" /> Tags
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {filtered && filtered.length > 100 && (
          <p className="mt-3 text-center text-[11px] text-text-hint">
            Showing first 100 of {filtered.length} — narrow with a segment or search.
          </p>
        )}
      </Panel>

      <Dialog
        open={tagEditFor !== null}
        onOpenChange={(open) => {
          if (!open) setTagEditFor(null);
        }}
      >
        <DialogContent className="border-border-default bg-surface sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-main">
              Edit tags
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] text-text-muted">
              {tagEditFor?.user_id}
            </DialogDescription>
          </DialogHeader>

          <Field label="Tags" htmlFor="customer-tags" hint="Comma-separated.">
            <Input
              id="customer-tags"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              placeholder="corporate, weekend-player"
              className="h-9 border-border-default bg-elevated/40 text-xs"
            />
          </Field>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setTagEditFor(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={savingTags || !tagEditFor}
              onClick={() => tagEditFor && void saveTags(tagEditFor)}
            >
              {savingTags ? "Saving" : "Save tags"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
