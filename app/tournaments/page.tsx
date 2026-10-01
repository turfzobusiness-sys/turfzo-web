"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Calendar,
  MapPin,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  User,
  Phone,
  Mail,
  Loader2,
  Download,
  AlertCircle,
  Search,
  ShieldCheck,
  Zap,
  Info,
  Share2,
  Heart,
  Smartphone,
  Timer,
  RefreshCw,
} from "lucide-react";
import {
  GiSoccerBall,
  GiCricketBat,
  GiShuttlecock,
  GiTennisRacket,
  GiAmericanFootballBall,
} from "react-icons/gi";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { isViewOnlyMode } from "@/lib/env";
import { openCashfreeCheckout } from "@/lib/cashfree";
import { getLocalTournamentImage } from "@/lib/turf-images";
import { toast } from "sonner";

interface Tournament {
  _id: string;
  _creationTime: number;
  title: string;
  sport: string;
  format: string;
  description?: string;
  start_date: string;
  end_date?: string;
  venue: string;
  /** Backend returns null for a tournament with no linked venue. */
  city: string | null;
  entry_fee: number;
  prize_pool: string;
  max_teams: number;
  registered_teams: number;
  status: "upcoming" | "open" | "closed" | "live" | "completed";
  image_url?: string;
  created_at: string;
  /**
   * Backend discriminator for team-vs-solo registration. The list query
   * returns it; for older/other shapes we fall back to the raw
   * `max_team_size` / `tournament_type` fields, never to a regex over a
   * free-text label.
   */
  is_team?: boolean;
  max_team_size?: number | null;
  /** ISO timestamp after which the backend refuses registrations. */
  registration_deadline?: string | null;
}

interface MyRegistration {
  _id: string;
  registration_code?: string;
  team_name?: string | null;
  registration_type?: string;
  status: string;
  registered_at: string;
  /**
   * The backend nests the RAW tournament document (getMyRegistrations →
   * `{ ...tournament, id }`), so the name lives on `name`, not `title`.
   */
  tournament: (TournamentDocNested & { id: string }) | null;
}

interface TournamentDocNested {
  _id: string;
  name: string;
  sport_type: string;
  tournament_type: string;
  entry_fee: number;
  max_participants: number;
  min_team_size?: number;
  max_team_size?: number | null;
  registration_deadline: string;
  start_date: string;
  end_date: string;
  status: string;
  image_url?: string;
  description?: string;
}

interface TournamentTeam {
  _id: string;
  id: string;
  name: string;
  captain_id?: string;
  status: string;
}

interface TournamentParticipant {
  _id: string;
  id: string;
  user_id: string;
  user_name: string;
  status: string;
}

interface TournamentMatch {
  _id: string;
  id: string;
  round_number: number;
  match_number: number;
  participant1_id?: string;
  participant2_id?: string;
  team1_id?: string;
  team2_id?: string;
  winner_id?: string;
  winner_team_id?: string;
  score1?: string;
  score2?: string;
  status: string;
}

/**
 * Canonical team-vs-solo decision. The backend's discriminator is
 * `max_team_size != null` (surfaced as `is_team` on the list query) and its
 * own helper `isTeamTournamentType()` keys off `tournament_type`. The old
 * `/team/i.test(format)` regex matched a display label and mis-classified
 * events, so every registration call now goes through this one function.
 */
function resolveIsTeam(t: {
  is_team?: boolean;
  max_team_size?: number | null;
  format?: string;
  tournament_type?: string;
}): boolean {
  if (typeof t.is_team === "boolean") return t.is_team;
  if (t.max_team_size != null) return true;
  const type = (t.tournament_type ?? t.format ?? "").trim().toLowerCase();
  return type === "team" || type === "squad";
}

/** Registrations are refused by the backend once the deadline passes. */
function isRegistrationClosed(t: {
  status?: string;
  registration_deadline?: string | null;
}): boolean {
  if (t.status === "cancelled" || t.status === "completed") return true;
  if (!t.registration_deadline) return false;
  const deadline = new Date(t.registration_deadline).getTime();
  return Number.isFinite(deadline) && Date.now() > deadline;
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type RegStep = "closed" | "form" | "processing" | "confirmed" | "error";

/**
 * Registration-flow breadcrumbs. Dev-only: these log Cashfree order and
 * payment payloads, which must never reach a production browser console.
 */
function debugLog(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
}

/**
 * Strips a phone number to the bare 10-digit national format expected by
 * the registration form. The stored profile number is E.164 (+91...), but
 * the form and Cashfree require a 10-digit Indian mobile.
 */
function toNationalNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TournamentsQuerySync({
  onTournamentId,
}: {
  onTournamentId: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? searchParams.get("tournamentId");
  useEffect(() => {
    if (id) {
      onTournamentId(id.trim());
    }
  }, [id, onTournamentId]);
  return null;
}

export default function TournamentsPage() {
  const router = useRouter();
  const { status, firebaseUser, convexUser, getFreshToken } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [targetTournamentId, setTargetTournamentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [regStep, setRegStep] = useState<RegStep>("closed");
  const [regError, setRegError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  // Distinct from an empty result: a failed fetch must not read as
  // "no tournaments are open right now".
  const [listError, setListError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");

  const [registrationCode, setRegistrationCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [downloadQrUrl, setDownloadQrUrl] = useState("");
  /**
   * Whether the registration we just submitted is already ADMITTED. Paid
   * entries are approved by the verified payment; free entries stay
   * `pending` until the organizer approves them. Only an admitted
   * registration gets a pass.
   */
  const [regAdmitted, setRegAdmitted] = useState(false);
  /** Team vs solo for the registration in progress — one decision, used
      for labels, the form fields and which backend mutation is called. */
  const [regIsTeam, setRegIsTeam] = useState(false);

  const [myRegistrations, setMyRegistrations] = useState<MyRegistration[]>([]);
  const [myRegQrs, setMyRegQrs] = useState<Record<string, string>>({});

  /**
   * Real match / team / participant rows for the selected tournament — the
   * only source for the standings table. Stored under the id they belong to
   * so a stale set can never be rendered against a new selection (which
   * would otherwise need a synchronous clear inside the effect).
   */
  const [bracketData, setBracketData] = useState<{
    tournamentId: string | null;
    matches: TournamentMatch[];
    teams: TournamentTeam[];
    participants: TournamentParticipant[];
  }>({ tournamentId: null, matches: [], teams: [], participants: [] });

  const [searchSport, setSearchSport] = useState("all");
  const [searchCity, setSearchCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!targetTournamentId) return;
    if (tournaments.length > 0) {
      const match = tournaments.find((t) => t._id === targetTournamentId);
      if (match) {
        const timer = setTimeout(() => {
          setSelectedTournament(match);
          setViewMode("details");
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTargetTournamentId(null);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
    let cancelled = false;
    // `getTournamentById` returns the RAW tournaments document — the fields
    // are name / sport_type / tournament_type / max_participants, NOT the
    // title / sport / format / max_teams shape that only `getOpen` produces.
    // The old mapping read venue/city/current_participants off it, all of
    // which do not exist there, so the deep-linked card showed blanks.
    convexClient
      .query<TournamentDocNested | null>("tournaments:getTournamentById", {
        tournamentId: targetTournamentId,
      })
      .then(async (t) => {
        if (cancelled || !t) return;
        // The doc carries no venue name (that lives on the linked turf) and
        // no participant count, so fetch the registered-team count from the
        // teams list the backend exposes rather than inventing a number.
        let registered = 0;
        try {
          const teams = await convexClient.query<{ status: string }[]>(
            "tournaments:getTeams",
            { tournamentId: t._id },
          );
          registered = (teams ?? []).filter((tm) => tm.status === "approved")
            .length;
        } catch {
          // Fall through with 0 — the count is simply unknown.
        }
        if (cancelled) return;
        const mapped: Tournament = {
          _id: t._id,
          _creationTime: Date.now(),
          title: t.name,
          sport: t.sport_type,
          format: t.tournament_type,
          description: t.description,
          start_date: t.start_date,
          end_date: t.end_date,
          // No venue is resolvable from this document — say so instead of
          // inventing a stadium.
          venue: "Venue TBA",
          city: null,
          entry_fee: t.entry_fee,
          prize_pool: "Trophy",
          max_teams: t.max_participants,
          registered_teams: registered,
          status:
            t.status === "in_progress" || t.status === "ongoing"
              ? "live"
              : t.status === "cancelled" || t.status === "registration_closed"
                ? "closed"
                : t.status === "completed"
                  ? "completed"
                  : "upcoming",
          image_url: t.image_url,
          created_at: new Date().toISOString(),
          is_team: resolveIsTeam({
            max_team_size: t.max_team_size,
            tournament_type: t.tournament_type,
          }),
          max_team_size: t.max_team_size ?? null,
          registration_deadline: t.registration_deadline,
        };
        setSelectedTournament(mapped);
        setViewMode("details");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTargetTournamentId(null);
      })
      .catch((err) => console.error("Could not fetch target tournament:", err));
    return () => {
      cancelled = true;
    };
  }, [targetTournamentId, tournaments]);

  useEffect(() => {
    let cancelled = false;
    async function fetchTournaments() {
      setLoading(true);
      setListError(null);
      try {
        const data = await convexClient.query<Tournament[]>(
          "tournaments:getOpen",
          {},
        );
        if (cancelled) return;
        // NOTE: no mock fallback — mock mode is served by the mock
        // client (lib/mock-convex.ts); an empty live result means no
        // open tournaments right now.
        setTournaments(data ?? []);
        if (data && data.length > 0) {
          setSelectedTournament(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch tournaments:", err);
        if (cancelled) return;
        // An outage must not masquerade as "no tournaments are open" —
        // surface a retryable error state instead of an empty list.
        setListError(
          "We couldn't load tournaments right now. Please try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTournaments();
    return () => {
      cancelled = true;
    };
  }, [reloadNonce]);

  useEffect(() => {
    let cancelled = false;
    async function fetchMyRegistrations() {
      if (status !== "authenticated" || !convexUser) {
        setMyRegistrations([]);
        return;
      }
      try {
        const token = await getFreshToken();
        const data = await convexClient.query<MyRegistration[]>(
          "tournaments:getMyRegistrations",
          { userId: convexUser._id },
          token,
        );
        if (cancelled) return;
        setMyRegistrations(data ?? []);
        const qrs: Record<string, string> = {};
        for (const reg of data ?? []) {
          if (!reg.registration_code) continue;
          // The nested tournament is the RAW document — its name lives on
          // `name`. Reading `.title` here printed the literal fallback word
          // "Tournament" into every QR payload.
          const payload = JSON.stringify({
            code: reg.registration_code,
            tournament: reg.tournament?.name ?? "Tournament",
            team: reg.team_name ?? "Individual",
          });
          const { default: QRCode } = await import("qrcode");
          qrs[reg._id] = await QRCode.toDataURL(payload, {
            width: 256,
            margin: 1,
          });
        }
        if (!cancelled) setMyRegQrs(qrs);
      } catch (err) {
        console.error("Failed to fetch my registrations:", err);
      }
    }
    fetchMyRegistrations();
    return () => {
      cancelled = true;
    };
  }, [status, convexUser, getFreshToken]);

  // Standings are computed from real match results, so load the matches plus
  // the team/participant names they refer to whenever the selection changes.
  useEffect(() => {
    const id = selectedTournament?._id;
    if (!id) return;
    let cancelled = false;
    (async () => {
      const [m, t, p] = await Promise.all([
        convexClient
          .query<TournamentMatch[]>("tournaments:getMatches", {
            tournamentId: id,
          })
          .catch(() => [] as TournamentMatch[]),
        convexClient
          .query<TournamentTeam[]>("tournaments:getTeams", {
            tournamentId: id,
          })
          .catch(() => [] as TournamentTeam[]),
        convexClient
          .query<TournamentParticipant[]>(
            "tournaments:getTournamentParticipants",
            { tournamentId: id },
          )
          .catch(() => [] as TournamentParticipant[]),
      ]);
      if (cancelled) return;
      setBracketData({
        tournamentId: id,
        matches: m ?? [],
        teams: t ?? [],
        participants: p ?? [],
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedTournament?._id]);

  // Only ever read the rows that belong to the current selection. Wrapped
  // in useMemo so the identity is stable and does not churn the standings
  // memo below.
  const bracket = useMemo(
    () =>
      bracketData.tournamentId === selectedTournament?._id
        ? bracketData
        : { matches: [], teams: [], participants: [] },
    [bracketData, selectedTournament?._id],
  );

  const filteredTournaments = tournaments.filter((t) => {    const matchSport =
      searchSport === "all" ||
      t.sport.toLowerCase() === searchSport.toLowerCase();
    // `city` is null for a tournament with no linked venue — calling
    // .toLowerCase() on it white-screened the whole page.
    const matchCity =
      !searchCity || (t.city ?? "").toLowerCase().includes(searchCity.toLowerCase());
    const matchQuery =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSport && matchCity && matchQuery;
  });

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const viewOnly = isViewOnlyMode();
  const regInFlight = useRef(false);

  const handleOpenRegistration = (t: Tournament) => {
    if (viewOnly) return;
    if (status !== "authenticated") {
      router.push("/auth/login?redirect=/tournaments");
      return;
    }
    // The backend rejects registrations past the deadline, so don't let the
    // player fill in a form that can only fail.
    if (isRegistrationClosed(t)) {
      setSelectedTournament(t);
      setRegError("Registration for this tournament has closed.");
      setRegStep("error");
      return;
    }
    setSelectedTournament(t);
    setRegIsTeam(resolveIsTeam(t));
    if (convexUser) {
      setCaptainName(
        convexUser.full_name && convexUser.full_name.trim() !== ""
          ? convexUser.full_name
          : convexUser.display_name && convexUser.display_name.trim() !== ""
            ? convexUser.display_name
            : firebaseUser?.displayName
              ? firebaseUser.displayName
              : ((convexUser.email ?? firebaseUser?.email)?.split("@")[0] ??
                ""),
      );
      setCaptainEmail(convexUser.email ?? firebaseUser?.email ?? "");
      setCaptainPhone(
        toNationalNumber(convexUser.phone_number ?? ""),
      );
    }
    setRegError(null);
    setRegStep("form");
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    if (regInFlight.current) return;
    // One canonical team/solo decision (see resolveIsTeam) — the old
    // /team/i regex over the display label mis-classified solo events whose
    // label merely mentioned teams, sending them down the wrong mutation.
    const isTeamTourney = regIsTeam;
    if (
      !selectedTournament ||
      (isTeamTourney && !teamName) ||
      !captainName ||
      !captainEmail ||
      !captainPhone
    ) {
      setRegError(
        isTeamTourney
          ? "Please fill in all fields."
          : "Please fill in name, email and phone.",
      );
      return;
    }
    if (!/^\d{10}$/.test(captainPhone)) {
      setRegError("Please enter a valid 10-digit phone number.");
      return;
    }
    setRegStep("processing");
    setRegError(null);
    regInFlight.current = true;

    let paymentOrderId: string | undefined;
    let token: string | undefined;

    try {
      debugLog("[Tournament Reg] Step 0: Refreshing auth token...");
      token = await getFreshToken();
      debugLog("[Tournament Reg] Token refreshed:", token ? "yes" : "NO TOKEN");

      // Paid tournaments: order → Cashfree checkout → server-side
      // verification. Free tournaments (entry_fee = 0) skip payment — the
      // backend accepts registrations without a payment order for them.
      if (selectedTournament.entry_fee > 0) {
        // ── Step 1: Create a Cashfree order for the entry fee ──
        debugLog("[Tournament Reg] Step 1: Creating Cashfree order via payments:createTournamentOrder...");
        const order = await convexClient.action<{
          success: boolean;
          cf_order_id: string;
          payment_session_id: string;
          order_amount: number;
          error?: string;
        }>(
          "payments:createTournamentOrder",
          {
            tournament_id: selectedTournament._id,
            customer_name: captainName,
            customer_email: captainEmail,
            customer_phone: captainPhone,
          },
          token
        );
        debugLog("[Tournament Reg] Step 1 result:", order);
        if (!order.success || !order.payment_session_id) {
          throw new Error(order.error || "Failed to initialize payment session.");
        }

        // ── Step 2: Open the Cashfree checkout modal ──
        debugLog("[Tournament Reg] Step 2: Opening Cashfree checkout modal...");
        await openCashfreeCheckout({
          paymentSessionId: order.payment_session_id,
        });
        debugLog("[Tournament Reg] Step 2 complete: Cashfree checkout done.");

        // ── Step 3: Verify the payment server-side (single source of truth) ──
        debugLog("[Tournament Reg] Step 3: Verifying payment via payments:verifyTournamentCashfreePayment...");
        const verify = await convexClient.action<{
          success: boolean;
          payment_verified: boolean;
          payment_id?: string;
          error?: string;
        }>(
          "payments:verifyTournamentCashfreePayment",
          {
            cf_order_id: order.cf_order_id,
          },
          token
        );
        debugLog("[Tournament Reg] Step 3 result:", verify);
        if (!verify.success || !verify.payment_verified) {
          throw new Error(verify.error || "Payment verification failed.");
        }
        paymentOrderId = order.cf_order_id;
      }

      // ── Step 4: Register with the verified payment order ID ──
      // Team tournaments use tournaments:register, solo events use
      // tournaments:registerParticipant (backend enforces one path each).
      debugLog("[Tournament Reg] Step 4: Registering...");
      let registrationCode: string;
      if (isTeamTourney) {
        const registration = await convexClient.mutation<{
          registration_code: string;
          team_name: string;
          _id: string;
        }>(
          "tournaments:register",
          {
            tournament_id: selectedTournament._id,
            team_name: teamName,
            captain_name: captainName,
            captain_email: captainEmail,
            captain_phone: captainPhone,
            entry_fee_paid: selectedTournament.entry_fee,
            ...(paymentOrderId ? { payment_order_id: paymentOrderId } : {}),
          },
          token
        );
        debugLog("[Tournament Reg] Step 4 result:", registration);

        registrationCode = registration.registration_code;
        setRegistrationCode(registrationCode);
      } else {
        const registration = await convexClient.mutation<{
          registration_code: string;
        }>(
          "tournaments:registerParticipant",
          {
            tournamentId: selectedTournament._id,
            registrationType: "individual",
            ...(paymentOrderId ? { paymentOrderId } : {}),
          },
          token
        );
        debugLog("[Tournament Reg] Step 4 result:", registration);
        registrationCode = registration.registration_code;
        setRegistrationCode(registrationCode);
      }
      setTournaments((prev) =>
        prev.map((t) =>
          t._id === selectedTournament._id
            ? {
                ...t,
                registered_teams: Math.min(t.registered_teams + 1, t.max_teams),
              }
            : t,
        ),
      );
      setSelectedTournament((prev) =>
        prev
          ? {
              ...prev,
              registered_teams: Math.min(
                prev.registered_teams + 1,
                prev.max_teams,
              ),
            }
          : null,
      );

      // The backend stores free entries as `pending` (a verified payment is
      // the approval for paid entries). Only an admitted registration is an
      // entry pass — a pending one gets no QR at all.
      const admitted = selectedTournament.entry_fee > 0;
      setRegAdmitted(admitted);
      if (admitted) {
        const qrPayload = JSON.stringify({
          code: registrationCode,
          tournament: selectedTournament.title,
          team: isTeamTourney ? teamName : captainName,
        });
        const { default: QRCode } = await import("qrcode");
        const qrDataUrl = await QRCode.toDataURL(qrPayload, {
          width: 256,
          margin: 1,
        });
        setQrCodeUrl(qrDataUrl);
        setDownloadQrUrl(qrDataUrl);
      } else {
        setQrCodeUrl("");
        setDownloadQrUrl("");
      }
      setRegStep("confirmed");
    } catch (err) {
      console.error("[Tournament Reg] FAILED:", err);
      // SECURITY (T13): payment was verified but registration failed (full,
      // deadline, duplicate, etc.) — auto-refund the unconsumed entry fee so
      // the player's money isn't stuck.
      if (paymentOrderId) {
        // payments:refundTournamentEntry returns its outcome as a VALUE
        // ({ success, refund_status, refund_message }) for the pending /
        // already-requested / zero-amount cases and only throws when the
        // refund could not be submitted at all. The old code discarded the
        // result, so a refund that was merely PENDING was reported to the
        // player as if nothing had been done.
        let refundOutcome: {
          success?: boolean;
          refund_status?: string;
          refund_message?: string;
        } | null = null;
        try {
          refundOutcome = await convexClient.action<{
            success?: boolean;
            refund_status?: string;
            refund_message?: string;
          }>(
            "payments:refundTournamentEntry",
            { cf_order_id: paymentOrderId },
            token,
          );
        } catch (refundErr) {
          console.error(
            "[Tournament Reg] Refund request failed:",
            refundErr,
          );
          // SECURITY (T13): payment verified but registration failed AND the
          // auto-refund also failed — tell the player their money may be
          // stuck so they contact support instead of silently losing it.
          setRegError(
            "Your payment was collected but your registration could not be completed, and your entry fee refund could not be processed automatically. Please contact support for a manual refund.",
          );
          setRegStep("error");
          return;
        }
        if (refundOutcome && refundOutcome.success !== true) {
          // A definitive negative: no refund was recorded and none is queued.
          setRegError(
            refundOutcome.refund_message
              ? `Your payment was collected but the refund could not be completed: ${refundOutcome.refund_message} Please contact support for a manual refund.`
              : "Your payment was collected but your registration could not be completed, and the entry fee refund was rejected. Please contact support for a manual refund.",
          );
          setRegStep("error");
          return;
        }
        if (refundOutcome?.refund_status === "PENDING" || refundOutcome?.refund_status === "ONHOLD") {
          setRegError(
            `Your registration could not be completed, but your ${"₹"}${selectedTournament.entry_fee.toLocaleString("en-IN")} entry fee refund is ${refundOutcome.refund_status.toLowerCase()} at the payment gateway. It will reach your account in 5–7 business days — no further action is needed.`,
          );
          setRegStep("error");
          return;
        }
        if (refundOutcome?.refund_status === "SUCCESS") {
          setRegError(
            `Your registration could not be completed, and your ${"₹"}${selectedTournament.entry_fee.toLocaleString("en-IN")} entry fee has been refunded to your original payment method (5–7 business days).`,
          );
          setRegStep("error");
          return;
        }
        // A refund was already on record for this order — say so rather
        // than implying the player still has money in limbo.
        if (refundOutcome) {
          setRegError(
            `Your registration could not be completed. ${refundOutcome.refund_message ?? "A refund has already been requested for this payment."} If it does not arrive within 7 business days, contact support.`,
          );
          setRegStep("error");
          return;
        }
      }
      const { getErrorMessage } = await import("@/lib/errors");
      setRegError(
        getErrorMessage(err, "Registration failed. Please try again."),
      );
      setRegStep("error");
    } finally {
      regInFlight.current = false;
    }
  };

  const handleDownloadTicket = () => {
    if (!downloadQrUrl) return;
    const link = document.createElement("a");
    link.href = downloadQrUrl;
    link.download = `turfzo-tournament-${registrationCode}.png`;
    link.click();
  };

  // Switch to details page
  const openDetails = (t: Tournament) => {
    setSelectedTournament(t);
    setViewMode("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Standings computed from REAL match results (tournaments:getMatches).
   * Replaces a hardcoded five-row league table, a hardcoded "Golden Boot"
   * scorer list, a "4.9 · 12 tournament ratings" aggregate and a fabricated
   * survey-methodology sentence. A bye match is excluded: it records a
   * walkover, not a played game.
   */
  const tournamentStandings = useMemo(() => {
    if (!selectedTournament || bracket.matches.length === 0) return [] as {
      id: string;
      rank: number;
      name: string;
      played: number;
      won: number;
      lost: number;
    }[];
    const isTeamEvent = resolveIsTeam(selectedTournament);
    const rows = new Map<
      string,
      { id: string; name: string; played: number; won: number; lost: number }
    >();
    const ensure = (id?: string): string | null => {
      if (!id) return null;
      if (!rows.has(id)) {
        rows.set(id, {
          id,
          name: isTeamEvent
            ? (bracket.teams.find((t) => t.id === id || t._id === id)?.name ??
              "Team")
            : (bracket.participants.find(
                (p) => p.id === id || p._id === id,
              )?.user_name ?? "Player"),
          played: 0,
          won: 0,
          lost: 0,
        });
      }
      return id;
    };
    for (const m of bracket.matches) {
      if (m.status !== "completed") continue;
      const sideA = m.team1_id ?? m.participant1_id;
      const sideB = m.team2_id ?? m.participant2_id;
      // A bye has only one side — it is not a played fixture.
      if (!sideA || !sideB) continue;
      const a = ensure(sideA);
      const b = ensure(sideB);
      if (!a || !b) continue;
      const winner = m.winner_team_id ?? m.winner_id;
      if (!winner) continue;
      const aRow = rows.get(a)!;
      const bRow = rows.get(b)!;
      aRow.played += 1;
      bRow.played += 1;
      if (winner === a) aRow.won += 1;
      else if (winner === b) bRow.won += 1;
      if (winner !== a) aRow.lost += 1;
      if (winner !== b) bRow.lost += 1;
    }
    return [...rows.values()]
      .filter((r) => r.played > 0)
      .sort((x, y) => y.won - x.won || x.lost - y.lost || x.name.localeCompare(y.name))
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [selectedTournament, bracket]);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Suspense fallback={null}>
        <TournamentsQuerySync onTournamentId={setTargetTournamentId} />
      </Suspense>
      <Header />

      <main className="flex-grow pt-24 pb-16">
        {viewMode === "list" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative -mt-24 overflow-hidden min-h-[340px] sm:min-h-[400px] flex flex-col items-start justify-end mb-6"
          >
            {/* Background Image using Next.js Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/marketing/tournaments/tournament-hero.webp"
                alt=""
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority={false}
              />
              {/* Directional contrast overlay — deep black base ensures white text is vibrant in all modes */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/75 to-black/90" />
            </div>

            <div className="relative z-10 px-6 md:px-10 lg:px-20 max-w-[1760px] mx-auto w-full pb-10 sm:pb-14">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-3.5 h-3.5 text-brand-lime" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-lime">
                  Amateur &amp; Community Leagues
                </span>
              </div>
              <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Leagues &amp; Tournaments
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed">
                Register your team, track live tournament brackets, and compete on verified community turfs across your city.
              </p>
            </div>
          </motion.section>
        )}

        {/* ORGANIZER HIGHLIGHT SECTION */}
        {viewMode === "list" && (
          <section className="max-w-[1280px] mx-auto px-6 md:px-10 w-full mb-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-surface border border-border-default rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-lime/15 flex items-center justify-center">
                    <Trophy className="w-4.5 h-4.5 text-brand-lime" />
                  </div>
                  <h3 className="text-base font-bold text-text-main">
                    Organize Your Tournament
                  </h3>
                </div>
                <ul className="space-y-1.5 text-[13px] text-text-secondary">
                  {[
                    "Create tournaments with entry fees, team caps, sizes & rules",
                    "Auto single-elimination bracket generation",
                    "Full lifecycle management — open → in progress → completed",
                    "Entry-fee collection via Cashfree with auto-refund",
                    "Registration pass codes for controlled entry",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-lime flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => router.push("/tournaments/create")}
                className="flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-bold px-6 py-3 rounded-xl transition-colors text-sm cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                Create Tournament <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </section>
        )}

        <div className="max-w-[1280px] mx-auto px-6 md:px-10 w-full">
          {/* ========================================================
              VIEW 1: TOURNAMENTS LIST VIEW
              ======================================================== */}
          {viewMode === "list" && (
            <div>
              {/* Category Strip Row */}
              <div className="border-b border-border-default mt-2 mb-6">
                <div className="flex gap-10 overflow-x-auto scrollbar-none pb-0 justify-start sm:justify-center items-center">
                  {[
                    { id: "all", label: "All Sports", icon: Trophy },
                    { id: "Football", label: "Football", icon: GiSoccerBall },
                    { id: "Cricket", label: "Cricket", icon: GiCricketBat },
                    {
                      id: "Badminton",
                      label: "Badminton",
                      icon: GiShuttlecock,
                    },
                    { id: "Tennis", label: "Tennis", icon: GiTennisRacket },
                    {
                      id: "Multipurpose",
                      label: "Multipurpose",
                      icon: GiAmericanFootballBall,
                    },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isActive = searchSport === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSearchSport(s.id)}
                        className={`flex flex-col items-center gap-2 pb-3.5 cursor-pointer border-b-2 transition-all duration-200 relative -mb-[2px]
                          ${
                            isActive
                              ? "border-text-main text-text-main opacity-100 font-semibold"
                              : "border-transparent text-text-secondary hover:text-text-main"
                          }`}
                      >
                        <Icon className="w-7 h-7 shrink-0" />
                        <span className="text-[11px] font-medium tracking-wide">
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Filters and Count Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="text-sm text-text-muted font-medium">
                  {filteredTournaments.length} tournament
                  {filteredTournaments.length !== 1 ? "s" : ""} available
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* City filter */}
                  <div className="flex items-center gap-2 w-full sm:w-44 bg-surface border border-border-default rounded-xl px-3.5 py-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter city..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full bg-transparent text-xs text-text-main placeholder-text-muted focus:outline-none"
                    />
                    {searchCity && (
                      <button
                        onClick={() => setSearchCity("")}
                        className="text-text-muted hover:text-text-main"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Keyword Search */}
                  <div className="flex items-center gap-2 w-full sm:w-56 bg-surface border border-border-default rounded-xl px-3.5 py-2 shrink-0">
                    <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Search tournament name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-text-main placeholder-text-muted focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-text-muted hover:text-text-main"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* My Registrations — persisted tournament passes */}
              {myRegistrations.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-brand-lime" />
                      My Registrations
                    </h2>
                    {/* Pending entries are references, not passes — the
                        count must not imply every one is an admission pass. */}
                    <span className="text-xs text-text-muted font-medium">
                      {myRegistrations.length} registration
                      {myRegistrations.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myRegistrations.map((reg) => {
                      const t = reg.tournament;
                      return (
                        <div
                          key={reg._id}
                          className="bg-elevated border border-border-default rounded-xl p-5"
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-dashed border-border-strong mb-4">
                            <span className="font-extrabold text-brand-lime text-base tracking-wide">
                              {reg.registration_code ?? "No pass ID"}
                            </span>
                            <span className="bg-brand-lime text-white dark:text-black text-[9px] font-black px-2.5 py-1 rounded-md uppercase">
                              {reg.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            {reg.status === "approved" &&
                            myRegQrs[reg._id] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={myRegQrs[reg._id]}
                                alt="Tournament Pass QR"
                                className="w-28 h-28 rounded-xl bg-white p-1.5 border border-border-default shrink-0"
                              />
                            ) : (
                              <div className="w-28 h-28 rounded-xl border border-dashed border-border-strong flex flex-col items-center justify-center gap-1.5 bg-surface shrink-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                                  {reg.status === "approved"
                                    ? "Loading pass…"
                                    : reg.status === "rejected"
                                      ? "Rejected"
                                      : "Pending approval"}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                                Tournament
                              </span>
                              {/* The nested tournament is the RAW document
                                  — read `name`, not `title` (which is only
                                  on the getOpen shape). Reading `title`
                                  printed the literal word "Tournament". */}
                              <span className="font-bold text-text-main text-sm line-clamp-2">
                                {t?.name ?? "Tournament"}
                              </span>
                              <span className="block mt-1.5 text-[8px] text-text-muted uppercase tracking-wider font-bold">
                                {reg.team_name ? "Team" : "Entrant"}
                              </span>
                              <span className="font-semibold text-text-main text-xs truncate">
                                {reg.team_name ?? "Individual"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-default">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                              {reg.status === "approved"
                                ? "Scan at venue gate"
                                : reg.status === "rejected"
                                  ? "Not admitted — registration rejected"
                                  : "Admitted after organizer approval"}
                            </span>
                            {reg.status === "approved" && reg.registration_code && (
                              <a
                                href={myRegQrs[reg._id]}
                                download={`turfzo-pass-${reg.registration_code}.png`}
                                className="flex items-center gap-1.5 bg-text-main hover:bg-text-main/90 text-bg text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Pass
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tournament Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
                  <p className="text-sm text-text-muted">
                    Loading tournaments list...
                  </p>
                </div>
              ) : listError ? (
                // A failed fetch must not read as "no tournaments are open".
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-surface border border-red-500/25 rounded-xl text-center p-8">
                  <AlertCircle
                    className="w-14 h-14 text-red-400"
                    strokeWidth={1.2}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-text-main">
                      Couldn&apos;t load tournaments
                    </h3>
                    <p className="text-sm text-text-muted mt-1 max-w-sm">
                      {listError}
                    </p>
                  </div>
                  <button
                    onClick={() => setReloadNonce((n) => n + 1)}
                    className="mt-2 bg-text-main hover:bg-text-main/90 text-bg text-xs font-semibold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Try again
                  </button>
                </div>
              ) : filteredTournaments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-surface border border-border-default rounded-xl text-center p-8">
                  <Trophy
                    className="w-14 h-14 text-text-muted"
                    strokeWidth={1.2}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-text-main">
                      No tournaments found
                    </h3>
                    <p className="text-sm text-text-muted mt-1 max-w-sm">
                      We couldn&apos;t find any tournaments matching your
                      filters. Try resetting the search filters.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchSport("all");
                      setSearchCity("");
                      setSearchQuery("");
                    }}
                    className="mt-2 bg-text-main hover:bg-text-main/90 text-bg text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTournaments.map((t) => {
                    const spotsLeft = t.max_teams - t.registered_teams;
                    const isFull = spotsLeft <= 0;
                    const progressPercent =
                      (t.registered_teams / t.max_teams) * 100;
                    const inWishlist = wishlist.includes(t._id);
                    // Individual events count PLAYERS, not teams.
                    const isTeamEvent = resolveIsTeam(t);
                    const unit = isTeamEvent ? "team" : "participant";
                    const regClosed = isRegistrationClosed(t);

                    return (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => openDetails(t)}
                        className="bg-surface border border-border-default rounded-xl overflow-hidden hover:shadow-sm hover:border-border-strong transition-all duration-300 cursor-pointer group flex flex-col h-full relative"
                      >
                        {/* Wishlist and Share */}
                        <button
                          onClick={(e) => toggleWishlist(t._id, e)}
                          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 ${inWishlist ? "fill-brand-lime text-brand-lime" : "text-white"}`}
                          />
                        </button>

                        {/* Image banner */}
                        <div className="relative w-full h-48 bg-elevated overflow-hidden shrink-0">
                          <Image
                            src={getLocalTournamentImage(t)}
                            alt={t.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-brand-lime text-white dark:text-black text-[10px] font-extrabold px-2.5 py-1 rounded-md">
                              {t.sport} · {t.format}
                            </span>
                          </div>
                        </div>

                        {/* Card body content */}
                        <div className="p-5 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
                              <MapPin className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                              {/* city is null for an unlinked venue — render
                                  the venue name alone rather than "null". */}
                              <span className="truncate">
                                {[t.venue, t.city].filter(Boolean).join(", ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                              <Calendar className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                              <span>Starts {formatDate(t.start_date)}</span>
                            </div>
                            {t.registration_deadline && (
                              <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                                <Timer className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                                <span
                                  className={regClosed ? "text-error" : ""}
                                >
                                  {regClosed
                                    ? "Registration closed"
                                    : `Register by ${formatDeadline(t.registration_deadline)}`}
                                </span>
                              </div>
                            )}

                            <h3 className="text-lg font-bold text-text-main leading-tight mb-2 group-hover:text-brand-lime transition-colors duration-200">
                              {t.title}
                            </h3>

                            {/* Spot status indicator */}
                            <div className="mt-4 pt-1">
                              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                                <span className="text-text-muted">
                                  {isTeamEvent ? "Teams Registered" : "Participants Registered"}
                                </span>
                                <span className="text-text-main tabular-nums">
                                  {t.registered_teams}/{t.max_teams}
                                </span>
                              </div>
                              {/* Glowing green progress bar */}
                              <div className="h-2 w-full bg-border-default rounded-full overflow-hidden relative">
                                <div
                                  className="h-full bg-brand-lime rounded-full transition-all duration-500 relative"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <span className="block text-[10px] font-medium text-text-muted mt-1.5">
                                {isFull
                                  ? "Registration Closed"
                                  : regClosed
                                    ? "Registration Closed"
                                    : `${spotsLeft} ${unit} slot${spotsLeft === 1 ? "" : "s"} left`}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-border-default mt-5 pt-4 flex items-center justify-between">
                            <div>
                              <span className="block text-[9px] text-text-muted uppercase tracking-wider font-semibold">
                                Entry Fee
                              </span>
                              <span className="text-lg font-bold text-text-main tabular-nums">
                                ₹{t.entry_fee.toLocaleString("en-IN")}
                                <span className="text-xs text-text-muted font-normal ml-0.5">
                                  /{unit}
                                </span>
                              </span>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-text-main group-hover:text-brand-lime transition-colors duration-200">
                              View details{" "}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 2: AIRBNB-STYLE DETAILS VIEW
              ======================================================== */}
          {viewMode === "details" && selectedTournament && (
            <div>
              {/* Top Navigation breadcrumbs and share options */}
              <div className="flex items-center justify-between pb-6">
                <button
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-2 text-sm font-semibold text-text-main hover:text-brand-lime transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
                  Back to all tournaments
                </button>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  {/* Share was a dead button — wire it to the Web Share API
                      with a clipboard fallback. */}
                  <button
                    onClick={async () => {
                      const url = `${window.location.origin}/tournament/${selectedTournament._id}`;
                      const shareData = {
                        title: selectedTournament.title,
                        text: `${selectedTournament.title} on Turfzo`,
                        url,
                      };
                      if (navigator.share) {
                        try {
                          await navigator.share(shareData);
                          return;
                        } catch {
                          // User dismissed the share sheet — fall through to
                          // the clipboard copy instead of erroring.
                        }
                      }
                      try {
                        await navigator.clipboard.writeText(url);
                        toast.success("Link copied to clipboard");
                      } catch {
                        toast.error("Couldn't copy the link.");
                      }
                    }}
                    className="flex items-center gap-1.5 text-text-main hover:text-brand-lime transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button
                    onClick={(e) => toggleWishlist(selectedTournament._id, e)}
                    className="flex items-center gap-1.5 text-text-main hover:text-brand-lime transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${wishlist.includes(selectedTournament._id) ? "fill-brand-lime text-brand-lime" : ""}`}
                    />
                    {wishlist.includes(selectedTournament._id)
                      ? "Saved"
                      : "Save"}
                  </button>
                </div>
              </div>

              {/* Title Header */}
              <div className="pb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-main tracking-tight leading-tight">
                  {selectedTournament.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted mt-2">
                  {/* No tournament rating exists in the data — the previous
                      "4.9 · 12 reviews" was a hardcoded aggregate. */}
                  <span className="flex items-center gap-1 font-semibold text-text-main">
                    <MapPin className="w-3.5 h-3.5 text-brand-lime" />{" "}
                    {[selectedTournament.venue, selectedTournament.city]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  <span>·</span>
                  <span>
                    Starts {formatDate(selectedTournament.start_date)}
                  </span>
                  {selectedTournament.registration_deadline && (
                    <>
                      <span>·</span>
                      <span
                        className={
                          isRegistrationClosed(selectedTournament)
                            ? "text-error font-semibold"
                            : ""
                        }
                      >
                        {isRegistrationClosed(selectedTournament)
                          ? "Registration closed"
                          : `Register by ${formatDeadline(selectedTournament.registration_deadline)}`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Airbnb-style Photo Grid Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl overflow-hidden bg-elevated relative h-[300px] md:h-[420px]">
                {/* Left Large Photo */}
                <div className="md:col-span-2 relative h-full w-full overflow-hidden group">
                  <Image
                    src={getLocalTournamentImage(selectedTournament)}
                    alt={selectedTournament.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover group-hover:brightness-95 transition-all duration-300"
                  />
                </div>
                {/* Right stacked photos */}
                <div className="hidden md:flex flex-col gap-3 h-full">
                  <div className="relative flex-1 w-full overflow-hidden group">
                    <Image
                      src="/feature_verified.jpg"
                      alt="Verified turf conditions"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:brightness-95 transition-all duration-300"
                    />
                  </div>
                  <div className="relative flex-1 w-full overflow-hidden group">
                    <Image
                      src="/images/marketing/home/cta-floodlit-turf.webp"
                      alt="Floodlit community turf ground"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:brightness-95 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Show all photos floating button */}
                <button className="absolute bottom-6 right-6 bg-surface border border-border-strong text-text-main hover:bg-elevated transition-colors text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Info className="w-3.5 h-3.5" /> Show all photos
                </button>
              </div>

              {/* Airbnb-style Split Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 mt-8 items-start">
                {/* LEFT COLUMN: Tournament details info */}
                <div className="space-y-6">
                  {/* Overview details — every number read from the record. */}
                  <div className="pb-6 border-b border-border-default">
                    <h2 className="text-xl sm:text-2xl font-bold text-text-main">
                      {resolveIsTeam(selectedTournament)
                        ? `${selectedTournament.format} team tournament`
                        : `${selectedTournament.format} individual tournament`}
                    </h2>
                    <p className="text-text-muted mt-1 text-sm">
                      {selectedTournament.max_teams}{" "}
                      {resolveIsTeam(selectedTournament) ? "team" : "player"}{" "}
                      capacity ·{" "}
                      {selectedTournament.prize_pool === "Trophy"
                        ? "Trophy"
                        : `${selectedTournament.prize_pool} prize pool`}
                      {selectedTournament.max_team_size
                        ? ` · Up to ${selectedTournament.max_team_size} players per team`
                        : ""}
                    </p>
                  </div>

                  {/* How entry works — process facts only. "AIFF Certified
                      Referees" and the "Hosted by Turfzo Sports / Superhost /
                      Verified Host" identity had no source in the data. */}
                  <div className="pb-6 border-b border-border-default space-y-5">
                    <div className="flex items-start gap-4">
                      <Zap className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-text-main text-sm">
                          Entry pass
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          {selectedTournament.entry_fee > 0
                            ? "Paying the entry fee approves your entry immediately and issues a downloadable QR pass for the venue gate."
                            : "This is a free event. The organizer approves each entry, and your QR pass is issued once they do."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <ShieldCheck className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-text-main text-sm">
                          Registration reference
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Every entry gets a unique reference code. Quote it to
                          the organizer if they need to identify your
                          registration.
                        </p>
                      </div>
                    </div>
                    {selectedTournament.registration_deadline && (
                      <div className="flex items-start gap-4">
                        <Timer className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-text-main text-sm">
                            Registration deadline
                          </h4>
                          <p className="text-xs text-text-muted mt-0.5">
                            {isRegistrationClosed(selectedTournament)
                              ? "Registration has closed for this event."
                              : `Entries close on ${formatDeadline(selectedTournament.registration_deadline)}.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* About — the organizer's own description, or nothing. */}
                  {selectedTournament.description && (
                    <div className="pb-6 border-b border-border-default">
                      <h3 className="text-lg font-bold text-text-main mb-3">
                        About this tournament
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed whitespace-pre-line">
                        {selectedTournament.description}
                      </p>
                    </div>
                  )}
                  {/* Standings — derived from real match results via
                      tournaments:getMatches. The previous block was a fixed
                      league table, a fixed "Golden Boot" scorer list, a
                      hardcoded "4.9 · 12 tournament ratings" aggregate, a
                      fabricated survey-methodology sentence and a fixed amenity
                      grid — none of which existed in any backend response. */}
                  <div className="pb-6">
                    <h3 className="text-lg font-bold text-text-main mb-1">
                      Standings
                    </h3>
                    <p className="text-xs text-text-muted mb-5">
                      Calculated from completed matches in this tournament.
                    </p>
                    {tournamentStandings.length === 0 ? (
                      <p className="text-sm text-text-muted">
                        No completed matches yet — standings appear once the
                        organizer records results.
                      </p>
                    ) : (
                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="text-text-muted border-b border-border-default font-semibold text-[10px] uppercase tracking-wider">
                              <th className="pb-3 pr-2">#</th>
                              <th className="pb-3">
                                {resolveIsTeam(selectedTournament)
                                  ? "Team"
                                  : "Player"}
                              </th>
                              <th className="pb-3 text-center">P</th>
                              <th className="pb-3 text-center">W</th>
                              <th className="pb-3 text-center">L</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tournamentStandings.map((row) => (
                              <tr
                                key={row.id}
                                className="border-b border-border-subtle last:border-b-0"
                              >
                                <td className="py-3 font-bold text-text-muted pr-2 tabular-nums">
                                  {row.rank}
                                </td>
                                <td className="py-3 font-semibold text-text-main">
                                  {row.name}
                                </td>
                                <td className="py-3 text-center text-text-muted tabular-nums">
                                  {row.played}
                                </td>
                                <td className="py-3 text-center font-semibold text-brand-lime tabular-nums">
                                  {row.won}
                                </td>
                                <td className="py-3 text-center text-text-muted tabular-nums">
                                  {row.lost}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>


                {/* RIGHT COLUMN: Sticky Reservation card widget (Airbnb-style) */}
                <div className="sticky top-28 bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-4">
                  {/* Price info header — no invented rating aggregate. */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-text-main tabular-nums">
                        ₹{selectedTournament.entry_fee.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm text-text-muted font-medium ml-1">
                        / {resolveIsTeam(selectedTournament) ? "team" : "player"} entry
                      </span>
                    </div>
                  </div>

                  {/* Highlights overview card container */}
                  <div className="border border-border-strong rounded-xl overflow-hidden text-xs bg-bg divide-y divide-border-strong">
                    <div className="p-3">
                      <label className="block text-[8px] uppercase font-bold text-text-muted">
                        Venue &amp; Location
                      </label>
                      <span className="font-semibold text-text-main mt-0.5 block truncate">
                        {[selectedTournament.venue, selectedTournament.city]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-border-strong">
                      <div className="p-3">
                        <label className="block text-[8px] uppercase font-bold text-text-muted">
                          Match Format
                        </label>
                        <span className="font-semibold text-text-main mt-0.5 block">
                          {selectedTournament.format}
                        </span>
                      </div>
                      <div className="p-3">
                        <label className="block text-[8px] uppercase font-bold text-text-muted">
                          Tournament Sport
                        </label>
                        <span className="font-semibold text-text-main mt-0.5 block">
                          {selectedTournament.sport}
                        </span>
                      </div>
                    </div>
                    {selectedTournament.registration_deadline && (
                      <div className="p-3">
                        <label className="block text-[8px] uppercase font-bold text-text-muted">
                          Registration Closes
                        </label>
                        <span
                          className={`font-semibold mt-0.5 block ${
                            isRegistrationClosed(selectedTournament)
                              ? "text-error"
                              : "text-text-main"
                          }`}
                        >
                          {formatDeadline(selectedTournament.registration_deadline)}
                          {isRegistrationClosed(selectedTournament)
                            ? " · closed"
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Registered squads progress bar */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className="text-text-muted">
                        {resolveIsTeam(selectedTournament)
                          ? "Teams Registered"
                          : "Participants Registered"}
                      </span>
                      <span className="text-text-main tabular-nums">
                        {selectedTournament.registered_teams}/
                        {selectedTournament.max_teams}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-border-default rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-brand-lime rounded-full transition-all duration-500"
                        style={{
                          width: `${(selectedTournament.registered_teams / selectedTournament.max_teams) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Register Button */}
                  {selectedTournament.status === "closed" ||
                  selectedTournament.status === "completed" ||
                  isRegistrationClosed(selectedTournament) ? (
                    <div className="w-full bg-border-default text-text-muted font-bold text-sm py-3.5 rounded-xl cursor-not-allowed text-center">
                      Registration Closed
                    </div>
                  ) : viewOnly ? (
                    <div className="flex flex-col gap-2">
                      <a
                        href="https://play.google.com/store/apps/details?id=com.turfzo.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-extrabold text-sm py-3.5 rounded-xl transition-all duration-200 text-center cursor-pointer shadow-sm active:scale-[0.99] inline-flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-4 h-4" />
                        Register on the Turfzo App
                      </a>
                      <p className="text-center text-xs text-text-muted">
                        Tournament registrations are available on the Turfzo
                        app only.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenRegistration(selectedTournament)}
                      className="w-full bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-extrabold text-sm py-3.5 rounded-xl transition-all duration-200 text-center cursor-pointer shadow-sm active:scale-[0.99]"
                    >
                      {resolveIsTeam(selectedTournament)
                        ? "Register Team"
                        : "Register"}
                    </button>
                  )}

                  {/* subtext information — matches what the backend does. */}
                  <p className="text-center text-xs text-text-muted">
                    {selectedTournament.entry_fee > 0
                      ? "Instant confirmation — your pass is issued as soon as the payment clears."
                      : "Free entry — the organizer approves registrations, and your pass is issued after approval."}
                  </p>

                  <div className="border-t border-border-default my-4" />

                  {/* Fee breakdown. There is NO convenience fee on
                      tournament entries: the backend charges exactly
                      `entry_fee` (payments:createTournamentOrder derives the
                      order amount from it), so the old "convenience fee ₹0"
                      line is removed rather than restated. */}
                  <div className="space-y-2.5 text-sm text-text-muted">
                    <div className="flex justify-between">
                      <span className="underline">Entry fee</span>
                      <span className="text-text-main tabular-nums">
                        ₹{selectedTournament.entry_fee.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-text-main border-t border-border-default pt-2.5 text-base">
                      <span>Total payable</span>
                      <span className="tabular-nums">
                        ₹{selectedTournament.entry_fee.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Remaining slots alert */}
                  {selectedTournament.max_teams -
                    selectedTournament.registered_teams >
                    0 &&
                    !isRegistrationClosed(selectedTournament) && (
                    <div className="p-3 rounded-xl bg-brand-lime/10 border border-brand-lime/15 text-center text-xs font-semibold text-text-main flex items-center justify-center gap-1.5 mt-2">
                      <Info className="w-4 h-4 text-brand-lime shrink-0" />
                      Only{" "}
                      {selectedTournament.max_teams -
                        selectedTournament.registered_teams}{" "}
                      {resolveIsTeam(selectedTournament)
                        ? "team"
                        : "player"}{" "}
                      slot
                      {selectedTournament.max_teams -
                        selectedTournament.registered_teams ===
                      1
                        ? ""
                        : "s"}{" "}
                      left!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          REGISTRATION CHECKOUT MODALS
          ======================================================== */}
      <AnimatePresence>
        {regStep !== "closed" && selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setRegStep("closed")}
            />

            {/* Step 1: Data Input Form */}
            {regStep === "form" && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative bg-surface border border-border-default rounded-xl max-w-md w-full p-6 shadow-sm z-10 flex flex-col gap-4 text-left"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border-default">
                  <h3 className="text-lg font-bold text-text-main">
                    {regIsTeam ? "Team Registration" : "Individual Entry"}
                  </h3>
                  <button
                    onClick={() => setRegStep("closed")}
                    className="p-1 hover:bg-elevated rounded-full border border-border-default transition-colors text-text-muted hover:text-text-main"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center py-2 bg-elevated border border-border-default rounded-xl">
                  <span className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">
                    Tournament
                  </span>
                  <span className="font-bold text-text-main text-sm">
                    {selectedTournament.title}
                  </span>
                </div>

                {regError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {regError}
                  </div>
                )}

                <form
                  onSubmit={handleSubmitRegistration}
                  className="flex flex-col gap-4 text-xs font-medium"
                >
                  {/* Team Name — only a team event has one */}
                  {regIsTeam && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Team Name
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={50}
                        placeholder="Enter team / club name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="bg-bg border border-border-strong rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime transition-colors text-sm"
                      />
                    </div>
                  )}

                  {/* Captain Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {regIsTeam ? "Captain Name" : "Full Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={50}
                        placeholder={regIsTeam ? "Enter captain name" : "Enter your full name"}
                        value={captainName}
                        onChange={(e) => setCaptainName(e.target.value)}
                        className="w-full bg-bg border border-border-strong rounded-xl pl-10 pr-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        minLength={10}
                        maxLength={10}
                        placeholder="Enter 10-digit phone number"
                        value={captainPhone}
                        onChange={(e) =>
                          setCaptainPhone(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full bg-bg border border-border-strong rounded-xl pl-10 pr-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={captainEmail}
                        onChange={(e) => setCaptainEmail(e.target.value)}
                        className="w-full bg-bg border border-border-strong rounded-xl pl-10 pr-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="bg-elevated border border-border-default rounded-xl p-4 flex justify-between items-center mt-1">
                    <span className="text-sm font-semibold text-text-muted">
                      Total Entry Fee
                    </span>
                    <span className="text-lg font-bold text-text-main tabular-nums">
                      ₹{selectedTournament.entry_fee.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {selectedTournament.entry_fee === 0 && (
                    <p className="text-[10px] text-text-muted">
                      This entry is free. The organizer approves registrations
                      for free events, so your pass is issued after approval.
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-extrabold text-sm py-3.5 rounded-xl transition-all mt-2 cursor-pointer text-center shadow-sm active:scale-[0.99]"
                  >
                    {selectedTournament.entry_fee > 0
                      ? regIsTeam
                        ? "Pay & Register Team"
                        : "Pay & Register"
                      : regIsTeam
                        ? "Register Team"
                        : "Register"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Processing Loader */}
            {regStep === "processing" && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="relative bg-surface border border-border-default rounded-xl max-w-sm w-full p-8 shadow-sm z-10 flex flex-col items-center justify-center gap-4 text-center"
              >
                <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
                <h3 className="text-lg font-bold text-text-main">
                  Processing Registration
                </h3>
                <p className="text-xs text-text-muted">
                  {regIsTeam
                    ? "Booking your squad slot in the tournament bracket..."
                    : "Booking your slot in the tournament bracket..."}
                </p>
              </motion.div>
            )}

            {/* Step 3: Registration Confirmed Pass */}
            {regStep === "confirmed" && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="relative bg-surface border border-border-default rounded-xl max-w-md w-full p-6 shadow-sm z-10 text-center"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                    regAdmitted
                      ? "bg-brand-lime/10 border-brand-lime/20"
                      : "bg-amber-500/10 border-amber-500/25"
                  }`}
                >
                  {regAdmitted ? (
                    <Check className="w-8 h-8 text-brand-lime" strokeWidth={3} />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-text-main">
                  {regAdmitted
                    ? regIsTeam
                      ? "Team Registered!"
                      : "You’re Registered!"
                    : "Registration Submitted"}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {regAdmitted
                    ? regIsTeam
                      ? "Your team has successfully secured a tournament slot."
                      : "Your entry has successfully secured a tournament slot."
                    : "The organizer still has to approve this entry. Your pass is issued once they do — quote the reference below if they ask."}
                </p>

                {/* Registration receipt. This is a REFERENCE, not an
                    admission pass: the QR only appears for an admitted
                    registration. */}
                <div className="bg-bg border border-border-default rounded-xl p-5 mt-6 text-left relative overflow-hidden">
                  <div className="flex justify-between items-center pb-3 border-b border-dashed border-border-strong mb-4">
                    <div>
                      <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                        Registration Reference
                      </span>
                      <span className="font-extrabold text-brand-lime text-base tracking-wide">
                        {registrationCode}
                      </span>
                    </div>
                    <span className="bg-brand-lime text-white dark:text-black text-[9px] font-black px-2.5 py-1 rounded-md uppercase">
                      {regAdmitted
                        ? "Approved"
                        : selectedTournament.entry_fee > 0
                          ? "Paid"
                          : "Free"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                      Tournament
                    </span>
                    <span className="font-bold text-text-main text-sm">
                      {selectedTournament.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Team Name only exists for a team event — a solo
                        entry has no team, so the row is omitted. */}
                    {regIsTeam && (
                      <div>
                        <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                          Team Name
                        </span>
                        <span className="font-semibold text-text-main text-xs">
                          {teamName}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                        {regIsTeam ? "Captain" : "Entrant"}
                      </span>
                      <span className="font-semibold text-text-main text-xs">
                        {captainName}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                        Venue Arena
                      </span>
                      <span className="font-semibold text-text-main text-xs">
                        {selectedTournament.venue}
                      </span>
                    </div>
                  </div>

                  {/* QR pass — admitted registrations only. */}
                  {regAdmitted ? (
                    <div className="border-t border-dashed border-border-strong pt-4 flex flex-col items-center gap-2.5">
                      {qrCodeUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrCodeUrl}
                          alt="Tournament Pass QR"
                          className="w-28 h-28 rounded-xl bg-white p-1.5 border border-border-default"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-elevated animate-pulse rounded-xl" />
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                        Scan at venue gate to check in
                      </span>
                    </div>
                  ) : (
                    <div className="border-t border-dashed border-border-strong pt-4 flex flex-col items-center gap-2.5">
                      <div className="w-28 h-28 border border-dashed border-border-strong rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-text-muted" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted text-center">
                        No pass until the organizer approves
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  {regAdmitted && (
                    <button
                      onClick={handleDownloadTicket}
                      className="w-full bg-elevated border border-border-default hover:bg-bg text-text-main font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Digital Pass
                    </button>
                  )}
                  <button
                    onClick={() => setRegStep("closed")}
                    className="w-full bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Error Block */}
            {regStep === "error" && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="relative bg-surface border border-border-default rounded-xl max-w-md w-full p-6 shadow-sm z-10 text-center flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/25">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-main">
                  Registration Failed
                </h3>
                <p className="text-xs text-text-muted">{regError}</p>
                <div className="flex gap-3 mt-4 w-full justify-center text-xs font-semibold">
                  <button
                    onClick={() => setRegStep("form")}
                    className="bg-brand-lime hover:bg-brand-lime-hover text-white dark:text-black font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setRegStep("closed")}
                    className="bg-elevated border border-border-default text-text-main px-6 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
