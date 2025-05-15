import { NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    console.log("API /auth/me called");

    const cookiesList = cookies();
    const cookiesArray = Array.from(cookiesList.getAll());
    console.log("Cookies received:", cookiesArray);

    const sessionToken = cookiesList.get("sessionToken")?.value;
    const userId = cookiesList.get("userId")?.value;
    const userRole = cookiesList.get("userRole")?.value;

    console.log(
      "Session token:",
      sessionToken,
      "User ID:",
      userId,
      "Role:",
      userRole
    );

    if (!sessionToken || !userId || !userRole) {
      console.error("Missing required cookies:", {
        sessionToken,
        userId,
        userRole,
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

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      console.error("Invalid userId format:", userId);
      return NextResponse.json(
        { success: false, error: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    if (userRole === "ADMIN" && session.administrateurId) {
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
          user: {
            id: admin.id,
            email: admin.email,
            role: "ADMIN",
          },
        },
        { status: 200 }
      );
    } else if (session.userId) {
      console.log("Authenticating user with session ID:", sessionToken);
      if (session.userId !== parsedUserId) {
        console.error("User ID mismatch:", {
          sessionUserId: session.userId,
          cookieUserId: parsedUserId,
        });
        return NextResponse.json(
          { success: false, error: "Session non valide pour cet utilisateur" },
          { status: 401 }
        );
      }

      const user = await prisma.utilisateur.findUnique({
        where: { id: parsedUserId },
        include: {
          etudiant: userRole === "ETUDIANT",
          psychologue: userRole === "PSYCHOLOGUE",
        },
      });

      if (!user) {
        console.error("User not found with ID:", parsedUserId);
        return NextResponse.json(
          { success: false, error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      if (user.role !== userRole) {
        console.error("Role mismatch:", {
          userRole: user.role,
          cookieRole: userRole,
        });
        return NextResponse.json(
          { success: false, error: "Rôle utilisateur incorrect" },
          { status: 401 }
        );
      }

      console.log(
        `User ${parsedUserId} authenticated successfully, role: ${userRole}`
      );

      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom || "",
        civilite: user.civilite || "",
        telephone: user.telephone,
        ville: user.ville,
        adresse: user.adresse,
        statut: user.statut ? "Actif" : "Inactif",
        avatar: user.avatar
          ? Buffer.from(user.avatar).toString("base64")
          : null,
        etudiant:
          userRole === "ETUDIANT" && user.etudiant
            ? {
                id_etudiant: user.etudiant.id_etudiant,
                numero_carte_etudiant: user.etudiant.numero_carte_etudiant,
                niveau: user.etudiant.niveau,
                etablissement: user.etudiant.etablissement,
              }
            : undefined,
        psychologue:
          userRole === "PSYCHOLOGUE" && user.psychologue
            ? {
                id_psychologue: user.psychologue.id_psychologue,
                cin: user.psychologue.cin,
                titre: user.psychologue.titre,
                etablissement: user.psychologue.etablissement,
              }
            : undefined,
      };

      return NextResponse.json(
        { success: true, user: userData },
        { status: 200 }
      );
    }

    console.error("Unrecognized session type");
    return NextResponse.json(
      { success: false, error: "Type de session non reconnu" },
      { status: 400 }
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

    console.error("Detailed error in /api/auth/me:", {
      message: errorMessage,
      details: errorDetails,
    });

    return NextResponse.json(
      { success: false, error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}
