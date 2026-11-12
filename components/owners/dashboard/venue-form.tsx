"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { Turf } from "@/lib/types";
import { createOwnerApi, type OwnerApiCtx } from "@/lib/owner-api";
import { Field } from "./ui";

/**
 * Create/edit a venue from the web dashboard.
 *
 * Before this form existed, `turfs:create` was reachable only from the Flutter
 * app, so an owner working on a laptop could not add a venue at all. The
 * payload mirrors `turfEditableFieldsValidator` in `convex/validators.ts`:
 * name / address / city / price_per_hour / is_available are required by
 * `turfs:create`, everything else is optional.
 *
 * New venues are created with status "pending" by the backend and stay
 * invisible until an admin approves them (`admin:approveTurf`), so this form
 * never claims a venue is live.
 */
export function VenueFormDialog({
  apiCtx,
  venue,
  onClose,
  onSaved,
}: {
  apiCtx?: OwnerApiCtx;
  /** Present when editing; omitted when creating. */
  venue?: Turf;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(venue);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(venue?.name ?? "");
  const [description, setDescription] = useState(venue?.description ?? "");
  const [sportType, setSportType] = useState(venue?.sport_type ?? "football");
  const [format, setFormat] = useState(venue?.format ?? "5-a-side");
  const [address, setAddress] = useState(venue?.address ?? "");
  const [city, setCity] = useState(venue?.city ?? "");
  const [stateName, setStateName] = useState(venue?.state ?? "");
  const [zipCode, setZipCode] = useState(venue?.zip_code ?? "");
  const [price, setPrice] = useState(
    venue?.price_per_hour != null ? String(venue.price_per_hour) : "",
  );
  const [maxPlayers, setMaxPlayers] = useState(
    venue?.max_players != null ? String(venue.max_players) : "10",
  );
  const [openTime, setOpenTime] = useState(venue?.operating_hours?.open ?? "06:00");
  const [closeTime, setCloseTime] = useState(
    venue?.operating_hours?.close ?? "23:00",
  );
  const [imageUrl, setImageUrl] = useState(venue?.image_url ?? "");
  const [indoor, setIndoor] = useState(Boolean(venue?.is_indoor));
  const [floodlights, setFloodlights] = useState(Boolean(venue?.has_floodlights));
  const [parking, setParking] = useState(Boolean(venue?.has_free_parking));
  const [changingRoom, setChangingRoom] = useState(
    Boolean(venue?.has_changing_room),
  );
  const [drinkingWater, setDrinkingWater] = useState(
    Boolean(venue?.has_drinking_water),
  );
  const [firstAid, setFirstAid] = useState(Boolean(venue?.has_first_aid));

  const handleSave = async () => {
    if (!apiCtx) return;
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedCity = city.trim();
    const priceValue = Number(price);

    // Client-side mirror of the backend's required checks. The backend is
    // still the authority — this only avoids a round trip for obvious gaps.
    if (!trimmedName) return toast.error("Venue name is required.");
    if (!trimmedAddress) return toast.error("Address is required.");
    if (!trimmedCity) return toast.error("City is required.");
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      return toast.error("Price per hour must be greater than zero.");
    }
    if (openTime >= closeTime) {
      return toast.error("Closing time must be after opening time.");
    }

    const payload = {
      name: trimmedName,
      description: description.trim() || undefined,
      sport_type: sportType,
      format: format || undefined,
      address: trimmedAddress,
      city: trimmedCity,
      state: stateName.trim() || undefined,
      zip_code: zipCode.trim() || undefined,
      price_per_hour: priceValue,
      max_players: Number(maxPlayers) || undefined,
      operating_hours: { open: openTime, close: closeTime },
      // Browser offset so the backend evaluates "today" in the venue's local
      // day (India = +330). Mirrors the app's create payload.
      timezone_offset_minutes: -new Date().getTimezoneOffset(),
      image_url: imageUrl.trim() || undefined,
      is_indoor: indoor,
      has_floodlights: floodlights,
      has_free_parking: parking,
      has_changing_room: changingRoom,
      has_drinking_water: drinkingWater,
      has_first_aid: firstAid,
      // Only sent on create: availability flips are refused by the backend
      // while a venue is still pending approval (dead-toggle guard).
      ...(editing ? {} : { is_available: true }),
    };

    setSaving(true);
    try {
      const api = createOwnerApi(apiCtx);
      if (editing && venue) {
        await api.updateVenue(venue._id, payload);
        toast.success("Venue updated.");
      } else {
        await api.createVenue(payload);
        toast.success("Venue submitted — it goes live once approved.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save the venue.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border-default bg-surface p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-sans text-lg font-extrabold text-text-main">
              {editing ? "Edit venue" : "Add venue"}
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              {editing
                ? "Changes apply immediately; listing status is unchanged."
                : "New venues are reviewed by Turfzo before they appear in search."}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-text-muted hover:bg-elevated hover:text-text-main"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Venue name" className="sm:col-span-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Greenfield Turf"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="Description" className="sm:col-span-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Floodlit 5-a-side turf with artificial grass."
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="Sport">
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main focus:border-brand-lime focus:outline-none"
            >
              {["football", "cricket", "tennis", "badminton", "basketball", "volleyball", "hockey", "tabletennis", "other"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field label="Format">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main focus:border-brand-lime focus:outline-none"
            >
              {["5-a-side", "7-a-side", "11-a-side", "Single", "Double"].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Address" className="sm:col-span-2">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot 12, MIDC"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="City">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Aurangabad"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="State">
            <input
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="Maharashtra"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="PIN code">
            <input
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="431001"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="Price per hour (₹)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="1200"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="Max players">
            <input
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="10"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="Opens at" hint="24-hour HH:MM">
            <input
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              placeholder="06:00"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="Closes at" hint="24-hour HH:MM">
            <input
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              placeholder="23:00"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <Field label="Cover image URL" className="sm:col-span-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-md border border-border-default bg-bg px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-brand-lime focus:outline-none"
            />
          </Field>

          <div className="sm:col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: "Indoor", value: indoor, set: setIndoor },
              { label: "Floodlights", value: floodlights, set: setFloodlights },
              { label: "Free parking", value: parking, set: setParking },
              { label: "Changing room", value: changingRoom, set: setChangingRoom },
              { label: "Drinking water", value: drinkingWater, set: setDrinkingWater },
              { label: "First aid", value: firstAid, set: setFirstAid },
            ].map((f) => (
              <label
                key={f.label}
                className="flex items-center gap-2 rounded-md border border-border-default bg-bg px-3 py-2 text-xs font-semibold text-text-main"
              >
                <input
                  type="checkbox"
                  checked={f.value}
                  onChange={(e) => f.set(e.target.checked)}
                  className="h-3.5 w-3.5 accent-brand-lime"
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold text-text-muted hover:bg-elevated"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-brand-lime px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-brand-lime-hover disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Save changes" : "Create venue"}
          </button>
        </div>
      </div>
    </div>
  );
}
