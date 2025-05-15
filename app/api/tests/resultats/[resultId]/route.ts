import { NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { resultId: string } }
) {
  try {
    const result = await prisma.resultatTest.findUnique({
      where: { id: params.resultId },
      include: {
        reponses: {
          include: {
            question: true,
            option: true,
          },
        },
        test: {
          select: {
            titre: true,
            description: true,
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
    console.error("Error fetching result details:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du résultat" },
      { status: 500 }
    );
  }
}
