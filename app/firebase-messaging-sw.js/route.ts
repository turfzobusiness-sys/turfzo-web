// Turfzo Firebase Cloud Messaging service worker, served as a route so the
// Firebase config is inlined from the same NEXT_PUBLIC_FIREBASE_* env vars
// as lib/firebase.ts (a static public/ file cannot read env vars, and
// hand-copying keys there would drift).
//
// Serves /firebase-messaging-sw.js — FCM web tokens are bound to this
// scope, so the path must stay exactly this.

const SW_SOURCE = /* js */ `
importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "__API_KEY__",
  authDomain: "__AUTH_DOMAIN__",
  projectId: "__PROJECT_ID__",
  storageBucket: "__STORAGE_BUCKET__",
  messagingSenderId: "__SENDER_ID__",
  appId: "__APP_ID__",
});

try {
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? "Turfzo";
    const options = {
      body: payload.notification?.body ?? "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: payload.data ?? {},
      tag: payload.data?.type ?? "turfzo",
    };
    self.registration.showNotification(title, options);
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const data = event.notification.data || {};
    let url = "/profile?tab=notifications";
    if (data.booking_id) url = "/bookings";
    // The tournament detail route is /tournament/[tournamentId] (singular).
    // "/tournaments/<id>" 404s — /tournaments only reads an ?id= query.
    else if (data.tournament_id) url = "/tournament/" + data.tournament_id;
    else if (data.type === "owner_approved" || data.type === "turf_approved") {
      url = "/owners/dashboard";
    }
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then(
        (clientList) => {
          // Navigate a tab that is already showing the target (or a Turfzo
          // tab we can reuse) instead of just focusing the first one —
          // focusing left the user on whatever page they were already on.
          const sameOrigin = clientList.filter(
            (c) => new URL(c.url).origin === self.location.origin,
          );
          for (const client of sameOrigin) {
            if (client.url.includes(url)) {
              return "focus" in client ? client.focus() : undefined;
            }
          }
          for (const client of sameOrigin) {
            if ("navigate" in client && "focus" in client) {
              return client
                .navigate(url)
                .then((navigated) =>
                  "focus" in navigated ? navigated.focus() : undefined,
                );
            }
          }
          return clients.openWindow(url);
        },
      ),
    );
  });
} catch (err) {
  console.warn("[turfzo-sw] messaging unavailable:", err);
}
`;

export function GET() {
  const body = SW_SOURCE.replace("__API_KEY__", JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "").slice(1, -1))
    .replace("__AUTH_DOMAIN__", JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "").slice(1, -1))
    .replace("__PROJECT_ID__", JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").slice(1, -1))
    .replace("__STORAGE_BUCKET__", JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "").slice(1, -1))
    .replace("__SENDER_ID__", JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "").slice(1, -1))
    .replace("__APP_ID__", JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "").slice(1, -1));

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Service-Worker-Allowed": "/",
      "Content-Security-Policy": "default-src 'none'; script-src https://www.gstatic.com",
    },
  });
}
