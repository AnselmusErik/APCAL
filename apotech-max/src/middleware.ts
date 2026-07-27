import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const pathname = req.nextUrl.pathname;

  // We consider the user authenticated if they have a refresh token (or access token)
  const isAuthenticated = !!token || !!refreshToken;

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/backoffice/login";
  
  // Public assets and API routes shouldn't be heavily intercepted here unless necessary
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/brand")) {
    return NextResponse.next();
  }

  if (isAuthenticated) {
    if (isAuthPage || pathname === "/" || pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/sampling", req.url));
    }
  } else {
    // If NOT authenticated, and trying to access anything other than auth pages
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|brand).*)",
  ],
};
