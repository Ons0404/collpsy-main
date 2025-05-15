import { NextRequest, NextResponse } from "next/server";
import prisma from "../../(mvc)/lib/prisma";
import { createReclamation } from "../../(mvc)/controllers/reclamationController";

// POST /api/reclamations
export async function POST(request: NextRequest) {
  try {
    // Extraire les données de la requête
    const formData = await request.formData();
    const categorie = formData.get("categorie") as string;
    const description = formData.get("description") as string;
    const isUrgent = formData.get("isUrgent") === "true";
    const utilisateurId = parseInt(formData.get("utilisateurId") as string);
    const roleUtilisateur = formData.get("roleUtilisateur") as string;

    // Gestion de la pièce jointe
    const pieceJointe = formData.get("pieceJointe") as File;
    let fichierNom = null;

    if (pieceJointe) {
      // Logique pour sauvegarder le fichier
      // Exemple : stocker le fichier dans un dossier public ou dans un service de stockage
      // Ici, nous enregistrons simplement le nom pour démonstration
      fichierNom = pieceJointe.name;

      // Si vous souhaitez réellement implémenter le stockage de fichiers :
      // const buffer = Buffer.from(await pieceJointe.arrayBuffer());
      // const uploadDir = path.join(process.cwd(), "public/uploads");
      // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      // fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    }

    // Valider les données
    if (!categorie || !description || !utilisateurId) {
      return NextResponse.json(
        { error: "Données incomplètes" },
        { status: 400 }
      );
    }

    // Appeler le contrôleur pour créer la réclamation
    const reclamation = await createReclamation({
      categorie,
      description,
      isUrgent,
      pieceJointe: fichierNom,
      utilisateurId,
      roleUtilisateur,
    });

    return NextResponse.json(
      {
        message: "Réclamation créée avec succès",
        reclamation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la réclamation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réclamation" },
      { status: 500 }
    );
  }
}

// GET /api/reclamations
export async function GET(request: NextRequest) {
  try {
    // Récupérer l'ID de l'utilisateur depuis les paramètres de requête
    const url = new URL(request.url);
    const utilisateurId = url.searchParams.get("utilisateurId");

    if (!utilisateurId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Récupérer les réclamations de l'utilisateur
    const reclamations = await prisma.reclamation.findMany({
      where: {
        utilisateurId: parseInt(utilisateurId),
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return NextResponse.json(reclamations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réclamations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réclamations" },
      { status: 500 }
    );
  }
}
