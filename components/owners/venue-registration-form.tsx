"use client";

import React, { useState } from "react";
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
  TbAlertCircle
} from "react-icons/tb";
import { HiSparkles } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";

// Sports options
const SPORTS_OPTIONS = [
  { id: "football", label: "Football" },
  { id: "cricket", label: "Cricket Nets" },
  { id: "badminton", label: "Badminton" },
  { id: "tennis", label: "Tennis" },
  { id: "volleyball", label: "Volleyball" },
  { id: "basketball", label: "Basketball" },
];

// Amenities options
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
  
  // Step navigation: 1, 2, 3, or 'success'
  const [step, setStep] = useState<1 | 2 | 3 | "success">(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Form Fields
  // Step 1: Owner Profile
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  // Step 2: Venue Specifications
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [groundCount, setGroundCount] = useState("1");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Step 3: Operational Details
  const [operatingHours, setOperatingHours] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Validation state per step
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setSelectedSports(prev => 
      prev.includes(sportId) ? prev.filter(s => s !== sportId) : [...prev, sportId]
    );
    if (errors.sports) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.sports;
        return copy;
      });
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) ? prev.filter(a => a !== amenityId) : [...prev, amenityId]
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

    // Format Markdown message content
    const sportsString = selectedSports.map(s => {
      const match = SPORTS_OPTIONS.find(o => o.id === s);
      return match ? match.label : s;
    }).join(", ");

    const amenitiesString = selectedAmenities.map(a => {
      const match = AMENITIES_OPTIONS.find(o => o.id === a);
      return match ? match.label : a;
    }).join(", ") || "None";

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
          turnstileToken
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
    <div className="w-full max-w-2xl mx-auto bg-surface border border-border-default rounded-md p-6 sm:p-8 md:p-10 shadow-card-shadow relative overflow-hidden">
      {/* Decorative top green glow line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-lime to-transparent" />
      
      {step !== "success" && (
        <div className="mb-8">
          <div className="flex justify-between items-center text-xs font-sans font-bold tracking-widest text-text-muted mb-4 uppercase">
            <span>Step {step} of 3</span>
            <span className="text-brand-lime">
              {step === 1 ? "Profile" : step === 2 ? "Venue" : "Pricing & Review"}
            </span>
          </div>
          <div className="w-full h-1 bg-border-subtle rounded-full overflow-hidden flex">
            <motion.div 
              className="h-full bg-brand-lime"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded bg-error/5 border border-error/20 text-error text-sm font-sans flex items-start gap-2">
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
            className="space-y-6"
          >
            <div>
              <h3 className="font-poppins text-lg font-bold text-text-main mb-1">Owner Profile</h3>
              <p className="text-xs text-text-muted">Introduce yourself and your business email so we can verify your credentials.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <TbUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => {
                      setOwnerName(e.target.value);
                      if (errors.ownerName) setErrors(prev => ({ ...prev, ownerName: "" }));
                    }}
                    placeholder="John Doe"
                    className={`w-full bg-bg border ${errors.ownerName ? "border-error" : "border-border-default"} focus:border-brand-lime rounded-md py-3 pl-11 pr-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors`}
                  />
                </div>
                {errors.ownerName && <p className="text-xs text-error mt-1.5">{errors.ownerName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <TbPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                      }}
                      placeholder="+91 98765 43210"
                      className={`w-full bg-bg border ${errors.phone ? "border-error" : "border-border-default"} focus:border-brand-lime rounded-md py-3 pl-11 pr-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-error mt-1.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <TbMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                      }}
                      placeholder="john@example.com"
                      className={`w-full bg-bg border ${errors.email ? "border-error" : "border-border-default"} focus:border-brand-lime rounded-md py-3 pl-11 pr-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-error mt-1.5">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                  City
                </label>
                <div className="relative">
                  <TbMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                    }}
                    placeholder="Bengaluru"
                    className={`w-full bg-bg border ${errors.city ? "border-error" : "border-border-default"} focus:border-brand-lime rounded-md py-3 pl-11 pr-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors`}
                  />
                </div>
                {errors.city && <p className="text-xs text-error mt-1.5">{errors.city}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="button"
                onClick={handleNext}
                className="font-poppins font-semibold px-6 py-3 h-auto"
              >
                Next Step
                <TbArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
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
            className="space-y-6"
          >
            <div>
              <h3 className="font-poppins text-lg font-bold text-text-main mb-1">Venue Specifications</h3>
              <p className="text-xs text-text-muted">Tell us about your sports complex, courts, and supported amenities.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                  Venue Name
                </label>
                <div className="relative">
                  <TbBuilding className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => {
                      setVenueName(e.target.value);
                      if (errors.venueName) setErrors(prev => ({ ...prev, venueName: "" }));
                    }}
                    placeholder="Turfzo Arena HSR"
                    className={`w-full bg-bg border ${errors.venueName ? "border-error" : "border-border-default"} focus:border-brand-lime rounded-md py-3 pl-11 pr-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors`}
                  />
                </div>
                {errors.venueName && <p className="text-xs text-error mt-1.5">{errors.venueName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                    Full Address
                  </label>
                  <div className="relative">
                    <TbMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
                      }}
                      placeholder="100 Feet Rd, HSR Layout"
                      className={`w-full bg-bg border ${errors.address ? "border-error" : "border-border-default"} focus:border-brand-lime rounded-md py-3 pl-11 pr-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors`}
                    />
                  </div>
                  {errors.address && <p className="text-xs text-error mt-1.5">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                    Grounds/Courts
                  </label>
                  <select
                    value={groundCount}
                    onChange={(e) => setGroundCount(e.target.value)}
                    className="w-full bg-bg border border-border-default focus:border-brand-lime rounded-md py-3 px-4 text-sm text-text-main focus:outline-none h-[46px]"
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
                <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-3">
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
                        className={`py-3 px-4 rounded border text-left text-sm font-sans flex items-center justify-between transition-all duration-200 ${
                          active
                            ? "bg-brand-lime/10 border-brand-lime text-brand-lime font-bold"
                            : "bg-bg border-border-default text-text-muted hover:border-border-strong hover:text-text-main"
                        }`}
                      >
                        <span>{sport.label}</span>
                        {active && <TbCheck className="w-4 h-4 text-brand-lime stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
                {errors.sports && <p className="text-xs text-error mt-1.5">{errors.sports}</p>}
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-3">
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
                        className={`py-3 px-4 rounded border text-left text-sm font-sans flex items-center justify-between transition-all duration-200 ${
                          active
                            ? "bg-brand-lime/5 border-brand-lime/50 text-text-main font-semibold"
                            : "bg-bg border-border-default text-text-muted hover:border-border-strong"
                        }`}
                      >
                        <span className="truncate">{amenity.label}</span>
                        {active && <TbCheck className="w-3.5 h-3.5 text-brand-lime stroke-[2]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="font-poppins font-semibold px-6 py-3 h-auto"
              >
                <TbArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="font-poppins font-semibold px-6 py-3 h-auto"
              >
                Next Step
                <TbArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
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
            className="space-y-6"
          >
            <div>
              <h3 className="font-poppins text-lg font-bold text-text-main mb-1">Operations & Pricing</h3>
              <p className="text-xs text-text-muted">Enter scheduling timings, base rates, and complete the check to submit.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                    Operating Hours
                  </label>
                  <div className="relative">
                    <TbClock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => {
                        setOperatingHours(e.target.value);
                        if (errors.operatingHours) setErrors(prev => ({ ...prev, operatingHours: "" }));
                      }}
                      placeholder="6 AM - 11 PM"
                      className={`w-full bg-bg border ${errors.operatingHours ? "border-error" : "border-border-default"} focus:border-brand-lime rounded-md py-3 pl-11 pr-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors`}
                    />
                  </div>
                  {errors.operatingHours && <p className="text-xs text-error mt-1.5">{errors.operatingHours}</p>}
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                    Base Price per Hour (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted font-bold">₹</span>
                    <input
                      type="text"
                      value={basePrice}
                      onChange={(e) => {
                        setBasePrice(e.target.value);
                        if (errors.basePrice) setErrors(prev => ({ ...prev, basePrice: "" }));
                      }}
                      placeholder="1200"
                      className={`w-full bg-bg border ${errors.basePrice ? "border-error" : "border-border-default"} focus:border-brand-lime rounded-md py-3 pl-9 pr-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors`}
                    />
                  </div>
                  {errors.basePrice && <p className="text-xs text-error mt-1.5">{errors.basePrice}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Tell us about special pricing, tournament setups, or dynamic peak slot preferences..."
                  rows={3}
                  className="w-full bg-bg border border-border-default focus:border-brand-lime rounded-md py-3 px-4 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Turnstile verification widget */}
              <div className="pt-2">
                <label className="block text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2">
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
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="font-poppins font-semibold px-6 py-3 h-auto"
              >
                <TbArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="font-poppins font-semibold px-8 py-3.5 h-auto text-base"
              >
                {loading ? "Submitting..." : "Submit Registration"}
                {!loading && <HiSparkles className="w-4 h-4 ml-1.5 text-black" />}
              </Button>
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-lime/10 border-2 border-brand-lime/30 text-brand-lime mb-2">
              <TbCircleCheck className="w-8 h-8 stroke-[2]" />
            </div>

            <div>
              <h2 className="font-poppins text-2xl font-extrabold text-text-main mb-2">
                Registration Received!
              </h2>
              <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                Thank you for listing your venue with Turfzo! Our partner success team will review your application and contact you within <span className="text-brand-lime font-bold">24 hours</span> to set up your dashboard credentials and verification.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset form fields
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
                className="font-poppins font-semibold px-6 py-3 h-auto"
              >
                Submit Another Venue
              </Button>
              <a
                href="/"
                className="inline-flex items-center justify-center bg-brand-lime text-black hover:bg-brand-lime-hover font-poppins font-semibold px-6 py-3 rounded-md transition-colors text-sm shadow-glow-lime"
              >
                Go to Homepage
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
