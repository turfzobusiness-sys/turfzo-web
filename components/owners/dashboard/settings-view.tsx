"use client";

/**
 * Settings view — reminder timing, auto-approve, notification preferences.
 * Backend: owner_services:getOwnerSettings / updateReminderSettings. The
 * flat keys (enable_24h_reminder, …) match what the Flutter app sends; a
 * missing settings row behaves as auto-approve ON (documented backend
 * default), so the toggle shows that until told otherwise.
 */

import React, { useEffect, useState } from "react";
import { Settings2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Field, LoadingRows, Panel, PanelHead } from "./ui";
import {
  createOwnerApi,
  type OwnerApiCtx,
  type OwnerSettings,
} from "@/lib/owner-api";

function SettingRow({
  checked,
  onCheckedChange,
  label,
  hint,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-text-main">{label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}

// Preview/session fallback: renders when the settings query fails without
// auth (same pattern as FALLBACK_BOOKINGS in bookings-view). Mirrors the
// documented backend defaults for a missing settings row.
const FALLBACK_SETTINGS: OwnerSettings = {
  owner_id: "user_mock_owner_1",
  reminder_lead_time_hours: 24,
  auto_approve_bookings: false,
  notification_preferences: { email: true, push: true, sms: false },
  enable_24h_reminder: true,
  enable_2h_reminder: true,
  enable_post_game_review: true,
  enable_rebook_suggestions: true,
  post_game_delay_hours: 2,
  rebook_days_inactive: 14,
};

export default function SettingsView({
  ownerId,
  apiCtx,
}: {
  ownerId: string;
  apiCtx: OwnerApiCtx;
}) {
  const api = createOwnerApi(apiCtx);
  const [settings, setSettings] = useState<OwnerSettings | null>(null);
  const [draft, setDraft] = useState<Partial<OwnerSettings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await api.settings(ownerId);
        if (!cancelled) setSettings(s);
      } catch (err) {
        if (!cancelled) {
          console.error("Settings load failed:", err);
          setSettings(FALLBACK_SETTINGS);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSettings(ownerId, draft);
      const fresh = await api.settings(ownerId);
      setSettings(fresh);
      setDraft({});
      toast.success("Settings saved");
    } catch (err) {
      console.error("Settings save failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Could not save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <Panel>
        <LoadingRows rows={5} />
      </Panel>
    );
  }

  const val = <K extends keyof OwnerSettings>(key: K): OwnerSettings[K] =>
    (draft[key] as OwnerSettings[K] | undefined) ?? settings[key];

  const setBool = (key: keyof OwnerSettings) => (v: boolean) =>
    setDraft((d) => ({ ...d, [key]: v }));

  const setNum = (key: keyof OwnerSettings) => (v: number) =>
    setDraft((d) => ({ ...d, [key]: v }));

  const prefs =
    (draft.notification_preferences as
      | OwnerSettings["notification_preferences"]
      | undefined) ?? settings.notification_preferences;

  const dirty = Object.keys(draft).length > 0;

  return (
    <Panel>
      <PanelHead
        icon={Settings2}
        title="Booking & reminder settings"
        description="Applies to every venue you own."
      />

      <div className="divide-y divide-border-subtle">
        <SettingRow
          checked={Boolean(val("auto_approve_bookings"))}
          onCheckedChange={setBool("auto_approve_bookings")}
          label="Auto-approve bookings"
          hint="Confirm instantly when the slot is free. Off: each booking waits for approval."
        />
        <SettingRow
          checked={val("enable_24h_reminder") ?? true}
          onCheckedChange={setBool("enable_24h_reminder")}
          label="24-hour reminder"
          hint={`Sent ${val("reminder_lead_time_hours")}h before the start time.`}
        />
        <SettingRow
          checked={val("enable_2h_reminder") ?? false}
          onCheckedChange={setBool("enable_2h_reminder")}
          label="2-hour reminder"
          hint="Sent 2 hours before the slot starts."
        />
        <SettingRow
          checked={val("enable_post_game_review") ?? true}
          onCheckedChange={setBool("enable_post_game_review")}
          label="Post-game review request"
          hint="Players get a rating request after their game."
        />
        <SettingRow
          checked={val("enable_rebook_suggestions") ?? false}
          onCheckedChange={setBool("enable_rebook_suggestions")}
          label="Rebook suggestions"
          hint={`Players inactive for ${val("rebook_days_inactive") ?? 21} days get a rebooking message.`}
        />
      </div>

      <Separator className="my-5 bg-border-subtle" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Reminder lead time (hours)" htmlFor="lead">
          <Input
            id="lead"
            type="number"
            min={1}
            max={72}
            value={val("reminder_lead_time_hours")}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) setNum("reminder_lead_time_hours")(n);
            }}
            className="h-9 border-border-default bg-elevated/40 text-xs"
          />
        </Field>
        <Field label="Review request delay (hours after game)" htmlFor="delay">
          <Input
            id="delay"
            type="number"
            min={1}
            max={72}
            value={val("post_game_delay_hours") ?? 2}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) setNum("post_game_delay_hours")(n);
            }}
            className="h-9 border-border-default bg-elevated/40 text-xs"
          />
        </Field>
      </div>

      <Separator className="my-5 bg-border-subtle" />

      <Field label="Notification channels">
        <div className="flex flex-wrap gap-2">
          {(["email", "push", "sms"] as const).map((ch) => {
            const on = prefs[ch];
            return (
              <Button
                key={ch}
                type="button"
                size="sm"
                variant="outline"
                aria-pressed={on}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    notification_preferences: { ...prefs, [ch]: !on },
                  }))
                }
                className={
                  on
                    ? "border-brand-lime/40 bg-brand-lime/10 text-brand-text hover:bg-brand-lime/15"
                    : "border-border-subtle text-text-muted"
                }
              >
                {ch === "sms" ? "SMS" : ch[0].toUpperCase() + ch.slice(1)}
                <span className="text-[10px] font-normal opacity-80">
                  {on ? "on" : "off"}
                </span>
              </Button>
            );
          })}
        </div>
      </Field>

      {dirty && (
        <div className="mt-5 flex justify-end">
          <Button size="sm" disabled={saving} onClick={() => void save()}>
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving" : "Save changes"}
          </Button>
        </div>
      )}
    </Panel>
  );
}
