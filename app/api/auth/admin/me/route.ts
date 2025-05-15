import { NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    console.log("API /auth/admin/me called");

    const cookiesList = cookies();
    const cookiesArray = Array.from(cookiesList.getAll());
    console.log("Cookies received:", cookiesArray);

    const sessionToken = cookiesList.get("sessionToken")?.value;
    const adminId = cookiesList.get("adminId")?.value;

    console.log("Session token:", sessionToken, "Admin ID:", adminId);

    if (!sessionToken || !adminId) {
      console.error("Missing required cookies:", {
        sessionToken,
        adminId,
      });
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const sessionId = parseInt(sessionToken);
    if (isNaN(sessionId)) {
      console.error("Invalid sessionToken format:", sessionToken);
      return NextResponse.json(
        { success: false, error: "Jeton de session invalide" },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      console.error("Session not found for token:", sessionToken);
      return NextResponse.json(
        { success: false, error: "Session introuvable" },
        { status: 401 }
      );
    }

    if (session.expiresAt < new Date()) {
      console.error("Session expired for token:", sessionToken);
      return NextResponse.json(
        { success: false, error: "Session expirée" },
        { status: 401 }
      );
    }

    const parsedAdminId = parseInt(adminId);
    if (isNaN(parsedAdminId)) {
      console.error("Invalid adminId format:", adminId);
      return NextResponse.json(
        { success: false, error: "ID administrateur invalide" },
        { status: 400 }
      );
    }

    if (!session.administrateurId) {
      console.error("Session is not linked to an administrator");
      return NextResponse.json(
        { success: false, error: "Session non valide pour un administrateur" },
        { status: 401 }
      );
    }

    if (session.administrateurId !== parsedAdminId) {
      console.error("Admin ID mismatch:", {
        sessionAdminId: session.administrateurId,
        cookieAdminId: parsedAdminId,
      });
      return NextResponse.json(
        { success: false, error: "Session non valide pour cet administrateur" },
        { status: 401 }
      );
    }

    console.log("Authenticating admin with ID:", session.administrateurId);
    const admin = await prisma.administrateur.findUnique({
      where: { id: session.administrateurId },
    });

    if (!admin) {
      console.error("Admin not found with ID:", session.administrateurId);
      return NextResponse.json(
        { success: false, error: "Administrateur non trouvé" },
        { status: 404 }
      );
    }

    console.log("Admin authenticated successfully");
    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          role: "ADMIN",
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    let errorMessage = "Erreur serveur lors de la récupération des données";
    let errorDetails = "Détails non disponibles";

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = `Erreur de base de données: ${error.message}`;
      errorDetails = `Code: ${error.code}, Meta: ${JSON.stringify(error.meta)}`;
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      errorMessage = "Erreur de base de données inconnue";
      errorDetails = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "Pile non disponible";
    }

    console.error("Detailed error in /api/auth/admin/me:", {
      message: errorMessage,
      details: errorDetails,
    });

    return NextResponse.json(
      { success: false, error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}
