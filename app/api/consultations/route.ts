import { type NextRequest, NextResponse } from "next/server";
import { consultationService } from "../../(mvc)/services/consultationService";
import {
  ConsultationStatus,
  TypeConsultation,
  type CreateConsultationData,
} from "../../(mvc)/types/index";
import prisma from "../../(mvc)/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rendezVousId = searchParams.get("rendezVousId");

    if (!rendezVousId) {
      return NextResponse.json(
        { success: false, error: "rendezVousId is required" },
        { status: 400 }
      );
    }

    const consultations = await prisma.consultation.findMany({
      where: { rendezVousId: Number.parseInt(rendezVousId) },
    });

    return NextResponse.json(
      { success: true, data: consultations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/consultations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation des champs requis
    if (
      !body.etudiantId ||
      !body.psychologueId ||
      !body.rendezVousId ||
      !body.status ||
      !body.type ||
      !body.startTime
    ) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Validation explicite de status
    const validStatuses: ConsultationStatus[] = [
      ConsultationStatus.REQUESTED,
      ConsultationStatus.CONFIRMED,
      ConsultationStatus.IN_PROGRESS,
      ConsultationStatus.COMPLETED,
      ConsultationStatus.CANCELLED,
    ];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Statut invalide: ${
            body.status
          }. Valeurs attendues: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validation explicite de type
    const validTypes: TypeConsultation[] = [
      TypeConsultation.EN_LIGNE,
      TypeConsultation.PRESENTIEL,
    ];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Type invalide: ${
            body.type
          }. Valeurs attendues: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Handle endTime: if not provided, default to startTime + 1 hour
    const startTime = new Date(body.startTime);
    const endTime = body.endTime
      ? new Date(body.endTime)
      : new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid startTime or endTime" },
        { status: 400 }
      );
    }

    const consultation = await prisma.consultation.create({
      data: {
        etudiantId: Number.parseInt(body.etudiantId),
        psychologueId: Number.parseInt(body.psychologueId),
        rendezVousId: Number.parseInt(body.rendezVousId),
        roomId: body.roomId || null,
        status: body.status as ConsultationStatus,
        type: body.type as TypeConsultation,
        startTime,
        endTime, // Always a Date
        notes: body.notes || null,
        summary: body.summary || null,
      },
    });

    return NextResponse.json(
      { success: true, data: consultation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/consultations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rendezVousId = searchParams.get("rendezVousId");

    if (!rendezVousId) {
      return NextResponse.json(
        { success: false, error: "rendezVousId is required for update" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const etudiantId = Number.parseInt(body.etudiantId);
    const psychologueId = Number.parseInt(body.psychologueId);
    const startTime = new Date(body.startTime);
    const endTime = body.endTime
      ? new Date(body.endTime)
      : new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour

    if (
      isNaN(etudiantId) ||
      isNaN(psychologueId) ||
      isNaN(startTime.getTime()) ||
      isNaN(endTime.getTime())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid etudiantId, psychologueId, startTime, or endTime",
        },
        { status: 400 }
      );
    }

    const consultationData: CreateConsultationData = {
      etudiantId,
      psychologistId: psychologueId,
      startTime,
      endTime, // Always a Date
      type: body.type as TypeConsultation,
      status: body.status || ConsultationStatus.REQUESTED,
      notes: body.notes || null,
      roomId: body.roomId || null,
      rendezVousId: Number.parseInt(rendezVousId),
    };

    const updatedConsultation = await consultationService.updateConsultation(
      Number.parseInt(rendezVousId),
      consultationData
    );

    return NextResponse.json(
      { success: true, data: updatedConsultation },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/consultations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
