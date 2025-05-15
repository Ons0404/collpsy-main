import { NextResponse } from "next/server";
import { resetPasswordRequest } from "../../../(mvc)/controllers/authController";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { message: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    const { email } = body;
    return await resetPasswordRequest(email);
  } catch (error) {
    console.error("Erreur dans /api/auth/forgot-password:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
