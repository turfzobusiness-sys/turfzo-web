"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  MessageSquare,
  Calendar,
  Loader2,
  ArrowLeft,
  Mail,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";

interface AdminUser {
  _id: string;
  email: string;
  full_name?: string;
  role: string;
  is_approved: boolean;
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

type Tab = "users" | "messages";

export default function AdminPage() {
  const router = useRouter();
  const { status, convexUser, firebaseUser } = useAuth();
  const [tab, setTab] = useState<Tab>("messages");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = convexUser?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/admin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = firebaseUser ? await firebaseUser.getIdToken() : undefined;
        if (tab === "users") {
          const data = await convexClient.query<AdminUser[]>(
            "auth:listAllUsers",
            { limit: 50 },
            token
          );
          if (!cancelled) setUsers(data);
        } else {
          const data = await convexClient.query<ContactMessage[]>(
            "contact:listContactMessages",
            { limit: 50 },
            token
          );
          if (!cancelled) setMessages(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, isAdmin, tab, firebaseUser]);

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
        <h1 className="font-poppins text-2xl font-extrabold mb-2">Access denied</h1>
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
      <Navbar />
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
              <h1 className="font-poppins text-3xl font-extrabold">Admin Dashboard</h1>
              <p className="text-text-muted text-sm">
                Signed in as {convexUser?.email}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-border-default">
            <TabButton
              active={tab === "messages"}
              onClick={() => setTab("messages")}
              icon={<MessageSquare className="w-4 h-4" />}
              label="Contact Messages"
              badge={messages.filter((m) => m.status === "new").length}
            />
            <TabButton
              active={tab === "users"}
              onClick={() => setTab("users")}
              icon={<Users className="w-4 h-4" />}
              label="Users"
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
          ) : tab === "messages" ? (
            <MessagesList messages={messages} />
          ) : (
            <UsersList users={users} />
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
              <h3 className="font-poppins font-semibold text-sm text-text-main">
                {msg.subject || "General Inquiry"}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {msg.name} · {msg.email}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`px-2 py-1 rounded-pill font-semibold ${
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
                  {u.full_name || "—"}
                </div>
                <div className="text-xs text-text-muted">{u.email}</div>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-white/5 rounded text-xs font-semibold">
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                {u.is_approved ? (
                  <span className="text-brand-lime text-xs font-semibold">
                    Approved
                  </span>
                ) : (
                  <span className="text-warning text-xs font-semibold">
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
