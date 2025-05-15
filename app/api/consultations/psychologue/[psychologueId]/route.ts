import { NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { psychologueId: string } }
) {
  try {
    // Validate psychologueId
    const psychologueId = Number(params.psychologueId);
    if (isNaN(psychologueId) || psychologueId <= 0) {
      return NextResponse.json(
        { error: "L'ID du psychologue doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Fetch consultations with necessary relationships
    const consultations = await prisma.consultation.findMany({
      where: {
        psychologueId: psychologueId,
      },
      select: {
        id: true,
        etudiantId: true,
        psychologueId: true,
        status: true,
        type: true,
        startTime: true,
        endTime: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        rendezVousId: true,
        psychologue: {
          select: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                civilite: true,
              },
            },
          },
        },
        etudiant: {
          select: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                civilite: true,
              },
            },
          },
        },
        rendezVous: {
          select: {
            id: true,
            date: true,
            heure_debut: true,
            heure_fin: true,
            type: true,
            statut: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    if (!consultations.length) {
      return NextResponse.json(
        { message: "Aucune consultation trouvée pour ce psychologue" },
        { status: 404 }
      );
    }

    // Return consultations directly to match ApiConsultation interface
    return NextResponse.json(consultations, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des consultations:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
