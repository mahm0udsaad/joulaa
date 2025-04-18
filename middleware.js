import { NextResponse } from "next/server";
import { fallbackLng, languages } from "./app/i18n/settings";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log("Middleware triggered for path:", pathname);

  // Skip middleware for:
  // 1. API routes
  // 2. Static files
  // 3. Next.js internal paths

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Check for language prefix
  const pathnameHasLocale = languages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    let locale = fallbackLng;

    // Try to get language from cookie first
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && languages.includes(cookieLocale)) {
      locale = cookieLocale;
    }
    // Fallback to Accept-Language header
    else if (request.headers.has("Accept-Language")) {
      const acceptLanguage = request.headers.get("Accept-Language");
      locale =
        languages.find((lang) => acceptLanguage.startsWith(lang)) ||
        fallbackLng;
    }

    // Redirect with locale prefix
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/ routes
     * - _next/ static files
     * - _next/image image optimization files
     * - favicon.ico
     * - static assets (assets/)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
