"use client";

import React, { useState } from "react";
import { MapPin, Info, ArrowLeft, ArrowRight, Loader2, IndianRupee, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";

export interface VenueDraftData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  price_per_hour?: number;
  sport_type?: string;
  amenities?: string[];
  operating_hours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  max_players?: number;
  has_floodlights?: boolean;
  has_free_parking?: boolean;
  has_changing_room?: boolean;
  has_drinking_water?: boolean;
  has_first_aid?: boolean;
  is_indoor?: boolean;
  ground_count?: number;
  image_gallery?: string[];
}

interface StepVenueSetupProps {
  initialData: VenueDraftData;
  onNext: (data: Required<Pick<VenueDraftData, "name" | "address" | "city" | "price_per_hour">> & VenueDraftData) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

const SPORTS_OPTIONS = [
  { id: "football", label: "Football" },
  { id: "cricket", label: "Cricket" },
  { id: "badminton", label: "Badminton" },
  { id: "tennis", label: "Tennis" },
  { id: "volleyball", label: "Volleyball" },
  { id: "basketball", label: "Basketball" },
];

export function StepVenueSetup({ initialData, onNext, onBack, loading }: StepVenueSetupProps) {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [city, setCity] = useState(initialData.city || "");
  const [state, setState] = useState(initialData.state || "");
  const [zipCode] = useState(initialData.zip_code || "");
  const [price, setPrice] = useState(initialData.price_per_hour?.toString() || "");
  const [sportType, setSportType] = useState(initialData.sport_type || "football");
  const [groundCount, setGroundCount] = useState(initialData.ground_count || 1);
  const [isIndoor, setIsIndoor] = useState(initialData.is_indoor || false);
  const [maxPlayers] = useState(initialData.max_players || 14);
  const [imageGallery, setImageGallery] = useState<string[]>(initialData.image_gallery || []);

  // Amenities
  const [hasFloodlights, setHasFloodlights] = useState(initialData.has_floodlights || false);
  const [hasFreeParking, setHasFreeParking] = useState(initialData.has_free_parking || false);
  const [hasChangingRoom, setHasChangingRoom] = useState(initialData.has_changing_room || false);
  const [hasDrinkingWater, setHasDrinkingWater] = useState(initialData.has_drinking_water || false);
  const [hasFirstAid, setHasFirstAid] = useState(initialData.has_first_aid || false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Venue name is required";
    if (!address.trim()) newErrors.address = "Full address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!price.trim()) {
      newErrors.price = "Hourly rate is required";
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Price must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    // Gather amenities
    const amenities: string[] = [];
    if (hasFloodlights) amenities.push("floodlights");
    if (hasFreeParking) amenities.push("parking");
    if (hasChangingRoom) amenities.push("changing_rooms");
    if (hasDrinkingWater) amenities.push("drinking_water");
    if (hasFirstAid) amenities.push("first_aid");

    // Standard default operating hours
    const defaultHours = { open: "06:00", close: "23:00" };
    const operatingHours = {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: defaultHours,
      sunday: defaultHours,
    };

    onNext({
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zip_code: zipCode.trim(),
      price_per_hour: Number(price),
      sport_type: sportType,
      amenities,
      operating_hours: operatingHours,
      ground_count: Number(groundCount),
      is_indoor: isIndoor,
      max_players: Number(maxPlayers),
      has_floodlights: hasFloodlights,
      has_free_parking: hasFreeParking,
      has_changing_room: hasChangingRoom,
      has_drinking_water: hasDrinkingWater,
      has_first_aid: hasFirstAid,
      image_gallery: imageGallery,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-sans text-xl font-bold text-text-main tracking-wide">Venue Setup</h2>
        <p className="font-sans text-sm text-text-muted">
          Create details for your first turf venue. You can always add more venues later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Details & Address */}
        <div className="space-y-4">
          <h3 className="font-sans text-xs font-bold text-brand-lime uppercase tracking-wider border-b border-border-default pb-1">
            General Information
          </h3>

          {/* Venue Name */}
          <div className="space-y-1.5">
            <label htmlFor="venue_name" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              Venue / Arena Name <span className="text-brand-lime">*</span>
            </label>
            <input
              id="venue_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Turfzo Arena - HSR Layout"
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
            {errors.name && (
              <span className="font-sans text-xs text-error-light">{errors.name}</span>
            )}
          </div>

          {/* Venue Description */}
          <div className="space-y-1.5">
            <label htmlFor="venue_desc" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              Description / Rules
            </label>
            <textarea
              id="venue_desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell players about your turf quality, specific rules (e.g. studs allowed), and parking info..."
              rows={3}
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200 resize-none"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label htmlFor="venue_address" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              Full Venue Address <span className="text-brand-lime">*</span>
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-text-muted" />
              <textarea
                id="venue_address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Survey No. 42, HSR Layout Sector 3, Opposite Star Bazar"
                rows={2}
                className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200 resize-none"
              />
            </div>
            {errors.address && (
              <span className="font-sans text-xs text-error-light">{errors.address}</span>
            )}
          </div>

          {/* City & ZIP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="venue_city" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
                City <span className="text-brand-lime">*</span>
              </label>
              <input
                id="venue_city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bangalore"
                className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
              />
              {errors.city && (
                <span className="font-sans text-xs text-error-light">{errors.city}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="venue_state" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
                State
              </label>
              <input
                id="venue_state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Karnataka"
                className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Sports, & Specs */}
        <div className="space-y-4">
          <h3 className="font-sans text-xs font-bold text-brand-lime uppercase tracking-wider border-b border-border-default pb-1">
            Specifications & Pricing
          </h3>

          {/* Pricing & Court Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="price" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
                Hourly Price <span className="text-brand-lime">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 1200"
                  className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-9 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
                />
              </div>
              {errors.price && (
                <span className="font-sans text-xs text-error-light">{errors.price}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="court_count" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
                Court / Pitches Count
              </label>
              <div className="relative">
                <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <select
                  id="court_count"
                  value={groundCount}
                  onChange={(e) => setGroundCount(Number(e.target.value))}
                  className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-9 pr-4 font-sans text-sm text-text-main hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200 appearance-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num} className="bg-bg text-text-main">
                      {num} {num === 1 ? "Court" : "Courts"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Sport Selector */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              Primary Sport
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS_OPTIONS.map((sport) => (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => setSportType(sport.id)}
                  className={`py-2 px-3 text-xs font-semibold rounded-[8px] border font-sans text-center transition-all duration-200 ${
                    sportType === sport.id
                      ? "bg-brand-lime/15 border-brand-lime text-brand-lime shadow-md shadow-brand-lime/5"
                      : "bg-elevated border-border-default text-text-muted hover:border-border-strong hover:bg-elevated/70"
                  }`}
                >
                  {sport.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specifications Toggles */}
          <div className="grid grid-cols-2 gap-4 bg-surface/50 border border-border-default p-3 rounded-[10px]">
            <div className="flex items-center justify-between col-span-2">
              <span className="font-sans text-xs font-semibold text-text-main">Indoor Venue?</span>
              <button
                type="button"
                onClick={() => setIsIndoor(!isIndoor)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isIndoor ? "bg-brand-lime" : "bg-border-default"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-bg shadow ring-0 transition duration-200 ease-in-out ${
                    isIndoor ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between col-span-2 text-xs font-sans text-text-muted">
              <div className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-brand-lime" />
                <span>Operating hours defaulted to 6 AM - 11 PM</span>
              </div>
            </div>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              Amenities Available
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Floodlights", checked: hasFloodlights, set: setHasFloodlights },
                { label: "Free Parking", checked: hasFreeParking, set: setHasFreeParking },
                { label: "Changing Room", checked: hasChangingRoom, set: setHasChangingRoom },
                { label: "Drinking Water", checked: hasDrinkingWater, set: setHasDrinkingWater },
                { label: "First Aid", checked: hasFirstAid, set: setHasFirstAid },
              ].map((amenity) => (
                <button
                  key={amenity.label}
                  type="button"
                  onClick={() => amenity.set(!amenity.checked)}
                  className={`flex items-center justify-between p-2 text-xs font-medium rounded-[8px] border font-sans transition-all duration-200 ${
                    amenity.checked
                      ? "bg-brand-lime/10 border-brand-lime text-brand-lime"
                      : "bg-surface border-border-default text-text-muted hover:border-border-strong"
                  }`}
                >
                  <span>{amenity.label}</span>
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      amenity.checked
                        ? "bg-brand-lime border-brand-lime"
                        : "bg-transparent border-border-strong"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Upload */}
      <div className="space-y-3 bg-surface border border-border-default rounded-[14px] p-5">
        <div>
          <h3 className="font-sans text-xs font-bold text-brand-lime uppercase tracking-wider">
            Venue Photos
          </h3>
          <p className="font-sans text-xs text-text-muted mt-1">
            Upload up to 5 photos of your turf. Good photos increase bookings significantly.
          </p>
        </div>
        <ImageUploader 
          value={imageGallery} 
          onChange={setImageGallery} 
          maxFiles={5}
        />
      </div>

      {/* Form Navigation */}
      <div className="flex justify-between pt-4 border-t border-border-default">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="inline-flex items-center gap-2 py-2.5 px-4 font-sans text-sm text-text-muted hover:text-text-main transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-brand-btn-bg border border-brand-lime/30 text-white py-2.5 px-6 font-sans font-bold text-sm tracking-wide rounded-[8px] hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Venue...
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
