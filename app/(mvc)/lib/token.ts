// app/utils/token.ts
import crypto from "crypto";

export function generateResetToken(email: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  // Tu peux également stocker ce jeton avec une expiration dans ta base de données
  return token;
}
