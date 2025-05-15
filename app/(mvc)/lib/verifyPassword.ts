// lib/auth.ts
import { compare } from "bcryptjs";

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}
