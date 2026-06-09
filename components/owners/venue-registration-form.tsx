"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbUser,
  TbPhone,
  TbMail,
  TbMapPin,
  TbBuilding,
  TbClock,
  TbCheck,
  TbArrowRight,
  TbArrowLeft,
  TbCircleCheck,
  TbAlertCircle,
} from "react-icons/tb";
import { HiSparkles } from "react-icons/hi2";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";

const SPORTS_OPTIONS = [
  { id: "football", label: "Football" },
  { id: "cricket", label: "Cricket Nets" },
  { id: "badminton", label: "Badminton" },
  { id: "tennis", label: "Tennis" },
  { id: "volleyball", label: "Volleyball" },
  { id: "basketball", label: "Basketball" },
];

const AMENITIES_OPTIONS = [
  { id: "floodlights", label: "Floodlights" },
  { id: "changing_rooms", label: "Changing Rooms" },
  { id: "showers", label: "Showers" },
  { id: "parking", label: "Parking Space" },
  { id: "restrooms", label: "Restrooms" },
  { id: "water", label: "Drinking Water" },
  { id: "lockers", label: "Lockers" },
  { id: "first_aid", label: "First Aid" },
  { id: "cafeteria", label: "Cafeteria" },
];

export function VenueRegistrationForm() {
  const { firebaseUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | "success">(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [groundCount, setGroundCount] = useState("1");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [operatingHours, setOperatingHours] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputBase =
    "w-full bg-gray-50/80 dark:bg-[#1a1a1a] border rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/20 transition-all";
  const inputError = "border-red-400 dark:border-red-500";
  const inputNormal = "border-gray-200 dark:border-[#3a3a3a]";

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!ownerName.trim()) newErrors.ownerName = "Full name is required";
      if (!phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\+?[0-9\s-]{10,14}$/.test(phone.trim())) {
        newErrors.phone = "Please enter a valid phone number";
      }
      if (!email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!city.trim()) newErrors.city = "City is required";
    }

    if (currentStep === 2) {
      if (!venueName.trim()) newErrors.venueName = "Venue name is required";
      if (!address.trim()) newErrors.address = "Full address is required";
      if (selectedSports.length === 0) newErrors.sports = "Select at least one supported sport";
    }

    if (currentStep === 3) {
      if (!operatingHours.trim()) newErrors.operatingHours = "Operating hours are required (e.g. 6 AM - 11 PM)";
      if (!basePrice.trim()) {
        newErrors.basePrice = "Base price per hour is required";
      } else if (isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
        newErrors.basePrice = "Please enter a valid positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step as number)) {
      if (step === 1) setStep(2);
      else if (step === 2) setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId) ? prev.filter((s) => s !== sportId) : [...prev, sportId]
    );
    if (errors.sports) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.sports;
        return copy;
      });
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    if (!turnstileToken) {
      setErrorMsg("Please complete the bot check before submitting.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const sportsString = selectedSports
      .map((s) => {
        const match = SPORTS_OPTIONS.find((o) => o.id === s);
        return match ? match.label : s;
      })
      .join(", ");

    const amenitiesString =
      selectedAmenities
        .map((a) => {
          const match = AMENITIES_OPTIONS.find((o) => o.id === a);
          return match ? match.label : a;
        })
        .join(", ") || "None";

    const formattedMessage = `### PARTNER ONBOARDING REGISTRATION

**Owner Details:**
- **Name:** ${ownerName}
- **Phone:** ${phone}
- **Email:** ${email}
- **Target City:** ${city}

**Venue Details:**
- **Venue Name:** ${venueName}
- **Venue Address:** ${address}
- **Number of Grounds/Courts:** ${groundCount}
- **Supported Sports:** ${sportsString}
- **Available Amenities:** ${amenitiesString}

**Operational details:**
- **Operating Hours:** ${operatingHours}
- **Expected Base Price:** ₹${basePrice}/hour

**Additional Notes:**
${additionalNotes ? additionalNotes.trim() : "None provided."}`;

    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : undefined;

      await convexClient.mutation(
        "contact:submitContact",
        {
          name: ownerName,
          email: email,
          subject: `Partner Onboarding: ${venueName}`,
          message: formattedMessage,
          turnstileToken,
        },
        token
      );

      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-[#3a3a3a] rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none">
      {step !== "success" && (
        <div className="mb-8">
          <div className="flex justify-between items-center text-[11px] font-semibold tracking-widest text-gray-500 dark:text-gray-400 mb-3 uppercase">
            <span>Step {step} of 3</span>
            <span className="text-[#4ADE80]">
              {step === 1 ? "Profile" : step === 2 ? "Venue" : "Pricing & Review"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden flex">
            <motion.div
              className="h-full bg-[#4ADE80] rounded-full"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
          <TbAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Owner Profile</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Introduce yourself and your business email so we can verify your credentials.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <TbUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => {
                      setOwnerName(e.target.value);
                      if (errors.ownerName) setErrors((prev) => ({ ...prev, ownerName: "" }));
                    }}
                    placeholder="John Doe"
                    className={`${inputBase} ${errors.ownerName ? inputError : inputNormal}`}
                  />
                </div>
                {errors.ownerName && <p className="text-xs text-red-500 mt-1">{errors.ownerName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <TbPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="+91 98765 43210"
                      className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <TbMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="john@example.com"
                      className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <div className="relative">
                  <TbMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    placeholder="Bengaluru"
                    className={`${inputBase} ${errors.city ? inputError : inputNormal}`}
                  />
                </div>
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#4ADE80] hover:bg-[#16A34A] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-1.5"
              >
                Next Step <TbArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Venue Specifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tell us about your sports complex, courts, and supported amenities.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Venue Name
                </label>
                <div className="relative">
                  <TbBuilding className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => {
                      setVenueName(e.target.value);
                      if (errors.venueName) setErrors((prev) => ({ ...prev, venueName: "" }));
                    }}
                    placeholder="Turfzo Arena HSR"
                    className={`${inputBase} ${errors.venueName ? inputError : inputNormal}`}
                  />
                </div>
                {errors.venueName && <p className="text-xs text-red-500 mt-1">{errors.venueName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Full Address
                  </label>
                  <div className="relative">
                    <TbMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
                      }}
                      placeholder="100 Feet Rd, HSR Layout"
                      className={`${inputBase} ${errors.address ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Grounds/Courts
                  </label>
                  <select
                    value={groundCount}
                    onChange={(e) => setGroundCount(e.target.value)}
                    className="w-full bg-gray-50/80 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3a3a3a] rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/20 h-[46px] transition-all"
                  >
                    <option value="1">1 Ground</option>
                    <option value="2">2 Grounds</option>
                    <option value="3">3 Grounds</option>
                    <option value="4">4 Grounds</option>
                    <option value="5+">5+ Grounds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2.5">
                  Supported Sports
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SPORTS_OPTIONS.map((sport) => {
                    const active = selectedSports.includes(sport.id);
                    return (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => toggleSport(sport.id)}
                        className={`py-3 px-4 rounded-xl border text-left text-sm flex items-center justify-between transition-all duration-200 ${
                          active
                            ? "bg-[#4ADE80]/10 border-[#4ADE80] text-[#4ADE80] font-bold"
                            : "bg-gray-50/80 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#3a3a3a] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <span>{sport.label}</span>
                        {active && <TbCheck className="w-4 h-4 text-[#4ADE80] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
                {errors.sports && <p className="text-xs text-red-500 mt-1.5">{errors.sports}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2.5">
                  Available Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AMENITIES_OPTIONS.map((amenity) => {
                    const active = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`py-3 px-4 rounded-xl border text-left text-sm flex items-center justify-between transition-all duration-200 ${
                          active
                            ? "bg-[#4ADE80]/10 border-[#4ADE80]/50 text-gray-900 dark:text-white font-semibold"
                            : "bg-gray-50/80 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#3a3a3a] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <span className="truncate">{amenity.label}</span>
                        {active && <TbCheck className="w-3.5 h-3.5 text-[#4ADE80] stroke-[2]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3a3a3a] text-gray-600 dark:text-gray-400 font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-[#282828] hover:text-gray-900 dark:hover:text-white"
              >
                <TbArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#4ADE80] hover:bg-[#16A34A] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-1.5"
              >
                Next Step <TbArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Operations & Pricing</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter scheduling timings, base rates, and complete the check to submit.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Operating Hours
                  </label>
                  <div className="relative">
                    <TbClock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => {
                        setOperatingHours(e.target.value);
                        if (errors.operatingHours) setErrors((prev) => ({ ...prev, operatingHours: "" }));
                      }}
                      placeholder="6 AM - 11 PM"
                      className={`${inputBase} ${errors.operatingHours ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.operatingHours && <p className="text-xs text-red-500 mt-1">{errors.operatingHours}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Base Price per Hour (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">₹</span>
                    <input
                      type="text"
                      value={basePrice}
                      onChange={(e) => {
                        setBasePrice(e.target.value);
                        if (errors.basePrice) setErrors((prev) => ({ ...prev, basePrice: "" }));
                      }}
                      placeholder="1200"
                      className={`w-full bg-gray-50/80 dark:bg-[#1a1a1a] border rounded-xl py-3 pl-9 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/20 transition-all ${
                        errors.basePrice ? inputError : inputNormal
                      }`}
                    />
                  </div>
                  {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Tell us about special pricing, tournament setups, or dynamic peak slot preferences..."
                  rows={3}
                  className="w-full bg-gray-50/80 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3a3a3a] rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/20 transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Verification
                </label>
                <TurnstileWidget
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    setErrorMsg(null);
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="bg-gray-100 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-1.5 hover:bg-gray-200 dark:hover:bg-[#282828] disabled:opacity-50"
              >
                <TbArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#4ADE80] hover:bg-[#16A34A] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Registration"}
                {!loading && <HiSparkles className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="text-center py-10 space-y-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4ADE80]/10 border-2 border-[#4ADE80]/30 text-[#4ADE80] mb-2">
              <TbCircleCheck className="w-8 h-8 stroke-[2]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Registration Received!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Thank you for listing your venue with Turfzo! Our partner success team will review your application and contact you within{" "}
                <span className="text-[#4ADE80] font-bold">24 hours</span> to set up your dashboard credentials and verification.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setOwnerName("");
                  setPhone("");
                  setEmail("");
                  setCity("");
                  setVenueName("");
                  setAddress("");
                  setGroundCount("1");
                  setSelectedSports([]);
                  setSelectedAmenities([]);
                  setOperatingHours("");
                  setBasePrice("");
                  setAdditionalNotes("");
                  setTurnstileToken(null);
                  setErrorMsg(null);
                  setStep(1);
                }}
                className="bg-gray-100 dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#3a3a3a] text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-xl transition-colors text-sm hover:bg-gray-200 dark:hover:bg-[#282828]"
              >
                Submit Another Venue
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-[#4ADE80] hover:bg-[#16A34A] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Go to Homepage
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
