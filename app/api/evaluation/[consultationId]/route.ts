import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { consultationId: string } }
) {
  try {
    const consultationId = Number(params.consultationId);

    if (isNaN(consultationId) || consultationId <= 0) {
      return NextResponse.json(
        { error: "consultationId doit être un nombre valide" },
        { status: 400 }
      );
    }

    const evaluation = await prisma.evaluation.findFirst({
      where: {
        consultationId: consultationId,
      },
      include: {
        consultation: {
          select: {
            id: true,
            startTime: true,
          },
        },
        etudiant: {
          include: {
            utilisateur: {
              select: {
                prenom: true,
                nom: true,
              },
            },
          },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json(
        { message: "Aucune évaluation trouvée pour cette consultation" },
        { status: 404 }
      );
    }

    // Format response to match Evaluation interface
    const formattedEvaluation = {
      ...evaluation,
      etudiant: {
        prenom: evaluation.etudiant.utilisateur?.prenom || "Inconnu",
        nom: evaluation.etudiant.utilisateur?.nom || "Inconnu",
      },
    };

    return NextResponse.json(formattedEvaluation, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'évaluation:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
