import { NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: { etudiantId: string } }
) {
  try {
    const etudiantId = parseInt(params.etudiantId);

    if (isNaN(etudiantId)) {
      return NextResponse.json(
        { error: "ID d'étudiant invalide" },
        { status: 400 }
      );
    }

    const results = await prisma.resultatTest.findMany({
      where: { etudiantId },
      include: {
        test: true,
        reponses: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      {
        error: "Échec de la récupération des résultats",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

// Si vous avez besoin de PUT ou DELETE pour des résultats spécifiques, ajoutez une autre route
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const etudiantId = parseInt(params.id);
    const data = await request.json();

    if (isNaN(etudiantId)) {
      return NextResponse.json(
        { error: "ID étudiant invalide" },
        { status: 400 }
      );
    }

    // Validation de base
    if (!data.testId || typeof data.score !== "number") {
      return NextResponse.json(
        { error: "Données requises manquantes" },
        { status: 400 }
      );
    }

    // Création transactionnelle
    const result = await prisma.$transaction(async (prisma) => {
      // Création du résultat principal
      const resultat = await prisma.resultatTest.create({
        data: {
          test: { connect: { id: data.testId } },
          etudiant: { connect: { id_etudiant: etudiantId } },
          score: data.score,
          interpretation: data.interpretation || "Non spécifié",
        },
      });

      // Création des réponses associées si elles existent
      if (data.reponses && data.reponses.length > 0) {
        await prisma.reponseUtilisateur.createMany({
          data: data.reponses.map(
            (rep: {
              questionId: string;
              optionId?: string;
              texteLibre?: string;
            }) => ({
              resultatId: resultat.id,
              questionId: rep.questionId,
              optionId: rep.optionId || null,
              texteLibre: rep.texteLibre || null,
            })
          ),
        });
      }

      return resultat;
    });

    // Récupérer le résultat complet avec les relations pour la réponse
    const fullResult = await prisma.resultatTest.findUnique({
      where: { id: result.id },
      include: {
        test: {
          select: {
            titre: true,
          },
        },
      },
    });

    return NextResponse.json(fullResult, { status: 201 });
  } catch (error: any) {
    console.error("Error creating test result:", error);

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Un résultat existe déjà pour cette combinaison test/étudiant",
        },
        { status: 409 }
      );
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Violation de contrainte de clé étrangère - Vérifiez les IDs fournis",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur serveur lors de la création du résultat",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
