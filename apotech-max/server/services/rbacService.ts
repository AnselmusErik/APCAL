import { db } from "@/server/db/client";

export const rbacService = {
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await db.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role.name);
  },

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await db.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }
    return Array.from(permissions);
  },

  async assignRole(userId: string, roleId: string) {
    return db.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
  },

  async removeRole(userId: string, roleId: string) {
    return db.userRole.deleteMany({ where: { userId, roleId } });
  },
};
