import { NextResponse } from "next/server";
import  prisma  from "../../../../(mvc)/lib/prisma";

export async function GET() {
  try {
    // Récupérer les psychologues dont le compte utilisateur est en attente de validation
    const pendingPsychologists = await prisma.psychologue.findMany({
      where: {
        utilisateur: {
          statut: false,
        },
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            civilite: true,
            date_inscription: true,
            telephone: true,
          },
        },
      },
      orderBy: {
        utilisateur: {
          date_inscription: "asc", // Les plus anciens d'abord
        },
      },
    });

    return NextResponse.json(pendingPsychologists);
  } catch (error) {
    console.error("Error fetching pending psychologists:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending psychologists" },
      { status: 500 }
    );
  }
}

// API pour valider un psychologue spécifique
export async function PUT(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: "Psychologist ID is required" },
      { status: 400 }
    );
  }

  try {
    // Mettre à jour le statut de l'utilisateur associé au psychologue
    const updatedUser = await prisma.utilisateur.update({
      where: {
        id: Number(id),
      },
      data: {
        statut: true,
      },
    });

    // Créer une notification pour informer l'utilisateur
    await prisma.notification.create({
      data: {
        userId: Number(id),
        message:
          "Votre compte de psychologue a été validé. Vous pouvez maintenant accéder à toutes les fonctionnalités.",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Psychologist account validated successfully",
    });
  } catch (error) {
    console.error("Error validating psychologist:", error);
    return NextResponse.json(
      { error: "Failed to validate psychologist" },
      { status: 500 }
    );
  }
}
