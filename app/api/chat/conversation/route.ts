import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

// GET: Fetch AI conversations for a user
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: "ID utilisateur invalide ou manquant" },
        { status: 400 }
      );
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { userId: parseInt(userId) },
      include: {
        messages: {
          orderBy: { sentAt: "asc" },
          take: 10,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(conversations, { status: 200 });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des conversations AI:",
      error
    );
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// POST: Create a new AI conversation
export async function POST(req: NextRequest) {
  try {
    const { userId, etudiantId } = await req.json();

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: "ID utilisateur invalide ou manquant" },
        { status: 400 }
      );
    }
    if (!etudiantId || isNaN(parseInt(etudiantId))) {
      return NextResponse.json(
        { error: "ID étudiant invalide ou manquant" },
        { status: 400 }
      );
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id: parseInt(userId) },
      include: { etudiant: true },
    });

    if (!user || user.role !== "ETUDIANT" || !user.etudiant) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé ou non étudiant" },
        { status: 404 }
      );
    }

    const newConversation = await prisma.aIConversation.create({
      data: {
        userId: parseInt(userId),
        etudiantId: parseInt(etudiantId),
        createdAt: new Date(),
      },
      include: { messages: true },
    });

    return NextResponse.json(newConversation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la conversation AI:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
