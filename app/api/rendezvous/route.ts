// /home/ubuntu/collpsy_mvc_project/app/api/rendezvous/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createRendezVous,
  getRendezVousByUserIdQueryHandler, // Updated import
} from "../../(mvc)/controllers/rendezVousController";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createRendezVous(body);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 400 }
      );
    }

    // Ensure the result.data contains the created appointment
    const appointment = result.data;
    if (!appointment || !appointment.id_psychologue || !appointment.id) {
      throw new Error("Invalid appointment data returned");
    }

    // Fetch the psychologist to get their userId
    const psychologue = await prisma.psychologue.findUnique({
      where: { id_psychologue: appointment.id_psychologue },
      include: { utilisateur: true },
    });

    if (!psychologue || !psychologue.utilisateur) {
      throw new Error("Psychologue ou utilisateur associé non trouvé");
    }

    // Create a notification for the psychologist
    const notificationMessage = `Un étudiant a pris un rendez-vous avec vous le ${new Date(
      appointment.date
    ).toLocaleDateString("fr-FR")} de ${appointment.heure_debut} à ${
      appointment.heure_fin
    }.`;
    await prisma.notification.create({
      data: {
        userId: psychologue.utilisateur.id,
        message: notificationMessage,
        date: new Date(),
        read: false,
        rendezVousId: appointment.id,
      },
    });

    return NextResponse.json(
      {
        message: "Rendez-vous créé avec succès",
        data: appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rendezvous:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use the correct handler for GET requests with query parameters
    return await getRendezVousByUserIdQueryHandler(request);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
