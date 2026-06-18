import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/explore",
  "/tournaments",
  "/how-it-works",
  "/contact",
  "/blog",
  "/cities",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/auth/login",
  "/auth/signup",
  "/forgot-password",
  "/owners",
];

// Admin routes that require admin role (checked client-side with Convex)
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Check if the route is an admin route
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // For admin routes, add a header to indicate admin check is needed
  // The actual role verification happens in the admin layout component
  if (isAdminRoute) {
    const response = NextResponse.next();
    response.headers.set("x-admin-route", "true");
    return response;
  }

  // For all other routes, just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and api
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
