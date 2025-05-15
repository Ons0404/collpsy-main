import { NextResponse } from "next/server";
import { resetPassword } from "../../../(mvc)/controllers/authController";

export async function PUT(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { message: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (!body.token || !body.newPassword) {
      return NextResponse.json(
        { message: "Token et nouveau mot de passe requis" },
        { status: 400 }
      );
    }

    const { token, newPassword } = body;
    return await resetPassword(token, newPassword);
  } catch (error) {
    console.error("Erreur dans /api/auth/reset-password:", error);
    return NextResponse.json(
      {
        message:
          error instanceof SyntaxError
            ? "Corps de la requête invalide"
            : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
