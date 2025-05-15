import bcrypt from "bcryptjs";

// auth.ts
export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Échec de la requête de réinitialisation"); // Line 13
    }

    return response.json();
  } catch (error) {
    console.error("Erreur dans requestPasswordReset:", error); // Line 20
    throw error instanceof Error
      ? error
      : new Error("Échec de l'envoi de l'email de réinitialisation");
  }
}
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de la réinitialisation du mot de passe"
      );
    }
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    throw error;
  }
}
