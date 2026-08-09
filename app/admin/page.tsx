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
  _id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  role: string;
  is_approved: boolean;
  city?: string;
  created_at: string;
}

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  created_at: string;
}

type Tab = "pending" | "users" | "messages" | "add-owner";

export default function AdminPage() {
  const { status, convexUser, firebaseUser } = useAuth();
  const [tab, setTab] = useState<Tab>("pending");
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
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
      } else if (tab === "users") {
        const data = await convexClient.query<AdminUser[]>(
          "admin:listAllUsers",
          {},
          token
        );
        setUsers(data);
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
      // Best-effort approval email — never blocks the admin UI.
      void convexClient
        .action("admin:sendOwnerDecisionEmail", { userId, decision: "approved" }, token)
        .catch(() => {});
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
      // Best-effort rejection email — never blocks the admin UI.
      void convexClient
        .action(
          "admin:sendOwnerDecisionEmail",
          { userId, decision: "rejected", reason },
          token
        )
        .catch(() => {});
      await fetchData();
      toast.success("Owner rejected.");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setError(getErrorMessage(err, "Failed to reject. Please try again."));
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
          ) : tab === "users" ? (
            <UsersList users={users} />
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
            href={`mailto:${msg.email}?subject=Re: ${msg.subject || "Your message to Turfzo"}`}
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
            <tr key={u._id} className="border-t border-border-subtle">
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
