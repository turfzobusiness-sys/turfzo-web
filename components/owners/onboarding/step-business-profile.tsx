"use client";

import React, { useState } from "react";
import { Building2, Phone, MapPin, Globe, FileText, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessProfileData {
  business_name?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  gst_number?: string;
  pan_number?: string;
}

interface StepBusinessProfileProps {
  initialData: BusinessProfileData;
  onNext: (data: Required<Omit<BusinessProfileData, "zip_code" | "gst_number" | "pan_number">> & BusinessProfileData) => Promise<void>;
  loading: boolean;
}

export function StepBusinessProfile({ initialData, onNext, loading }: StepBusinessProfileProps) {
  const [businessName, setBusinessName] = useState(initialData.business_name || "");
  const [phone, setPhone] = useState(initialData.phone_number || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [city, setCity] = useState(initialData.city || "");
  const [state, setState] = useState(initialData.state || "");
  const [zipCode, setZipCode] = useState(initialData.zip_code || "");
  const [gst, setGst] = useState(initialData.gst_number || "");
  const [pan, setPan] = useState(initialData.pan_number || "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{10,14}$/.test(phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (10-12 digits)";
    }
    if (!address.trim()) {
      newErrors.address = "Business address is required";
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
    }
    if (!state.trim()) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    await onNext({
      business_name: businessName.trim(),
      phone_number: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip_code: zipCode.trim(),
      gst_number: gst.trim(),
      pan_number: pan.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-poppins text-xl font-bold text-white tracking-wide">Business Profile</h2>
        <p className="font-sans text-sm text-text-muted/70">
          Provide your basic business details. GST and PAN registration details are optional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="business_name" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            Registered Business Name <span className="text-brand-lime">*</span>
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted/70" />
            <input
              id="business_name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Turfzo Sports Arena Pvt Ltd"
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
          </div>
          {errors.businessName && (
            <span className="font-sans text-xs text-error-light">{errors.businessName}</span>
          )}
        </div>

        {/* Business Phone */}
        <div className="space-y-1.5">
          <label htmlFor="business_phone" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            Business Phone <span className="text-brand-lime">*</span>
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted/70" />
            <input
              id="business_phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 9876543210"
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
          </div>
          {errors.phone && (
            <span className="font-sans text-xs text-error-light">{errors.phone}</span>
          )}
        </div>

        {/* ZIP Code */}
        <div className="space-y-1.5">
          <label htmlFor="zip_code" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            ZIP / Postal Code
          </label>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted/70" />
            <input
              id="zip_code"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="e.g., 560001"
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="address" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            Business Address <span className="text-brand-lime">*</span>
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-text-muted/70" />
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 1st Floor, Building A, Outer Ring Road"
              rows={2}
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200 resize-none"
            />
          </div>
          {errors.address && (
            <span className="font-sans text-xs text-error-light">{errors.address}</span>
          )}
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label htmlFor="city" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            City <span className="text-brand-lime">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Bangalore"
            className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
          />
          {errors.city && (
            <span className="font-sans text-xs text-error-light">{errors.city}</span>
          )}
        </div>

        {/* State */}
        <div className="space-y-1.5">
          <label htmlFor="state" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            State <span className="text-brand-lime">*</span>
          </label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g., Karnataka"
            className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
          />
          {errors.state && (
            <span className="font-sans text-xs text-error-light">{errors.state}</span>
          )}
        </div>

        {/* Divider with Note */}
        <div className="md:col-span-2 border-t border-border-default pt-4 my-2">
          <p className="font-sans text-xs text-text-muted/60">
            GST and PAN are optional registration fields. You can proceed without them and supply them later to claim tax benefits.
          </p>
        </div>

        {/* GST Number */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="gst_number" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              GST Number
            </label>
            <span className="font-sans text-[10px] text-text-muted/50 uppercase">Optional</span>
          </div>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted/70" />
            <input
              id="gst_number"
              type="text"
              value={gst}
              onChange={(e) => setGst(e.target.value.toUpperCase())}
              placeholder="e.g., 29AAAAA1111A1Z1"
              maxLength={15}
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* PAN Number */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="pan_number" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              Business PAN
            </label>
            <span className="font-sans text-[10px] text-text-muted/50 uppercase">Optional</span>
          </div>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted/70" />
            <input
              id="pan_number"
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="e.g., ABCDE1234F"
              maxLength={10}
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border-default">
        <Button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#0f1f0f] border border-brand-lime/30 text-white py-2.5 px-6 font-poppins font-bold text-sm tracking-wide rounded-[8px] hover:border-brand-lime/60 hover:bg-brand-lime/5 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              Next Step
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
