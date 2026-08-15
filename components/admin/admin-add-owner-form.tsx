"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";

interface AdminAddOwnerFormProps {
  onSuccess: () => void;
}

const SPORTS_OPTIONS = [
  { id: "football", label: "Football" },
  { id: "cricket", label: "Cricket" },
  { id: "badminton", label: "Badminton" },
  { id: "tennis", label: "Tennis" },
  { id: "volleyball", label: "Volleyball" },
  { id: "basketball", label: "Basketball" },
];

export function AdminAddOwnerForm({ onSuccess }: AdminAddOwnerFormProps) {
  const [loading, setLoading] = useState(false);
  const { firebaseUser } = useAuth();

  // Form State
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [userCity, setUserCity] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessZip, setBusinessZip] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");

  const [venueName, setVenueName] = useState("");
  const [venueDescription] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [venueState, setVenueState] = useState("");
  const [venueZip, setVenueZip] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [sportType, setSportType] = useState("football");
  const [groundCount, setGroundCount] = useState(1);
  const [isIndoor, setIsIndoor] = useState(false);
  
  const [hasFloodlights, setHasFloodlights] = useState(false);
  const [hasFreeParking, setHasFreeParking] = useState(false);
  const [hasChangingRoom, setHasChangingRoom] = useState(false);
  const [hasDrinkingWater, setHasDrinkingWater] = useState(false);
  const [hasFirstAid, setHasFirstAid] = useState(false);
  const [imageGallery, setImageGallery] = useState<string[]>([]);

  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error("You must be signed in to register an owner.");
      return;
    }
    setLoading(true);
    
    try {
      const amenities: string[] = [];
      if (hasFloodlights) amenities.push("floodlights");
      if (hasFreeParking) amenities.push("parking");
      if (hasChangingRoom) amenities.push("changing_rooms");
      if (hasDrinkingWater) amenities.push("drinking_water");
      if (hasFirstAid) amenities.push("first_aid");

      const token = await firebaseUser.getIdToken();
      await convexClient.mutation("admin:createOwnerWithVenue", {
        email,
        full_name: fullName,
        phone_number: phone,
        city: userCity,
        business: {
          business_name: businessName,
          address: businessAddress,
          city: businessCity,
          state: businessState,
          zip_code: businessZip,
          gst_number: gstNumber || undefined,
          pan_number: panNumber || undefined,
        },
        venue: {
          name: venueName,
          description: venueDescription || undefined,
          address: venueAddress,
          city: venueCity,
          state: venueState,
          zip_code: venueZip,
          price_per_hour: Number(pricePerHour),
          sport_type: sportType,
          amenities,
          ground_count: groundCount,
          is_indoor: isIndoor,
          image_gallery: imageGallery.length > 0 ? imageGallery : undefined,
        },
        payout: {
          bank_account_holder_name: accountHolder,
          bank_name: bankName,
          bank_account_number: accountNumber,
          bank_ifsc_code: ifscCode,
          upi_id: upiId || undefined,
        }
      }, token);
      
      toast.success("Owner successfully registered & approved!");
      onSuccess();
      
    } catch (error: unknown) {
      console.error(error);
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(getErrorMessage(error, "Failed to register owner."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="bg-surface border border-border-default rounded-[12px] p-6 space-y-4">
        <h3 className="font-sans font-bold text-lg text-text-main border-b border-border-default pb-2">
          1. Owner Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={fullName} onChange={setFullName} required />
          <Input label="Email Address" type="email" value={email} onChange={setEmail} required />
          <Input label="Phone Number" value={phone} onChange={setPhone} required />
          <Input label="City" value={userCity} onChange={setUserCity} required />
        </div>
      </div>

      <div className="bg-surface border border-border-default rounded-[12px] p-6 space-y-4">
        <h3 className="font-sans font-bold text-lg text-text-main border-b border-border-default pb-2">
          2. Business Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Business Name" value={businessName} onChange={setBusinessName} required className="md:col-span-2" />
          <Input label="Business Address" value={businessAddress} onChange={setBusinessAddress} required className="md:col-span-2" />
          <Input label="City" value={businessCity} onChange={setBusinessCity} required />
          <Input label="State" value={businessState} onChange={setBusinessState} required />
          <Input label="ZIP Code" value={businessZip} onChange={setBusinessZip} required />
          <div className="hidden md:block"></div>
          <Input label="GST Number (Optional)" value={gstNumber} onChange={setGstNumber} />
          <Input label="PAN Number (Optional)" value={panNumber} onChange={setPanNumber} />
        </div>
      </div>

      <div className="bg-surface border border-border-default rounded-[12px] p-6 space-y-4">
        <h3 className="font-sans font-bold text-lg text-text-main border-b border-border-default pb-2">
          3. Venue Setup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Venue Name" value={venueName} onChange={setVenueName} required />
          <Input label="Price Per Hour (₹)" type="number" value={pricePerHour} onChange={setPricePerHour} required />
          <Input label="Venue Address" value={venueAddress} onChange={setVenueAddress} required className="md:col-span-2" />
          <Input label="City" value={venueCity} onChange={setVenueCity} required />
          <Input label="State" value={venueState} onChange={setVenueState} required />
          <Input label="ZIP Code" value={venueZip} onChange={setVenueZip} required />
          
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">Ground/Court Count</label>
            <input 
              type="number" 
              min={1} 
              value={groundCount} 
              onChange={e => setGroundCount(Number(e.target.value))} 
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main focus:border-brand-lime focus:outline-none"
              required 
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">Primary Sport</label>
          <div className="grid grid-cols-3 gap-2">
            {SPORTS_OPTIONS.map((sport) => (
              <button
                key={sport.id}
                type="button"
                onClick={() => setSportType(sport.id)}
                className={`py-2 px-3 text-xs font-semibold rounded-[8px] border font-sans text-center transition-all ${
                  sportType === sport.id
                    ? "bg-brand-lime/15 border-brand-lime text-brand-lime"
                    : "bg-elevated border-border-default text-text-muted hover:border-border-strong"
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">Amenities & Features</label>
          <div className="grid grid-cols-2 gap-2">
            <Checkbox label="Indoor Venue" checked={isIndoor} onChange={setIsIndoor} />
            <Checkbox label="Floodlights" checked={hasFloodlights} onChange={setHasFloodlights} />
            <Checkbox label="Free Parking" checked={hasFreeParking} onChange={setHasFreeParking} />
            <Checkbox label="Changing Room" checked={hasChangingRoom} onChange={setHasChangingRoom} />
            <Checkbox label="Drinking Water" checked={hasDrinkingWater} onChange={setHasDrinkingWater} />
            <Checkbox label="First Aid" checked={hasFirstAid} onChange={setHasFirstAid} />
          </div>
        </div>
        
        <div className="pt-2">
          <label className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">Venue Photos</label>
          <ImageUploader value={imageGallery} onChange={setImageGallery} maxFiles={5} />
        </div>
      </div>

      <div className="bg-surface border border-border-default rounded-[12px] p-6 space-y-4">
        <h3 className="font-sans font-bold text-lg text-text-main border-b border-border-default pb-2">
          4. Payout Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Account Holder Name" value={accountHolder} onChange={setAccountHolder} required />
          <Input label="Bank Name" value={bankName} onChange={setBankName} required />
          <Input label="Account Number" value={accountNumber} onChange={setAccountNumber} required />
          <Input label="IFSC Code" value={ifscCode} onChange={setIfscCode} required />
          <Input label="UPI ID (Optional)" value={upiId} onChange={setUpiId} className="md:col-span-2" />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={loading} 
          className="bg-brand-lime hover:bg-brand-lime-hover text-bg font-bold px-8 py-2.5 rounded-[8px]"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><UserPlus className="w-4 h-4 mr-2" /> Register Owner</>
          )}
        </Button>
      </div>
    </form>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}: InputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
        {label} {required && <span className="text-brand-lime">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main focus:border-brand-lime focus:outline-none"
      />
    </div>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between p-2 text-xs font-medium rounded-[8px] border font-sans transition-all duration-200 ${
        checked
          ? "bg-brand-lime/10 border-brand-lime text-brand-lime"
          : "bg-elevated border-border-default text-text-muted hover:border-border-strong"
      }`}
    >
      <span>{label}</span>
      <span className={`h-3 w-3 rounded-full border ${checked ? "bg-brand-lime border-brand-lime" : "bg-transparent border-border-strong"}`} />
    </button>
  );
}
