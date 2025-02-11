import { type User } from "@prisma/client";

declare global {
  type UserWithoutPassword = Omit<User, "hashedPassword">;
}

export {};
