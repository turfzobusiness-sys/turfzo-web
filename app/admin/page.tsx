"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  MessageSquare,
  Calendar,
  Loader2,
  ArrowLeft,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Building2,
  AlertTriangle,
  Trophy,
  ChevronRight,
  Wallet,
  Store,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";
import { toast } from "sonner";
import { AdminAddOwnerForm } from "@/components/admin/admin-add-owner-form";

interface PendingOwner {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  phone_number?: string;
  city?: string;
  created_at: string;
  profile: {
    business_name?: string;
    gst_number?: string;
    pan_number?: string;
    onboarding_completed: boolean;
  } | null;
  turfs: Array<{
    id: string;
    name: string;
    status: string;
    price_per_hour: number;
  }>;
}

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  role: string;
  is_approved: boolean;
  city?: string;
  created_at: string;
}

/** A venue awaiting approval, as returned by `admin:listPendingTurfs`. */
interface AdminTurf {
  id: string;
  name: string;
  city: string;
  address: string;
  sport_type?: string;
  price_per_hour: number;
  image_url?: string;
  status?: string;
  created_at?: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_is_approved: boolean;
}

/** A payout row as returned by `payouts:listPayouts` (payment_orders with a
 *  payout_* status, joined to the owner's display fields). */
interface AdminPayout {
  _id: string;
  user_id?: string;
  owner_name: string | null;
  owner_email: string | null;
  amount: number;
  status: string;
  created_at: string;
  failure_reason: string | null;
  gateway_reference: string | null;
  utr: string | null;
}

const PAYOUT_STATUS_LABELS: Record<string, string> = {
  payout_pending: "Pending",
  payout_processing: "Processing",
  payout_completed: "Completed",
  payout_failed: "Failed",
  payout_rejected: "Rejected",
};

const PAYOUT_STATUS_COLORS: Record<string, string> = {
  payout_pending: "bg-warning/15 text-warning",
  payout_processing: "bg-violet-500/15 text-violet-500",
  payout_completed: "bg-emerald-500/15 text-emerald-500",
  payout_failed: "bg-error/15 text-error",
  payout_rejected: "bg-error/15 text-error",
};

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  created_at: string;
}

interface AdminTournament {
  _id: string;
  id: string;
  name: string;
  sport_type: string;
  tournament_type: string;
  entry_fee: number;
  prize_pool: number | null;
  max_participants: number;
  status: string;
  start_date: string;
}

const TOURNAMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  registration_open: "Open",
  open: "Open",
  registration_closed: "Closed",
  in_progress: "Live",
  completed: "Ended",
  cancelled: "Cancelled",
};

const TOURNAMENT_STATUS_COLORS: Record<string, string> = {
  draft: "bg-border-default text-text-muted",
  upcoming: "bg-sky-500/15 text-sky-500",
  registration_open: "bg-emerald-500/15 text-emerald-500",
  open: "bg-emerald-500/15 text-emerald-500",
  registration_closed: "bg-amber-500/15 text-amber-500",
  in_progress: "bg-violet-500/15 text-violet-500",
  completed: "bg-brand-lime/15 text-brand-lime",
  cancelled: "bg-error/15 text-error",
};

type Tab =
  | "pending"
  | "venues"
  | "users"
  | "payouts"
  | "messages"
  | "tournaments"
  | "add-owner";

export default function AdminPage() {
  const { status, convexUser, firebaseUser } = useAuth();
  const [tab, setTab] = useState<Tab>("pending");
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [pendingTurfs, setPendingTurfs] = useState<AdminTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = convexUser?.role === "admin";

  const fetchData = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      // Set state only after the first await so no setState happens
      // synchronously within the effect that calls this function.
      setLoading(true);
      setError(null);
      if (tab === "pending") {
        const data = await convexClient.query<PendingOwner[]>(
          "admin:listPendingOwners",
          {},
          token
        );
        setPendingOwners(data);
      } else if (tab === "venues") {
        const data = await convexClient.query<AdminTurf[]>(
          // Turf approval had no client at all — approveTurf/rejectTurf were
          // only reachable from `npx convex run`, so pending venues piled up.
          "admin:listPendingTurfs",
          { limit: 200 },
          token
        );
        setPendingTurfs(data ?? []);
      } else if (tab === "users") {
        const data = await convexClient.query<AdminUser[]>(
          // One admin user-listing query for both clients (admin:getUsers).
          // listAllUsers/getAllUsers were duplicates with different shapes.
          "admin:getUsers",
          { limit: 200 },
          token
        );
        setUsers(data);
      } else if (tab === "payouts") {
        const data = await convexClient.query<{ payouts: AdminPayout[] }>(
          "payouts:listPayouts",
          { limit: 100 },
          token
        );
        setPayouts(data?.payouts ?? []);
      } else if (tab === "tournaments") {
        const data = await convexClient.query<AdminTournament[]>(
          "tournaments:getAllTournaments",
          {},
          token
        );
        setTournaments(data ?? []);
      } else {
        const data = await convexClient.query<ContactMessage[]>(
          "admin:listContactMessages",
          {},
          token
        );
        setMessages(data);
      }
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setError(getErrorMessage(err, "Failed to load data. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [tab, firebaseUser]);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      // fetchData is async and its setState calls happen after an await.
      // Wrapping in an async IIFE makes that async boundary explicit so the
      // linter doesn't treat it as a synchronous setState-in-effect.
      void (async () => {
        await fetchData();
      })();
    }
  }, [status, isAdmin, fetchData]);

  const handleApprove = async (userId: string) => {
    if (!firebaseUser) return;
    setActionLoading(userId);
    try {
      const token = await firebaseUser.getIdToken();
      await convexClient.mutation(
        "admin:approveOwner",
        { userId },
        token
      );
      // Best-effort approval email — surfaced, never blocks the admin UI.
      try {
        await convexClient.action(
          "admin:sendOwnerDecisionEmail",
          { userId, decision: "approved" },
          token,
        );
      } catch (emailErr) {
        console.error("Approval email failed:", emailErr);
        toast.error("Owner approved, but the notification email failed to send.");
      }
      await fetchData();
      toast.success("Owner approved!");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setError(getErrorMessage(err, "Failed to approve. Please try again."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    if (!firebaseUser) return;
    setActionLoading(userId);
    try {
      const token = await firebaseUser.getIdToken();
      await convexClient.mutation(
        "admin:rejectOwner",
        { userId, reason },
        token
      );
      // Best-effort rejection email — surfaced, never blocks the admin UI.
      try {
        await convexClient.action(
          "admin:sendOwnerDecisionEmail",
          { userId, decision: "rejected", reason },
          token,
        );
      } catch (emailErr) {
        console.error("Rejection email failed:", emailErr);
        toast.error("Owner rejected, but the notification email failed to send.");
      }
      await fetchData();
      toast.success("Owner rejected.");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setError(getErrorMessage(err, "Failed to reject. Please try again."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveTurf = async (turfId: string) => {
    if (!firebaseUser) return;
    setActionLoading(turfId);
    try {
      const token = await firebaseUser.getIdToken();
      await convexClient.mutation("admin:approveTurf", { turfId }, token);
      await fetchData();
      toast.success("Venue approved and live.");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setError(getErrorMessage(err, "Failed to approve venue."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectTurf = async (turfId: string, reason: string) => {
    if (!firebaseUser) return;
    setActionLoading(turfId);
    try {
      const token = await firebaseUser.getIdToken();
      await convexClient.mutation(
        "admin:rejectTurf",
        { turfId, reason },
        token
      );
      await fetchData();
      toast.success("Venue rejected.");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setError(getErrorMessage(err, "Failed to reject venue."));
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Manual settlement override. The automated gateway crons drive the normal
   * path; this is the escape hatch for a transfer the gateway refused, a bank
   * change, or a support escalation — the reason `updatePayoutStatus` exists.
   */
  const handlePayoutStatus = async (
    payoutId: string,
    next: "payout_processing" | "payout_completed" | "payout_failed" | "payout_rejected"
  ) => {
    if (!firebaseUser) return;
    setActionLoading(payoutId);
    try {
      const token = await firebaseUser.getIdToken();
      await convexClient.mutation(
        "payouts:updatePayoutStatus",
        { payoutId, status: next },
        token
      );
      await fetchData();
      toast.success(`Payout marked ${PAYOUT_STATUS_LABELS[next].toLowerCase()}.`);
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setError(getErrorMessage(err, "Failed to update payout."));
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "initial" || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-8 h-8 text-brand-lime animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text-main p-6">
        <Shield className="w-16 h-16 text-text-muted mb-4" />
        <h1 className="font-sans text-2xl font-extrabold mb-2">Access denied</h1>
        <p className="text-text-muted text-sm mb-6">
          You need admin role to view this page.
        </p>
        <Link
          href="/"
          className="bg-brand-lime hover:bg-brand-lime-hover text-black font-semibold text-sm px-6 py-2.5 rounded-md"
        >
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-brand-lime text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-brand-lime/10 flex items-center justify-center border-2 border-brand-lime/30">
              <Shield className="w-6 h-6 text-brand-lime" />
            </div>
            <div>
              <h1 className="font-sans text-3xl font-extrabold">Admin Dashboard</h1>
              <p className="text-text-muted text-sm">
                Signed in as {convexUser?.email}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-border-default">
            <TabButton
              active={tab === "pending"}
              onClick={() => setTab("pending")}
              icon={<UserCheck className="w-4 h-4" />}
              label="Pending Approvals"
              badge={pendingOwners.length}
            />
            <TabButton
              active={tab === "venues"}
              onClick={() => setTab("venues")}
              icon={<Store className="w-4 h-4" />}
              label="Venues"
              badge={pendingTurfs.length}
            />
            <TabButton
              active={tab === "users"}
              onClick={() => setTab("users")}
              icon={<Users className="w-4 h-4" />}
              label="All Users"
            />
            <TabButton
              active={tab === "messages"}
              onClick={() => setTab("messages")}
              icon={<MessageSquare className="w-4 h-4" />}
              label="Contact Messages"
              badge={messages.filter((m) => m.status === "new").length}
            />
            <TabButton
              active={tab === "tournaments"}
              onClick={() => setTab("tournaments")}
              icon={<Trophy className="w-4 h-4" />}
              label="Tournaments"
            />
            <TabButton
              active={tab === "payouts"}
              onClick={() => setTab("payouts")}
              icon={<Wallet className="w-4 h-4" />}
              label="Payouts"
            />
            <TabButton
              active={tab === "add-owner"}
              onClick={() => setTab("add-owner")}
              icon={<Building2 className="w-4 h-4" />}
              label="Add Owner"
            />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 rounded-md p-4 mb-6 text-sm text-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-lime animate-spin" />
            </div>
          ) : tab === "pending" ? (
            <PendingOwnersList
              owners={pendingOwners}
              onApprove={handleApprove}
              onReject={handleReject}
              actionLoading={actionLoading}
            />
          ) : tab === "venues" ? (
            <PendingVenuesList
              venues={pendingTurfs}
              onApprove={handleApproveTurf}
              onReject={handleRejectTurf}
              actionLoading={actionLoading}
            />
          ) : tab === "users" ? (
            <UsersList users={users} />
          ) : tab === "payouts" ? (
            <PayoutsList
              payouts={payouts}
              onTransition={handlePayoutStatus}
              actionLoading={actionLoading}
            />
          ) : tab === "tournaments" ? (
            <TournamentsList tournaments={tournaments} />
          ) : tab === "add-owner" ? (
            <AdminAddOwnerForm onSuccess={() => setTab("pending")} />
          ) : (
            <MessagesList messages={messages} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
        active
          ? "text-brand-lime border-brand-lime"
          : "text-text-muted border-transparent hover:text-text-main"
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="bg-brand-lime text-black text-xs font-bold rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
    </button>
  );
}

function PendingOwnersList({
  owners,
  onApprove,
  onReject,
  actionLoading,
}: {
  owners: PendingOwner[];
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason: string) => void;
  actionLoading: string | null;
}) {
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (owners.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-md p-12 text-center">
        <CheckCircle className="w-12 h-12 text-brand-lime mx-auto mb-3" />
        <p className="text-text-main font-semibold">All caught up!</p>
        <p className="text-text-muted text-sm mt-1">No pending owner approvals.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {owners.map((owner) => (
          <div
            key={owner.id}
            className="bg-surface border border-border-subtle rounded-md p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-lime/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-brand-lime" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-text-main">
                      {owner.profile?.business_name || owner.display_name || owner.full_name || "Unknown"}
                    </h3>
                    <p className="text-xs text-text-muted">{owner.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted text-xs">Phone</span>
                    <p className="text-text-main">{owner.phone_number || "—"}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">City</span>
                    <p className="text-text-main">{owner.city || "—"}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">GST</span>
                    <p className="text-text-main font-mono text-xs">
                      {owner.profile?.gst_number || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">PAN</span>
                    <p className="text-text-main font-mono text-xs">
                      {owner.profile?.pan_number || "—"}
                    </p>
                  </div>
                </div>

                {owner.turfs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <span className="text-text-muted text-xs">Turfs</span>
                    <div className="mt-2 space-y-2">
                      {owner.turfs.map((turf) => (
                        <div
                          key={turf.id}
                          className="flex items-center justify-between bg-elevated rounded-md px-3 py-2"
                        >
                          <span className="text-sm text-text-main">{turf.name}</span>
                          <span className="text-xs text-text-muted">
                            ₹{turf.price_per_hour}/hr · {turf.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  Applied {new Date(owner.created_at).toLocaleDateString("en-IN")}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onApprove(owner.id)}
                  disabled={actionLoading === owner.id}
                  className="flex items-center gap-2 bg-brand-lime hover:bg-brand-lime-hover text-black font-semibold text-sm px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {actionLoading === owner.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => setRejectModal(owner.id)}
                  disabled={actionLoading === owner.id}
                  className="flex items-center gap-2 bg-error/10 hover:bg-error/20 text-error font-semibold text-sm px-4 py-2 rounded-md disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border-subtle rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-error" />
              <h3 className="font-sans font-bold text-lg text-text-main">Reject Owner</h3>
            </div>
            <p className="text-text-muted text-sm mb-4">
              Please provide a reason for rejection. This will be sent to the owner.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-elevated border border-border-subtle rounded-md px-4 py-3 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-brand-lime resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 border border-border-subtle rounded-md text-sm font-semibold text-text-muted hover:text-text-main"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectReason.trim()) {
                    onReject(rejectModal, rejectReason.trim());
                    setRejectModal(null);
                    setRejectReason("");
                  }
                }}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-error hover:bg-error/80 text-white font-semibold text-sm rounded-md disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MessagesList({ messages }: { messages: ContactMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-md p-12 text-center">
        <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">No messages yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className="bg-surface border border-border-subtle rounded-md p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-sans font-semibold text-sm text-text-main">
                {msg.subject || "General Inquiry"}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {msg.name} · {msg.email}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`px-2 py-1 rounded-md font-semibold ${
                  msg.status === "new"
                    ? "bg-brand-lime/10 text-brand-lime"
                    : "bg-white/5 text-text-muted"
                }`}
              >
                {msg.status}
              </span>
              <span className="text-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(msg.created_at).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>
          <p className="text-sm text-text-muted font-sans leading-relaxed whitespace-pre-wrap">
            {msg.message}
          </p>
          <a
            href={`mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent(`Re: ${msg.subject || "Your message to Turfzo"}`)}`}
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-brand-lime hover:underline"
          >
            <Mail className="w-3.5 h-3.5" />
            Reply via email
          </a>
        </div>
      ))}
    </div>
  );
}

function TournamentsList({ tournaments }: { tournaments: AdminTournament[] }) {
  if (tournaments.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-md p-12 text-center">
        <Trophy className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">No tournaments yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tournaments.map((t) => (
        <Link
          key={t.id}
          href={`/tournaments/manage/${t.id}`}
          className="bg-surface border border-border-subtle rounded-md p-5 shadow-card-shadow hover:border-border-strong transition-colors group"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-sans font-semibold text-text-main group-hover:text-brand-lime transition-colors truncate">
                {t.name}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                {t.sport_type} · {t.tournament_type}
              </p>
            </div>
            <span
              className={`shrink-0 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                TOURNAMENT_STATUS_COLORS[t.status] || "bg-border-default text-text-muted"
              }`}
            >
              {TOURNAMENT_STATUS_LABELS[t.status] || t.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Max {t.max_participants}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(t.start_date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              })}
            </span>
            {t.entry_fee > 0 && (
              <span className="inline-flex items-center gap-1">
                ₹{t.entry_fee} entry
              </span>
            )}
            <span className="inline-flex items-center gap-1 ml-auto text-brand-lime font-semibold">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function UsersList({ users }: { users: AdminUser[] }) {
  if (users.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-md p-12 text-center">
        <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">No users yet.</p>
      </div>
    );
  }
  return (
    <div className="bg-surface border border-border-subtle rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-elevated">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
              User
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
              Role
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
              Status
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
              Joined
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border-subtle">
              <td className="px-4 py-3">
                <div className="font-semibold text-text-main">
                  {u.full_name || u.display_name || "—"}
                </div>
                <div className="text-xs text-text-muted">{u.email}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  u.role === "admin"
                    ? "bg-brand-lime/10 text-brand-lime"
                    : u.role === "owner"
                    ? "bg-warning/10 text-warning"
                    : "bg-white/5 text-text-muted"
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                {u.is_approved ? (
                  <span className="text-brand-lime text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Approved
                  </span>
                ) : (
                  <span className="text-warning text-xs font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-text-muted text-xs">
                <Calendar className="w-3 h-3 inline mr-1" />
                {new Date(u.created_at).toLocaleDateString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayoutsList({
  payouts,
  onTransition,
  actionLoading,
}: {
  payouts: AdminPayout[];
  onTransition: (
    payoutId: string,
    next: "payout_processing" | "payout_completed" | "payout_failed" | "payout_rejected"
  ) => void;
  actionLoading: string | null;
}) {
  if (payouts.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-md p-12 text-center">
        <Wallet className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">No payouts yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {payouts.map((p) => {
        const canTransition =
          p.status === "payout_pending" || p.status === "payout_processing";
        const busy = actionLoading === p._id;
        return (
          <div
            key={p._id}
            className="bg-surface border border-border-subtle rounded-md p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-text-main truncate">
                  {p.owner_name || p.owner_email || p.user_id || "Unknown owner"}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {p.owner_email} · {new Date(p.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <span className="ml-auto font-sans text-lg font-extrabold text-brand-lime">
                ₹{Number(p.amount ?? 0).toLocaleString("en-IN")}
              </span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                  PAYOUT_STATUS_COLORS[p.status] || "bg-border-default text-text-muted"
                }`}
              >
                {PAYOUT_STATUS_LABELS[p.status] || p.status}
              </span>
            </div>

            {p.failure_reason && (
              <p className="mt-2 text-xs text-error flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {p.failure_reason}
              </p>
            )}

            {canTransition && (
              <div className="mt-3 flex flex-wrap gap-2">
                {p.status === "payout_pending" && (
                  <button
                    disabled={busy}
                    onClick={() => onTransition(p._id, "payout_processing")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50"
                  >
                    Mark processing
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => onTransition(p._id, "payout_completed")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-brand-lime text-black hover:bg-brand-lime-hover disabled:opacity-50"
                >
                  Mark paid
                </button>
                <button
                  disabled={busy}
                  onClick={() => onTransition(p._id, "payout_failed")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-error/15 text-error hover:bg-error/25 disabled:opacity-50"
                >
                  Mark failed
                </button>
                <button
                  disabled={busy}
                  onClick={() => onTransition(p._id, "payout_rejected")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white/5 text-text-muted hover:bg-white/10 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PendingVenuesList({
  venues,
  onApprove,
  onReject,
  actionLoading,
}: {
  venues: AdminTurf[];
  onApprove: (turfId: string) => void;
  onReject: (turfId: string, reason: string) => void;
  actionLoading: string | null;
}) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (venues.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-md p-12 text-center">
        <Store className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">No venues waiting for approval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {venues.map((v) => {
        const busy = actionLoading === v.id;
        return (
          <div
            key={v.id}
            className="bg-surface border border-border-subtle rounded-md p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text-main truncate">{v.name}</p>
              <p className="text-xs text-text-muted">
                {v.sport_type ? `${v.sport_type} · ` : ""}
                {v.city} · ₹{v.price_per_hour}/hr
              </p>
              <p className="text-xs text-text-muted mt-0.5 truncate">
                {v.owner_name || "Unknown owner"}
                {v.owner_email ? ` · ${v.owner_email}` : ""}
                {v.created_at
                  ? ` · submitted ${new Date(v.created_at).toLocaleDateString("en-IN")}`
                  : ""}
              </p>
              {!v.owner_is_approved && (
                <p className="text-xs text-warning mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Owner is not approved yet — approve the owner first.
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                disabled={busy || !v.owner_is_approved}
                onClick={() => onApprove(v.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-brand-lime text-black hover:bg-brand-lime-hover disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  setRejectId(v.id);
                  setRejectReason("");
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-error/10 text-error hover:bg-error/20 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border-subtle bg-surface p-5">
            <h3 className="font-sans font-bold text-lg text-text-main">
              Reject Venue
            </h3>
            <p className="text-xs text-text-muted mt-1 mb-3">
              The owner is notified with this reason. The venue is not deleted.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Photos are missing and the address does not match the map."
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectId(null);
                  setRejectReason("");
                }}
                className="rounded-md px-4 py-2 text-sm font-semibold text-text-muted hover:bg-elevated"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) return;
                  onReject(rejectId, rejectReason.trim());
                  setRejectId(null);
                  setRejectReason("");
                }}
                disabled={!rejectReason.trim()}
                className="rounded-md bg-error px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Reject Venue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
