import { NextResponse } from "next/server";
import { loginUser } from "../../../(mvc)/controllers/authController";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "L'email et le mot de passe sont requis." },
        { status: 400 }
      );
    }

    return await loginUser(email, password);
  } catch (error) {
    console.error("[LOGIN_API_ROUTE] Error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Format JSON invalide." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Une erreur interne s'est produite lors de la tentative de connexion.",
      },
      { status: 500 }
    );
  }
}
