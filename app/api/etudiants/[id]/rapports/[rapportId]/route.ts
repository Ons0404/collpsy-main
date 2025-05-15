import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const etudiantId = parseInt(params.id);
    if (isNaN(etudiantId)) {
      return NextResponse.json(
        { error: "ID étudiant invalide" },
        { status: 400 }
      );
    }

    // Verify student exists first
    const etudiantExists = await prisma.etudiant.findUnique({
      where: { id_etudiant: etudiantId },
    });

    if (!etudiantExists) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    const rapports = await prisma.rapport.findMany({
      where: { etudiantId },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to ensure consistent response structure
    const formattedRapports = rapports.map((rapport) => ({
      ...rapport,
      psychologue: rapport.psychologue
        ? {
            ...rapport.psychologue,
            utilisateur: rapport.psychologue.utilisateur || {
              nom: "Inconnu",
              prenom: "",
            },
          }
        : null,
      createdAt: rapport.createdAt.toISOString(),
      updatedAt: rapport.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedRapports, { status: 200 });
  } catch (error: unknown) {
    console.error(
      `Erreur lors de la récupération des rapports pour etudiantId ${params.id}:`,
      error
    );

    // More detailed error logging with proper type checking
    if (error instanceof Error) {
      console.error("Error message:", error.message);

      // Check if it's a Prisma error
      if ("code" in error && "meta" in error) {
        const prismaError = error as Prisma.PrismaClientKnownRequestError;
        console.error("Prisma error details:", prismaError.meta);
      }
    }

    return NextResponse.json(
      {
        error: "Échec de la récupération des rapports",
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
