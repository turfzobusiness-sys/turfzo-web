"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Edit2,
  Check,
  X,
  Trophy,
  Ticket,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";
import type { Booking, AppUser } from "@/lib/types";

const FAVORITE_SPORTS = ["Football", "Cricket", "Badminton", "Tennis", "Pickleball", "Multipurpose"];

export default function ProfilePage() {
  const router = useRouter();
  const { status, firebaseUser, convexUser, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);

  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/profile");
    }
  }, [status, router]);

  // Load bookings on mount when authenticated. setState calls happen inside
  // async callbacks (after the await), which is the correct pattern.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const data = await convexClient.query<Booking[]>("bookings:getMyBookings", {});
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (!cancelled) console.error("Failed to load bookings:", err);
      } finally {
        if (!cancelled) setLoadingBookings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Sync user fields into local form state when convexUser first arrives.
  // Only fires when the user identity changes to avoid clobbering user edits.
  useEffect(() => {
    if (convexUser && convexUser._id !== lastUserId.current) {
      lastUserId.current = convexUser._id;
      setFullName(convexUser.full_name ?? convexUser.display_name ?? "");
      setPhone(convexUser.phone_number ?? "");
      setCity(convexUser.city ?? "");
      setStateName(convexUser.state ?? "");
      setFavoriteSports(convexUser.favorite_sports ?? []);
    }
  }, [convexUser]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await convexClient.mutation<AppUser>("auth:updateProfile", {
        full_name: fullName,
        display_name: fullName,
        phone_number: phone || undefined,
        city: city || undefined,
        state: stateName || undefined,
        favorite_sports: favoriteSports.length > 0 ? favoriteSports : undefined,
      });
      setEditMode(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleSport = (sport: string) => {
    setFavoriteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  if (status === "initial" || status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.start_time) > new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || (b.status === "confirmed" && new Date(b.start_time) <= new Date())
  );

  const displayName =
    (convexUser?.display_name && convexUser.display_name.trim() !== "")
      ? convexUser.display_name
      : (convexUser?.full_name && convexUser.full_name.trim() !== "")
        ? convexUser.full_name
        : firebaseUser?.displayName
          ? firebaseUser.displayName
          : (convexUser?.email ?? firebaseUser?.email)?.split("@")[0] ?? "User";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = convexUser?.avatar_url || firebaseUser?.photoURL;

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main font-sans selection:bg-brand-lime/30">
      <Header />

      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8 w-full">

          {/* ── Banner ── */}
          <section className="relative rounded-2xl overflow-hidden mb-10 border border-border-default bg-surface">
            <div className="relative z-10 px-8 md:px-12 py-10 md:py-14 flex flex-col lg:flex-row lg:items-center gap-10">
              {/* avatar + info */}
              <div className="flex items-center gap-7 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-[108px] h-[108px] rounded-full p-1 bg-elevated border border-border-strong">
                    <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-[40px] font-extrabold text-text-main leading-none select-none overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                  </div>
                  <span className="absolute top-1 right-1 w-5 h-5 bg-brand-lime rounded-full border-[3px] border-surface flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                  </span>
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-text-main truncate leading-tight">
                    {displayName}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-5 gap-y-1 mt-3 text-sm text-text-muted">
                    <span className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 flex-shrink-0 opacity-60" />
                      {convexUser?.email ?? firebaseUser?.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0 opacity-60" />
                      {convexUser?.phone_number || "Not added"}
                    </span>
                  </div>

                  {/* actions */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-5">
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg border border-border-strong bg-bg/60 hover:bg-elevated transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditMode(false)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-border-default hover:bg-elevated transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-lg bg-brand-lime text-black hover:bg-brand-lime-hover disabled:opacity-60 transition-colors"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Save Changes
                        </button>
                      </>
                    )}
                    <button
                      onClick={signOut}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-error/25 text-error hover:bg-error/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* stats */}
              <div className="flex items-stretch gap-5 lg:gap-6 lg:pl-10 lg:border-l border-border-subtle flex-shrink-0">
                {[
                  { icon: Calendar, value: bookings.length, label: "Total Bookings" },
                  { icon: Clock, value: upcomingBookings.length, label: "Upcoming" },
                  { icon: Ticket, value: (convexUser?.favorite_sports?.length ?? 0), label: "Favourites" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-2 min-w-[72px]">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-elevated text-text-muted">
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-extrabold text-text-main leading-none">{s.value}</span>
                    <span className="text-[11px] text-text-muted font-medium tracking-wide">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {saveError && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {saveError}
            </div>
          )}

          {/* ── Edit Mode Fields ── */}
          {editMode && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 border border-border-default rounded-2xl bg-surface overflow-hidden"
            >
              <div className="px-8 py-7">
                <h2 className="text-base font-bold text-text-main mb-6 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-lime" /> Edit Personal Info
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: "Full Name", icon: User, value: fullName, setter: setFullName, placeholder: "Your name" },
                    { label: "Phone", icon: Phone, value: phone, setter: setPhone, placeholder: "+91 98765 43210" },
                    { label: "City", icon: MapPin, value: city, setter: setCity, placeholder: "e.g. Hyderabad" },
                    { label: "State", icon: MapPin, value: stateName, setter: setStateName, placeholder: "e.g. Telangana" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{f.label}</label>
                      <div className="relative">
                        <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60" />
                        <input
                          value={f.value}
                          onChange={(e) => f.setter(e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full bg-elevated border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-lime/30 focus:border-brand-lime/40 transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Favourite Sports</label>
                  <div className="flex flex-wrap gap-2.5">
                    {FAVORITE_SPORTS.map((sport) => {
                      const on = favoriteSports.includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSport(sport)}
                          className={`text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-200 ${
                            on
                              ? "bg-brand-lime text-black border-brand-lime font-semibold shadow-sm"
                              : "bg-bg border-border-default text-text-muted hover:border-border-strong hover:text-text-main"
                          }`}
                        >
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── Tabs ── */}
          <nav className="flex gap-1 border-b border-border-subtle mb-10 overflow-x-auto no-scrollbar -mx-1 px-1">
            {["Bookings", "Reviews", "Favourites", "Payment Methods", "Settings"].map((tab, i) => (
              <button
                key={tab}
                className={`relative pb-3.5 pt-1 px-4 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-lg ${
                  i === 0
                     ? "text-brand-lime"
                     : "text-text-muted hover:text-text-main hover:bg-elevated/50"
                }`}
              >
                {tab}
                {i === 0 && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand-lime rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* ── Content Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left: Bookings list */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border-subtle">
                <h2 className="text-lg font-bold text-text-main">Recent Bookings</h2>
                <Link href="/explore" className="text-sm font-semibold text-brand-lime hover:text-brand-lime-hover flex items-center gap-1.5 group">
                  View all bookings <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {loadingBookings ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <Loader2 className="w-7 h-7 text-brand-lime animate-spin" />
                  <span className="text-sm text-text-muted">Loading bookings…</span>
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mb-4">
                    <Ticket className="w-6 h-6 text-text-muted/60" />
                  </div>
                  <h3 className="font-bold text-text-main text-base mb-1">No bookings yet</h3>
                  <p className="text-sm text-text-muted max-w-xs mb-6">Book your first turf and it&apos;ll show up here.</p>
                  <Link href="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-lime hover:bg-brand-lime-hover text-black font-bold text-sm rounded-lg transition-colors shadow-sm">
                    Explore Turfs <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {bookings.slice(0, 5).map((booking) => {
                    const isUpcoming = booking.status === "confirmed" && new Date(booking.start_time) > new Date();
                    const isCancelled = booking.status === "cancelled";
                    const statusText = isUpcoming ? "Upcoming" : booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
                    const statusColor = isUpcoming ? "text-brand-lime bg-brand-lime/10" : isCancelled ? "text-error bg-error/10" : "text-text-muted bg-elevated";

                    return (
                      <div
                        key={booking._id}
                        className="py-4 flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center flex-shrink-0 text-text-muted/50">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-text-main group-hover:text-brand-lime transition-colors">
                              Booking #{booking.booking_code}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                              <span>{new Date(booking.start_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              <span>•</span>
                              <span>{new Date(booking.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-sm font-semibold text-text-main">₹{booking.total_price.toLocaleString("en-IN")}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColor}`}>
                            {statusText}
                          </span>
                          <ArrowRight className="w-4 h-4 text-text-muted/30 group-hover:text-text-muted transition-colors group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-8">
              {/* Account Summary */}
              <div>
                <h2 className="text-base font-bold text-text-main mb-5 pb-2 border-b border-border-subtle">Account Summary</h2>
                <div className="flex flex-col gap-3.5">
                  {[
                    { label: "Member Since", value: new Date(convexUser?._creationTime ?? Date.now()).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) },
                    { label: "Total Bookings", value: String(bookings.length) },
                    { label: "Total Spent", value: `₹${bookings.reduce((acc, b) => acc + (b.status !== "cancelled" ? b.total_price : 0), 0).toLocaleString("en-IN")}` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center text-sm">
                      <span className="text-text-muted">{row.label}</span>
                      <span className="font-semibold text-text-main">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-border-subtle">
                    <span className="text-text-muted">Wallet Balance</span>
                    <span className="font-bold text-brand-lime text-base">₹0</span>
                  </div>
                </div>
              </div>

              {/* Favourite Sports */}
              {!editMode && (convexUser?.favorite_sports?.length ?? 0) > 0 && (
                <div>
                  <h2 className="text-base font-bold text-text-main mb-4 pb-2 border-b border-border-subtle">Favourite Sports</h2>
                  <div className="flex flex-wrap gap-2">
                    {convexUser?.favorite_sports?.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-elevated text-text-main">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
