"use client";

// Web push (FCM) helpers for the Turfzo site.
//
// Requires one env var the rest of Firebase doesn't:
//   NEXT_PUBLIC_FIREBASE_VAPID_KEY — Web Push certificate key pair's public
//   key (Firebase console → Project settings → Cloud Messaging → Web Push
//   certificates → Generate). Without it `isWebPushSupported()` returns
//   false and the enable button stays hidden.
//
// Tokens are registered with the SAME backend mutation the mobile app uses
// (push:registerDeviceToken), so a signed-in user gets pushes on every
// device — phone and browser alike.

import { getApps } from "firebase/app";
import { getMessaging, getToken, deleteToken, isSupported } from "firebase/messaging";
import { convexClient } from "./convex";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const STORAGE_KEY = "turfzo:web-push-enabled";

export async function isWebPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!VAPID_KEY) return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  // Firebase itself may be unconfigured in local UI dev.
  if (getApps().length === 0) return false;
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

export function wasWebPushEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

/**
 * Ask permission, mint an FCM web token and register it with the backend.
 * Throws with a human-readable message on denial/failure — callers surface
 * it via a toast.
 */
export async function enableWebPush(): Promise<void> {
  if (!(await isWebPushSupported())) {
    throw new Error("Notifications aren't supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notifications were blocked. Allow them in site settings and retry.");
  }

  const app = getApps()[0];
  const messaging = getMessaging(app);

  // Register the route-handled service worker explicitly so the scope and
  // the token stay under our control.
  const swRegistration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swRegistration,
  });
  if (!token) {
    throw new Error("Couldn't create a notification token. Please retry.");
  }

  await convexClient.mutation("push:registerDeviceToken", {
    token,
    platform: "web",
  });

  window.localStorage.setItem(STORAGE_KEY, "1");
}

/** Unregister the browser token (profile → notification settings). */
export async function disableWebPush(): Promise<void> {
  if (!(await isWebPushSupported())) return;
  try {
    const app = getApps()[0];
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      await deleteToken(messaging);
      await convexClient.mutation("push:removeDeviceToken", { token });
    }
  } finally {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
