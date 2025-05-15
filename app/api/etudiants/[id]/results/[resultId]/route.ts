import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string; resultId: string } }
) {
  try {
    const etudiantId = parseInt(params.id);
    const resultId = params.resultId;

    if (isNaN(etudiantId) || !resultId) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Récupérer le résultat spécifique avec toutes les relations
    const result = await prisma.resultatTest.findUnique({
      where: {
        id: resultId,
        etudiantId,
      },
      include: {
        test: {
          select: {
            titre: true,
            description: true,
            categorie: true,
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
          orderBy: {
            question: {
              ordre: "asc",
            },
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Résultat non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching test result:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du résultat" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; resultId: string } }
) {
  try {
    const etudiantId = parseInt(params.id);
    const resultId = params.resultId;
    const data = await request.json();

    if (isNaN(etudiantId) || !resultId) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Mise à jour du résultat
    const updatedResult = await prisma.resultatTest.update({
      where: {
        id: resultId,
        etudiantId,
      },
      data: {
        interpretation: data.interpretation,
        // Autres champs modifiables
      },
      include: {
        test: {
          select: {
            titre: true,
          },
        },
      },
    });

    return NextResponse.json(updatedResult);
  } catch (error) {
    console.error("Error updating test result:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour du résultat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; resultId: string } }
) {
  try {
    const etudiantId = parseInt(params.id);
    const resultId = params.resultId;

    if (isNaN(etudiantId) || !resultId) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Suppression transactionnelle (d'abord les réponses puis le résultat)
    await prisma.$transaction([
      prisma.reponseUtilisateur.deleteMany({
        where: {
          resultatId: resultId,
        },
      }),
      prisma.resultatTest.delete({
        where: {
          id: resultId,
          etudiantId,
        },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting test result:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression du résultat" },
      { status: 500 }
    );
  }
}
