// app/api/consultations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rendezVousId = Number(params.id);
    if (isNaN(rendezVousId) || rendezVousId <= 0) {
      console.log(`Invalid rendezVousId: ${params.id}`);
      return NextResponse.json(
        { success: false, error: "ID de rendez-vous invalide" },
        { status: 400 }
      );
    }

    console.log(`Fetching consultation with rendezVousId: ${rendezVousId}`);

    const consultation = await prisma.consultation.findFirst({
      where: {
        rendezVousId: rendezVousId,
      },
      include: {
        etudiant: {
          include: {
            utilisateur: true,
          },
        },
        psychologue: {
          select: {
            id_psychologue: true,
            cin: true,
            titre: true,
            etablissement: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true,
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
            statut: true,
          },
        },
        evaluations: {
          select: {
            id: true,
            satisfaction: true,
            empathie: true,
            ecoute: true,
            comprehension: true,
            recommandation: true,
            commentaires: true,
          },
        },
      },
    });

    if (!consultation) {
      console.log(`No consultation found for rendezVousId: ${rendezVousId}`);
      return NextResponse.json(
        {
          success: false,
          error: "Consultation non trouvée pour ce rendez-vous",
        },
        { status: 404 }
      );
    }

    console.log(`Consultation found: ${JSON.stringify(consultation)}`);
    return NextResponse.json(
      { success: true, data: consultation },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in GET /api/consultations/[id]:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
        details: "Erreur lors de la récupération de la consultation",
      },
      { status: 500 }
    );
  }
}
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rendezVousId = Number(params.id);
    if (isNaN(rendezVousId) || rendezVousId <= 0) {
      console.log(`Invalid rendezVousId: ${params.id}`);
      return NextResponse.json(
        { success: false, error: "ID de rendez-vous invalide" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, endTime } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Le statut est requis" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Statut invalide" },
        { status: 400 }
      );
    }

    console.log(`Updating consultation with rendezVousId: ${rendezVousId}`);

    const consultation = await prisma.consultation.findFirst({
      where: { rendezVousId },
    });

    if (!consultation) {
      console.log(`No consultation found for rendezVousId: ${rendezVousId}`);
      return NextResponse.json(
        { success: false, error: "Consultation non trouvée" },
        { status: 404 }
      );
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultation.id },
      data: { status, endTime: endTime ? new Date(endTime) : undefined },
    });

    console.log(`Consultation updated: ${JSON.stringify(updatedConsultation)}`);
    return NextResponse.json(
      { success: true, data: updatedConsultation },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/consultations/[id]:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { success: false, error: "Consultation non trouvée" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
        details: "Erreur lors de la mise à jour de la consultation",
      },
      { status: 500 }
    );
  }
}