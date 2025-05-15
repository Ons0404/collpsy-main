// /home/ubuntu/collpsy_mvc_project/app/controllers/rapports/rapportController.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client"; // Import Prisma
import { getServerSession } from "next-auth/next";
// Adjust the path based on your actual auth options location
import { authOptions } from "../../(mvc)/lib/auth"; 

// Ensure prisma client is correctly initialized and accessible.
// Using a new instance for now, but centralizing prisma client is recommended.
const prisma = new PrismaClient();

// Handler for POST /api/rapports
// Handler for POST /api/rapports
export const createRapport = async (req: NextRequest) => {
  try {
    // Remove session validation
    const { etudiantId, titre, description, psychologueId } = await req.json();

    if (!etudiantId || !titre || !psychologueId) {
      return NextResponse.json(
        { error: "etudiantId, titre, et psychologueId sont requis" },
        { status: 400 }
      );
    }

    // Assuming etudiantId is passed as a number from the frontend/request
    const etudiantIdNum = Number(etudiantId);
    if (isNaN(etudiantIdNum)) {
        return NextResponse.json({ error: "etudiantId doit être un nombre valide" }, { status: 400 });
    }

    // Parsing psychologueId as number
    const psychologueIdNum = Number(psychologueId);
    if (isNaN(psychologueIdNum)) {
        return NextResponse.json({ error: "psychologueId doit être un nombre valide" }, { status: 400 });
    }

    // Vérifier si l'étudiant existe
    const etudiant = await prisma.etudiant.findUnique({
      where: { id_etudiant: etudiantIdNum },
    });

    if (!etudiant) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le psychologue existe
    const psychologue = await prisma.psychologue.findUnique({
      where: { id_psychologue: psychologueIdNum },
    });

    if (!psychologue) {
      return NextResponse.json(
        { error: "Psychologue non trouvé" },
        { status: 404 }
      );
    }

    // Créer le nouveau rapport
    const newRapport = await prisma.rapport.create({
      data: {
        etudiantId: etudiantIdNum,
        psychologueId: psychologueIdNum,
        titre,
        description: description || null,
      },
    });

    return NextResponse.json(newRapport, { status: 201 });
  } catch (error) {
    console.error("Controller Error creating rapport:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur lors de la création du rapport" },
      { status: 500 }
    );
  }
};


// Handler for POST /api/rapports/add-resultat
export const addResultatToRapport = async (request: NextRequest) => {
  try {
    const { rapportId, resultatId } = await request.json();

    if (!rapportId || !resultatId) {
      return NextResponse.json(
        { error: "rapportId et resultatId sont requis" },
        { status: 400 }
      );
    }

    // Based on errors, rapportId and resultatId are expected as STRING by Prisma
    // Keep them as strings, do not convert to Number

    // Check if rapport exists
    const rapport = await prisma.rapport.findUnique({
      where: { id: rapportId }, // Use string ID
      include: { resultatTests: true },
    });

    if (!rapport) {
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    // Check if resultat exists
    const resultat = await prisma.resultatTest.findUnique({
      where: { id: resultatId }, // Use string ID
    });

    if (!resultat) {
      return NextResponse.json(
        { error: "Résultat non trouvé" },
        { status: 404 }
      );
    }

    // Correct comparison: compare string rapportId with resultat.rapportId (which should also be string or null)
    if (resultat.rapportId === rapportId) {
       return NextResponse.json(
        { message: "Ce résultat est déjà associé à ce rapport" },
        { status: 409 } // Conflict
      );
    }

    // Update the resultatTest to associate it with the rapport
    await prisma.resultatTest.update({
      where: { id: resultatId }, // Use string ID
      data: { rapportId: rapportId }, // Use string ID
    });

    return NextResponse.json(
      { message: "Résultat ajouté au rapport avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Controller Error adding resultat to rapport:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      {
        error: "Échec de l\"ajout du résultat au rapport",
        details: errorMessage
      },
      { status: 500 }
    );
  } finally {
     // await prisma.$disconnect();
  }
};

// Handler for GET /api/rapports/[etudiantId]/[rapportId]
export const getRapportByEtudiantAndId = async (
  request: NextRequest,
  { params }: { params: { etudiantId: string; rapportId: string } }
) => {
  try {
    const etudiantId = parseInt(params.etudiantId);
    const rapportId = params.rapportId; // Keep as string

    if (isNaN(etudiantId)) {
      return NextResponse.json(
        { error: "ID d\"étudiant invalide" },
        { status: 400 }
      );
    }

    if (!rapportId) {
      return NextResponse.json(
        { error: "ID de rapport manquant" },
        { status: 400 }
      );
    }

    const rapport = await prisma.rapport.findFirst({
      where: {
        id: rapportId, // Use string ID
        etudiantId: etudiantId, // Assuming etudiantId FK is Int
      },
      include: {
        resultatTests: {
          select: {
            id: true,
            testId: true,
            score: true,
            interpretation: true,
            datePassation: true,
          },
        },
      },
    });

    if (!rapport) {
      return NextResponse.json(
        { error: "Rapport non trouvé pour cet étudiant" },
        { status: 404 }
      );
    }

    return NextResponse.json(rapport, { status: 200 });
  } catch (error) {
    console.error("Controller Error fetching rapport:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      {
        error: "Échec de la récupération du rapport",
        details: errorMessage
      },
      { status: 500 }
    );
  } finally {
     // await prisma.$disconnect();
  }
};

// Handler for GET /api/etudiants/[id]/rapports
export const getRapportsByEtudiantId = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const etudiantId = parseInt(params.id);
    if (isNaN(etudiantId)) {
      return NextResponse.json(
        { error: "ID étudiant invalide" },
        { status: 400 }
      );
    }

    // Verify student exists
    const etudiantExists = await prisma.etudiant.findUnique({
      where: { id_etudiant: etudiantId }, // Assuming id_etudiant is Int
    });

    if (!etudiantExists) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    const rapports = await prisma.rapport.findMany({
      where: { etudiantId }, // Assuming etudiantId FK is Int
      include: {
        psychologue: {
          select: {
            id_psychologue: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        },
        etudiant: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true,
                date_naissance: true,
                telephone: true,
              },
            },
            fichesPatients: true,
          },
        },
        rapportEntries: true,
        resultatTests: {
          include: {
            test: {
              select: {
                titre: true,
                categorie: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(rapports, { status: 200 });

  } catch (error: unknown) {
    console.error(
      `Controller Error fetching rapports for etudiantId ${params.id}:`,
      error
    );

    let errorMessage = "Erreur inconnue";
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         console.error("Prisma error code:", error.code);
         console.error("Prisma error meta:", error.meta);
      }
    }

    return NextResponse.json(
      {
        error: "Échec de la récupération des rapports",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  } finally {
     // await prisma.$disconnect();
  }
};


// Placeholder for other rapport controller functions

