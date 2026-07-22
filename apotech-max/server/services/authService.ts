import bcrypt from "bcrypt";
import { userRepository } from "@/server/repositories/userRepository";
import { ConflictError, UnauthorizedError, NotFoundError } from "@/server/utils/errors";
import type { RegisterInput } from "@/server/utils/validation";

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    return userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });
  },

  async validateCredentials(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return user;
  },

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },
};
