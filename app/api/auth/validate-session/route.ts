import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

// Fonction pour parser le sessionToken
function parseSessionToken(token: string): number | null {
  const id = parseInt(token, 10);
  return isNaN(id) ? null : id;
}

export async function POST(req: NextRequest) {
  const { sessionToken } = await req.json();

  if (!sessionToken || typeof sessionToken !== "string") {
    return NextResponse.json(
      { isValid: false, error: "Token de session manquant ou invalide." },
      { status: 400 }
    );
  }

  const sessionId = parseSessionToken(sessionToken);

  if (sessionId === null) {
    return NextResponse.json(
      { isValid: false, error: "Format du token de session invalide." },
      { status: 400 }
    );
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { utilisateur: { select: { id: true, role: true } } },
    });

    if (session && session.expiresAt > new Date()) {
      if (!session.utilisateur) {
        await prisma.session
          .delete({ where: { id: sessionId } })
          .catch(console.error);
        return NextResponse.json(
          {
            isValid: false,
            error: "Session invalide : aucun utilisateur associé.",
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        isValid: true,
        user: {
          id: session.utilisateur.id,
          role: session.utilisateur.role,
        },
      });
    } else {
      if (session) {
        await prisma.session
          .delete({ where: { id: sessionId } })
          .catch(console.error);
      }
      return NextResponse.json(
        { isValid: false, error: "Session invalide ou expirée." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("[API_VALIDATE_SESSION] Prisma error:", error);
    return NextResponse.json(
      {
        isValid: false,
        error: "Erreur interne du serveur lors de la validation de la session.",
      },
      { status: 500 }
    );
  }
}
