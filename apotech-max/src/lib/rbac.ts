import { getServerSession } from "next-auth/next";
import { ForbiddenError, UnauthorizedError } from "@/server/utils/errors";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Returns the current session or throws UnauthorizedError.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * Returns true if the current user has the given role.
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.roles?.includes(role) ?? false;
}

/**
 * Returns true if the current user has the given permission.
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.permissions?.includes(permission) ?? false;
}

/**
 * Throws ForbiddenError if the current user does not have the given role.
 */
export async function requireRole(role: string) {
  const session = await requireAuth();
  if (!session.user.roles?.includes(role)) {
    throw new ForbiddenError(`Role '${role}' required`);
  }
  return session;
}

/**
 * Throws ForbiddenError if the current user does not have the given permission.
 */
export async function requirePermission(permission: string) {
  const session = await requireAuth();
  if (!session.user.permissions?.includes(permission)) {
    throw new ForbiddenError(`Permission '${permission}' required`);
  }
  return session;
}
