import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Interfaces pour typer les données
interface Reponse {
  questionId: string;
  optionId: string | null;
  texteLibre: string | null;
  question: { texte: string; type: string };
  option: { texte: string; valeur: number } | null;
}

interface ResultatTest {
  id: string;
  testId: string;
  etudiantId: number;
  score: number;
  interpretation: string;
  datePassation: string;
  test: {
    titre: string;
    description: string | null;
    categorie: string;
    interpretation: string | null; // Aligner avec Prisma (string | null)
  };
  reponses: Reponse[];
}

export async function GET(req: NextRequest) {
  try {
    // Récupérer les paramètres de la requête (userId et psychologueId depuis les query params)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const psychologueId = searchParams.get("psychologueId");

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: "userId invalide ou manquant" },
        { status: 400 }
      );
    }

    if (!psychologueId) {
      return NextResponse.json(
        { error: "psychologueId est requis" },
        { status: 400 }
      );
    }

    // Récupérer les résultats des tests pour l'étudiant spécifié
    const testResults = await prisma.resultatTest.findMany({
      where: {
        etudiantId: Number(userId),
        etudiant: {
          utilisateur: {
            rendezVous: {
              some: {
                id_psychologue: Number(psychologueId),
              },
            },
          },
        },
      },
      include: {
        test: {
          select: {
            titre: true,
            description: true,
            categorie: true,
            interpretation: true, // Inclure l'interprétation générale du test
          },
        },
        reponses: {
          include: {
            question: {
              select: {
                texte: true,
                type: true,
              },
            },
            option: {
              select: {
                texte: true,
                valeur: true,
              },
            },
          },
        },
      },
    });

    // Formatter les données pour correspondre à l'interface ResultatTest
    const formattedTestResults: ResultatTest[] = testResults.map((result) => ({
      id: result.id,
      etudiantId: result.etudiantId,
      testId: result.testId,
      score: result.score,
      interpretation:
        result.interpretation || "Aucune interprétation disponible",
      datePassation: result.datePassation.toISOString(),
      test: {
        titre: result.test.titre,
        description: result.test.description,
        categorie: result.test.categorie,
        interpretation: result.test.interpretation, // Type string | null
      },
      reponses: result.reponses.map((reponse) => ({
        questionId: reponse.questionId,
        optionId: reponse.optionId,
        texteLibre: reponse.texteLibre,
        question: {
          texte: reponse.question.texte,
          type: reponse.question.type,
        },
        option: reponse.option
          ? {
              texte: reponse.option.texte,
              valeur: reponse.option.valeur,
            }
          : null,
      })),
    }));

    return NextResponse.json(formattedTestResults, { status: 200 });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des résultats des tests:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des résultats des tests" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Méthode POST non supportée pour cette route" },
    { status: 405 }
  );
}
