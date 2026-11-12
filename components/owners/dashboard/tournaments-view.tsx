"use client";

/**
 * Tournaments view — list the owner's tournaments, create one, open/close
 * registration, and post announcements. Wire values match tournaments.ts:
 * tournament_type individual|team, bracket single_elimination|round_robin,
 * status draft|upcoming|registration_open|... The organizer is always the
 * authenticated user (the backend ignores any client-supplied id).
 */

import React, { useEffect, useState } from "react";
import { ChevronDown, Megaphone, Plus, Trophy } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DateTimeField,
  Field,
  LoadingRows,
  Panel,
  PanelHead,
} from "./ui";
import {
  createOwnerApi,
  type OwnerApiCtx,
  type OwnerTournament,
  type TournamentAnnouncement,
} from "@/lib/owner-api";
import { formatINR } from "./ui";

type StatusVariant = "success" | "info" | "neutral" | "warning" | "danger";

const STATUS_META: Record<string, { label: string; variant: StatusVariant }> = {
  draft: { label: "draft", variant: "neutral" },
  upcoming: { label: "upcoming", variant: "info" },
  registration_open: { label: "registration open", variant: "success" },
  registration_closed: { label: "registration closed", variant: "warning" },
  in_progress: { label: "in progress", variant: "info" },
  completed: { label: "completed", variant: "neutral" },
  cancelled: { label: "cancelled", variant: "danger" },
};

function statusMeta(s: string) {
  return STATUS_META[s] ?? { label: s.replaceAll("_", " "), variant: "neutral" as const };
}

interface FormState {
  name: string;
  turfId?: string;
  description: string;
  sportType: string;
  tournamentType: "individual" | "team";
  bracketType: "single_elimination" | "round_robin";
  entryFee: string;
  prizePool: string;
  maxParticipants: string;
  minTeamSize: string;
  maxTeamSize: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  rules: string;
}

// Preview/session fallback: renders when the tournaments query fails without
// auth (same pattern as FALLBACK_BOOKINGS in bookings-view).
const FALLBACK_TOURNAMENTS: OwnerTournament[] = [
  {
    id: "tourn_mock_1",
    name: "Mumbai Premier League 2026",
    description: "Open 5-a-side football championship — knockout format.",
    sport_type: "football",
    tournament_type: "team",
    status: "registration_open",
    entry_fee: 1500,
    prize_pool: 25000,
    max_participants: 16,
    registered_count: 11,
    start_date: "2026-11-21T09:00:00.000Z",
    end_date: "2026-11-23T18:00:00.000Z",
    registration_deadline: "2026-11-18T23:59:00.000Z",
  },
  {
    id: "tourn_mock_2",
    name: "Monsoon Box Cricket Cup",
    description: "8-over box cricket, floodlit evening slots.",
    sport_type: "cricket",
    tournament_type: "team",
    status: "upcoming",
    entry_fee: 2000,
    prize_pool: 40000,
    max_participants: 12,
    registered_count: 5,
    start_date: "2026-12-05T09:00:00.000Z",
    end_date: "2026-12-06T18:00:00.000Z",
    registration_deadline: "2026-12-01T23:59:00.000Z",
  },
];

const EMPTY_FORM: FormState = {
  name: "",
  turfId: undefined,
  description: "",
  sportType: "Football",
  tournamentType: "team",
  bracketType: "single_elimination",
  entryFee: "0",
  prizePool: "",
  maxParticipants: "",
  minTeamSize: "",
  maxTeamSize: "",
  registrationDeadline: "",
  startDate: "",
  endDate: "",
  rules: "",
};

export default function TournamentsView({
  ownerId,
  apiCtx,
}: {
  ownerId: string;
  apiCtx: OwnerApiCtx;
}) {
  const api = createOwnerApi(apiCtx);
  const [tournaments, setTournaments] = useState<OwnerTournament[] | null>(null);
  const [ownerTurfs, setOwnerTurfs] = useState<{ _id: string; name: string; city?: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  // Announcement drawer state: which tournament is open + its data
  const [annOpenFor, setAnnOpenFor] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<TournamentAnnouncement[]>([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setTournaments(await api.ownerTournaments(ownerId));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.ownerTournaments(ownerId);
        if (!cancelled) setTournaments(list);
      } catch (err) {
        if (!cancelled) {
          console.error("Tournaments load failed:", err);
          setTournaments(FALLBACK_TOURNAMENTS);
        }
      }
      try {
        const turfs = await api.ownerTurfs();
        if (!cancelled && Array.isArray(turfs)) {
          setOwnerTurfs(turfs);
          if (turfs.length > 0) {
            setForm((f) => (f.turfId ? f : { ...f, turfId: turfs[0]._id }));
          }
        }
      } catch (err) {
        console.error("Owner turfs load failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const create = async () => {
    const entryFee = Number(form.entryFee || 0);
    const maxParticipants = Number(form.maxParticipants);
    if (!form.name.trim()) {
      toast.error("Tournament name is required.");
      return;
    }
    if (!Number.isFinite(entryFee) || entryFee < 0) {
      toast.error("Entry fee must be zero or a positive number.");
      return;
    }
    if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
      toast.error("Max participants must be a whole number of at least 1.");
      return;
    }
    if (!form.startDate || !form.endDate || !form.registrationDeadline) {
      toast.error("Registration deadline, start and end dates are required.");
      return;
    }
    if (new Date(form.registrationDeadline) > new Date(form.startDate)) {
      toast.error("Registration deadline must be before the start date.");
      return;
    }
    if (form.tournamentType === "team") {
      const min = form.minTeamSize ? Number(form.minTeamSize) : undefined;
      const max = form.maxTeamSize ? Number(form.maxTeamSize) : undefined;
      if (min !== undefined && max !== undefined && min > max) {
        toast.error("Min team size cannot exceed max team size.");
        return;
      }
    }
    setSaving(true);
    try {
      await api.createTournament({
        name: form.name.trim(),
        turf_id: form.turfId ? form.turfId : undefined,
        description: form.description.trim() || undefined,
        sport_type: form.sportType.toLowerCase(),
        tournament_type: form.tournamentType,
        bracket_type: form.bracketType,
        entry_fee: entryFee,
        prize_pool: form.prizePool ? Number(form.prizePool) : undefined,
        max_participants: maxParticipants,
        min_team_size:
          form.tournamentType === "team" && form.minTeamSize
            ? Number(form.minTeamSize)
            : undefined,
        max_team_size:
          form.tournamentType === "team" && form.maxTeamSize
            ? Number(form.maxTeamSize)
            : undefined,
        registration_deadline: new Date(form.registrationDeadline).toISOString(),
        start_date: new Date(form.startDate).toISOString(),
        end_date: new Date(form.endDate).toISOString(),
        auto_generate_bracket: true,
        rules: form.rules.trim() || undefined,
        status: "draft",
      });
      await load();
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success("Tournament created as a draft");
    } catch (err) {
      console.error("Create tournament failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Could not create the tournament.",
      );
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (t: OwnerTournament, status: string) => {
    try {
      await api.updateTournamentStatus(t.id, status);
      setTournaments(
        (prev) =>
          prev?.map((x) => (x.id === t.id ? { ...x, status } : x)) ?? prev,
      );
      toast.success(`Tournament moved to ${status.replaceAll("_", " ")}`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Could not update the status.",
      );
    }
  };

  const openAnnouncements = async (tournamentId: string) => {
    if (annOpenFor === tournamentId) {
      setAnnOpenFor(null);
      return;
    }
    setAnnOpenFor(tournamentId);
    setAnnLoading(true);
    try {
      setAnnouncements(await api.announcements(tournamentId));
    } catch {
      setAnnouncements([]);
    } finally {
      setAnnLoading(false);
    }
  };

  const postAnnouncement = async () => {
    if (!annOpenFor) return;
    if (!annTitle.trim() || !annMessage.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    setPosting(true);
    try {
      await api.createAnnouncement(annOpenFor, annTitle.trim(), annMessage.trim());
      setAnnouncements(await api.announcements(annOpenFor));
      setAnnTitle("");
      setAnnMessage("");
      toast.success("Announcement posted");
    } catch (err) {
      console.error("Announcement failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Could not post the announcement.",
      );
    } finally {
      setPosting(false);
    }
  };

  const setText =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Panel>
      <PanelHead
        icon={Trophy}
        title="All tournaments"
        description="Entry fees are collected online; registration is open while the status says so."
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> New tournament
          </Button>
        }
      />

      {!tournaments ? (
        <LoadingRows rows={4} />
      ) : tournaments.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">
          No tournaments. Create one and open registration to collect entry fees.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {tournaments.map((t) => {
            const meta = statusMeta(t.status);
            return (
              <li key={t.id} className="py-3.5">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-text-main">{t.name}</span>
                      <Badge variant={meta.variant} className="capitalize">
                        {meta.label}
                      </Badge>
                      <span className="text-[10px] capitalize text-text-hint">
                        {t.tournament_type} · {t.sport_type}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-text-hint">
                      {formatINR(t.entry_fee)} entry
                      {t.prize_pool ? ` · ${formatINR(t.prize_pool)} prize pool` : ""}
                      {" · "}
                      {new Date(t.start_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      {" – "}
                      {new Date(t.end_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    {t.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-brand-lime/30 text-[10px] font-bold text-brand-text hover:bg-brand-lime/10"
                        onClick={() => void setStatus(t, "registration_open")}
                      >
                        Open registration
                      </Button>
                    )}
                    {t.status === "registration_open" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] font-bold text-text-muted"
                        onClick={() => void setStatus(t, "registration_closed")}
                      >
                        Close registration
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-[10px] font-bold text-text-muted"
                      onClick={() => void openAnnouncements(t.id)}
                    >
                      <Megaphone className="h-3 w-3" /> Announcements
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          annOpenFor === t.id ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {annOpenFor === t.id && (
                  <div className="mt-3 rounded-xl border border-border-subtle bg-elevated/30 p-4">
                    {annLoading ? (
                      <LoadingRows rows={2} />
                    ) : (
                      <>
                        {announcements.length > 0 && (
                          <ul className="mb-3 divide-y divide-border-subtle">
                            {announcements.map((a) => (
                              <li key={a.id} className="py-2">
                                <p className="text-xs font-bold text-text-main">{a.title}</p>
                                <p className="text-[11px] text-text-secondary">{a.message}</p>
                                <p className="mt-0.5 text-[10px] text-text-hint">
                                  {new Date(a.created_at).toLocaleString("en-IN")}
                                  {a.priority ? ` · ${a.priority}` : ""}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                          <Input
                            value={annTitle}
                            onChange={(e) => setAnnTitle(e.target.value)}
                            placeholder="Title"
                            className="h-9 border-border-default bg-elevated/40 text-xs"
                          />
                          <Input
                            value={annMessage}
                            onChange={(e) => setAnnMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !posting) void postAnnouncement();
                            }}
                            placeholder="Message to registered participants"
                            className="h-9 border-border-default bg-elevated/40 text-xs"
                          />
                          <Button
                            size="sm"
                            className="h-9"
                            disabled={posting}
                            onClick={() => void postAnnouncement()}
                          >
                            {posting ? "Posting" : "Post announcement"}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border-default bg-surface sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-main">
              New tournament
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Saved as a draft. Open registration when the details are final.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Name" htmlFor="t-name">
                <Input
                  id="t-name"
                  value={form.name}
                  onChange={setText("name")}
                  placeholder="Monsoon Cup 2026"
                  className="h-9 border-border-default bg-elevated/40 text-xs"
                />
              </Field>
            </div>
            {ownerTurfs.length > 0 && (
              <div className="md:col-span-2">
                <Field label="Host Venue (Turf)">
                  <Select
                    value={form.turfId || "none"}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, turfId: v === "none" ? undefined : v }))
                    }
                  >
                    <SelectTrigger className="h-9 w-full border-border-default bg-elevated/40 text-xs">
                      <SelectValue placeholder="Select venue (optional)" />
                    </SelectTrigger>
                    <SelectContent className="border-border-default bg-surface">
                      <SelectItem value="none">No venue (Unlinked)</SelectItem>
                      {ownerTurfs.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name} {t.city ? `(${t.city})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}
            <Field label="Sport">
              <Select
                value={form.sportType}
                onValueChange={(v) => setForm((f) => ({ ...f, sportType: v }))}
              >
                <SelectTrigger className="h-9 w-full border-border-default bg-elevated/40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border-default bg-surface">
                  {["Football", "Cricket", "Badminton", "Tennis"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Format">
              <Select
                value={`${form.tournamentType}:${form.bracketType}`}
                onValueChange={(v) => {
                  const [tt, bt] = v.split(":");
                  setForm((f) => ({
                    ...f,
                    tournamentType: tt as FormState["tournamentType"],
                    bracketType: bt as FormState["bracketType"],
                  }));
                }}
              >
                <SelectTrigger className="h-9 w-full border-border-default bg-elevated/40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border-default bg-surface">
                  <SelectItem value="team:single_elimination">Team · Knockout</SelectItem>
                  <SelectItem value="team:round_robin">Team · Round Robin</SelectItem>
                  <SelectItem value="individual:single_elimination">Individual · Knockout</SelectItem>
                  <SelectItem value="individual:round_robin">Individual · Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Entry fee (₹)" htmlFor="t-fee">
              <Input
                id="t-fee"
                value={form.entryFee}
                onChange={setText("entryFee")}
                type="number"
                min="0"
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
            <Field label="Prize pool (₹)" htmlFor="t-prize">
              <Input
                id="t-prize"
                value={form.prizePool}
                onChange={setText("prizePool")}
                type="number"
                min="0"
                placeholder="Optional"
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
            <Field label="Max participants" htmlFor="t-max">
              <Input
                id="t-max"
                value={form.maxParticipants}
                onChange={setText("maxParticipants")}
                type="number"
                min="1"
                placeholder="16"
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
            {form.tournamentType === "team" && (
              <Field label="Min team size" htmlFor="t-min">
                <Input
                  id="t-min"
                  value={form.minTeamSize}
                  onChange={setText("minTeamSize")}
                  type="number"
                  min="1"
                  placeholder="5"
                  className="h-9 border-border-default bg-elevated/40 text-xs"
                />
              </Field>
            )}
            {form.tournamentType === "team" && (
              <Field label="Max team size" htmlFor="t-max-team">
                <Input
                  id="t-max-team"
                  value={form.maxTeamSize}
                  onChange={setText("maxTeamSize")}
                  type="number"
                  min="1"
                  placeholder="11"
                  className="h-9 border-border-default bg-elevated/40 text-xs"
                />
              </Field>
            )}
            <Field label="Registration deadline" htmlFor="t-deadline">
              <DateTimeField
                id="t-deadline"
                value={form.registrationDeadline}
                onChange={(registrationDeadline) => setForm((f) => ({ ...f, registrationDeadline }))}
              />
            </Field>
            <Field label="Starts" htmlFor="t-start">
              <DateTimeField
                id="t-start"
                value={form.startDate}
                onChange={(startDate) => setForm((f) => ({ ...f, startDate }))}
              />
            </Field>
            <Field label="Ends" htmlFor="t-end">
              <DateTimeField
                id="t-end"
                value={form.endDate}
                onChange={(endDate) => setForm((f) => ({ ...f, endDate }))}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Rules" htmlFor="t-rules">
                <Textarea
                  id="t-rules"
                  value={form.rules}
                  onChange={setText("rules")}
                  rows={2}
                  className="border-border-default bg-elevated/40 text-xs"
                />
              </Field>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={saving} onClick={() => void create()}>
              {saving ? "Creating" : "Create tournament"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
