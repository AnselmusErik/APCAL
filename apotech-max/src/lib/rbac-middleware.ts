// @ts-ignore - TypeScript has issues with next-auth/jwt exports
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/server/utils/errors";

type RouteHandler = (req: NextRequest, context?: unknown) => Promise<NextResponse>;

/**
 * Wraps an API route handler to require authentication.
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
      });
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return handler(req, context);
    } catch (error) {
      const { message, status } = handleApiError(error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}

/**
 * Wraps an API route handler to require specific roles.
 */
export function withRoles(...roles: string[]): (handler: RouteHandler) => RouteHandler {
  return (handler) => async (req, context) => {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
      });
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userRoles: string[] = (token.roles as string[]) ?? [];
      const hasRole = roles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return handler(req, context);
    } catch (error) {
      const { message, status } = handleApiError(error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}

/**
 * Wraps an API route handler to require specific permissions.
 */
export function withPermissions(...permissions: string[]): (handler: RouteHandler) => RouteHandler {
  return (handler) => async (req, context) => {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
      });
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userPerms: string[] = (token.permissions as string[]) ?? [];
      const hasPerms = permissions.every((perm) => userPerms.includes(perm));
      if (!hasPerms) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return handler(req, context);
    } catch (error) {
      const { message, status } = handleApiError(error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}
