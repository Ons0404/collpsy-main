import { NextRequest, NextResponse } from "next/server";
import prisma from "../../(mvc)/lib/prisma"; // Ajustez ce chemin selon votre structure

// Handler pour GET : Récupérer tous les prompts
export async function GET(req: NextRequest) {
  try {
    const prompts = await prisma.prompt.findMany({
      orderBy: { createdAt: "desc" },
      include: { promptHistory: true }, // Inclure l'historique si nécessaire
    });

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des prompts:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// Handler pour POST : Créer un nouveau prompt
export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      userFirstName,
      name,
      src,
      description,
      instructions,
      category,
      isPublic,
    } = await req.json();

    // Vérifier les paramètres obligatoires
    if (
      !userId ||
      !userFirstName ||
      !name ||
      !src ||
      !instructions ||
      !category
    ) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // Créer le nouveau prompt
    const newPrompt = await prisma.prompt.create({
      data: {
        userId,
        userFirstName,
        name,
        src,
        description: description || "",
        instructions,
        category,
        isPublic: isPublic !== undefined ? isPublic : false,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du prompt:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
