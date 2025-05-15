// app/api/psychologists/rapports/[id]/commentaire/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { commentaires } = await request.json();
    console.log(
      "Received data for rapportId:",
      params.id,
      "Commentaires:",
      commentaires
    );

    // Validate the input
    if (!commentaires || typeof commentaires !== "string") {
      return NextResponse.json(
        { error: "Commentaire requis et doit être une chaîne" },
        { status: 400 }
      );
    }

    if (!commentaires.trim()) {
      return NextResponse.json(
        { error: "Le commentaire ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Verify the report exists
    const rapportExists = await prisma.rapport.findUnique({
      where: { id: params.id },
    });

    if (!rapportExists) {
      console.log(`Rapport with ID ${params.id} not found`);
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    // Update the report with the new comment
    const updatedRapport = await prisma.rapport.update({
      where: { id: params.id },
      data: {
        commentaires,
      },
      include: {
        psychologue: {
          select: {
            id_psychologue: true,
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        },
        etudiant: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true,
                date_naissance: true,
                telephone: true,
              },
            },
            fichesPatients: true,
          },
        },
        rapportEntries: true,
        resultatTests: {
          include: {
            test: {
              select: {
                titre: true,
                categorie: true,
              },
            },
          },
        },
      },
    });

    console.log("Updated rapport:", updatedRapport);

    // Format the response to match the frontend's expected structure
    const formattedRapport = {
      ...updatedRapport,
      psychologue: updatedRapport.psychologue
        ? {
            ...updatedRapport.psychologue,
            utilisateur: updatedRapport.psychologue.utilisateur || {
              nom: "Inconnu",
              prenom: "",
            },
          }
        : null,
      etudiant: {
        utilisateur: updatedRapport.etudiant.utilisateur || {
          nom: "Inconnu",
          prenom: "",
          email: "",
          date_naissance: "",
          telephone: "",
        },
        fichesPatients: updatedRapport.etudiant.fichesPatients || null,
      },
      commentaires: updatedRapport.commentaires || null,
      createdAt: updatedRapport.createdAt.toISOString(),
      updatedAt: updatedRapport.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedRapport, { status: 200 });
  } catch (error: unknown) {
    console.error(
      `Erreur lors de la mise à jour du commentaire pour le rapport ${params.id}:`,
      error
    );

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error details:", error.meta);
      return NextResponse.json(
        {
          error: "Échec de la mise à jour du commentaire",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
          prismaCode: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Échec de la mise à jour du commentaire",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}
