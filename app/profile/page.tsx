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
import Navbar from "@/components/Navbar";
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

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>My Profile | Turfzo</title>
        <meta name="description" content="Manage your Turfzo profile, view your bookings, and update your favorite sports." />
        <link rel="canonical" href="https://turfzo.com/profile" />
      </head>
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="mb-10">
            <span className="text-xs font-poppins font-extrabold tracking-widest text-brand-lime uppercase">
              MY PROFILE
            </span>
            <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main mt-2">
              Welcome, <span className="text-brand-lime">{convexUser?.display_name ?? convexUser?.email?.split("@")[0]}</span>
            </h1>
            <p className="mt-2 text-text-muted text-sm font-sans">
              Manage your account, view your bookings, and update preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-surface border border-border-default rounded-md p-6 shadow-card-shadow">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-poppins font-bold text-lg text-text-main flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-lime" /> Account
                  </h2>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-xs font-sans text-brand-lime hover:text-brand-lime-hover flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditMode(false)}
                        className="text-xs font-sans text-text-muted hover:text-text-main flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-xs font-sans text-brand-lime hover:text-brand-lime-hover flex items-center gap-1"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {saveError && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded text-error text-xs font-sans flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {saveError}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-muted uppercase font-sans font-semibold">Full Name</label>
                    {editMode ? (
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="bg-elevated border border-border-subtle rounded px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand-lime/30" />
                    ) : (
                      <div className="text-sm text-text-main font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-text-muted" /> {convexUser?.full_name ?? convexUser?.display_name ?? "—"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-muted uppercase font-sans font-semibold">Email</label>
                    <div className="text-sm text-text-muted flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {convexUser?.email ?? firebaseUser?.email}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-muted uppercase font-sans font-semibold">Phone</label>
                    {editMode ? (
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add phone"
                        className="bg-elevated border border-border-subtle rounded px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand-lime/30" />
                    ) : (
                      <div className="text-sm text-text-muted flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {convexUser?.phone_number ?? "Not added"}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-text-muted uppercase font-sans font-semibold">City</label>
                      {editMode ? (
                        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
                          className="bg-elevated border border-border-subtle rounded px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand-lime/30" />
                      ) : (
                        <div className="text-sm text-text-muted flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {convexUser?.city ?? "—"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-text-muted uppercase font-sans font-semibold">State</label>
                      {editMode ? (
                        <input value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State"
                          className="bg-elevated border border-border-subtle rounded px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand-lime/30" />
                      ) : (
                        <div className="text-sm text-text-muted">{convexUser?.state ?? "—"}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-text-muted uppercase font-sans font-semibold">Favorite Sports</label>
                    {editMode ? (
                      <div className="flex flex-wrap gap-2">
                        {FAVORITE_SPORTS.map((sport) => {
                          const isSelected = favoriteSports.includes(sport);
                          return (
                            <button
                              key={sport}
                              type="button"
                              onClick={() => toggleSport(sport)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-pill border transition-colors ${
                                isSelected
                                  ? "bg-brand-lime text-black border-brand-lime"
                                  : "bg-elevated text-text-muted border-border-subtle hover:text-text-main"
                              }`}
                            >
                              {sport}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(convexUser?.favorite_sports ?? []).length === 0 ? (
                          <span className="text-xs text-text-muted">No sports selected</span>
                        ) : (
                          convexUser?.favorite_sports?.map((s) => (
                            <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-pill bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={signOut}
                  className="w-full mt-6 bg-elevated hover:bg-error/10 border border-border-subtle hover:border-error/30 text-text-muted hover:text-error font-sans text-sm py-2.5 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-border-default rounded-md p-5 text-center">
                  <Ticket className="w-6 h-6 text-brand-lime mx-auto" />
                  <span className="block font-poppins font-extrabold text-2xl text-text-main mt-2">{upcomingBookings.length}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">Upcoming</span>
                </div>
                <div className="bg-surface border border-border-default rounded-md p-5 text-center">
                  <Check className="w-6 h-6 text-brand-lime mx-auto" />
                  <span className="block font-poppins font-extrabold text-2xl text-text-main mt-2">{pastBookings.length}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">Completed</span>
                </div>
                <div className="bg-surface border border-border-default rounded-md p-5 text-center">
                  <Trophy className="w-6 h-6 text-brand-lime mx-auto" />
                  <span className="block font-poppins font-extrabold text-2xl text-text-main mt-2">{bookings.length}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">Total</span>
                </div>
              </div>

              <div className="bg-surface border border-border-default rounded-md p-6 shadow-card-shadow">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-poppins font-bold text-lg text-text-main flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-brand-lime" /> Recent Bookings
                  </h2>
                  <Link href="/explore" className="text-xs font-sans text-brand-lime hover:text-brand-lime-hover flex items-center gap-1">
                    Book a new slot <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {loadingBookings ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 text-brand-lime animate-spin" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-3">
                    <Ticket className="w-10 h-10 text-text-muted opacity-50" />
                    <h3 className="font-poppins font-bold text-text-main">No bookings yet</h3>
                    <p className="text-xs text-text-muted font-sans">Your booked turfs will show up here.</p>
                    <Link href="/explore" className="bg-brand-lime text-black font-poppins font-bold text-xs py-2.5 px-6 rounded-pill">
                      Explore Turfs
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <motion.div
                        key={booking._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-elevated border border-border-subtle rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-poppins font-bold text-sm text-text-main">
                            Booking {booking.booking_code}
                          </span>
                          <div className="flex items-center gap-3 text-[11px] text-text-muted font-sans">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(booking.start_time).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(booking.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}
                            </span>
                            <span className="text-brand-lime font-bold">₹{booking.total_price.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded-pill border w-fit ${
                            booking.status === "confirmed" && new Date(booking.start_time) > new Date()
                              ? "bg-brand-lime/10 text-brand-lime border-brand-lime/20"
                              : booking.status === "cancelled"
                                ? "bg-error/10 text-error border-error/20"
                                : "bg-white/5 text-text-muted border-border-default"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
