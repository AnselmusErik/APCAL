import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Backoffice: require ADMIN or MANAGER role
    if (
      pathname.startsWith("/backoffice") &&
      !pathname.startsWith("/backoffice/login")
    ) {
      const userRoles: string[] = (token?.roles as string[]) ?? [];
      const hasAccess =
        userRoles.includes("ADMIN") || userRoles.includes("MANAGER");
      if (!hasAccess) {
        return NextResponse.redirect(new URL("/backoffice/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes — always allowed
        if (
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/backoffice/login"
        ) {
          return true;
        }

        // Protected routes — require token
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/backoffice") ||
          pathname.startsWith("/profile")
        ) {
          return !!token;
        }

        return true;
      },
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/backoffice/:path*", "/profile/:path*"],
};
