import { db } from "@/server/db/client";
import type { UserWithRoles } from "@/server/types";

export const userRepository = {
  async findById(id: string): Promise<UserWithRoles | null> {
    return db.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  },

  async findByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  },

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      db.user.findMany({
        skip,
        take: limit,
        include: {
          roles: {
            include: { role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.user.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async create(data: {
    name?: string;
    email: string;
    password: string;
  }) {
    return db.user.create({ data });
  },

  async update(id: string, data: Partial<{ name: string; email: string; image: string }>) {
    return db.user.update({ where: { id }, data });
  },

  async delete(id: string) {
    return db.user.delete({ where: { id } });
  },
};
