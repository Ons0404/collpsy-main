import { NextResponse } from "next/server";
import  prisma  from "../../../(mvc)/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, etudiantId, rendezVousId, consultationId } =
      await request.json();

    if (!userId || !etudiantId) {
      return NextResponse.json(
        { error: "userId et etudiantId sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si une conversation existe déjà
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        userId,
        etudiantId,
      },
    });

    if (existingConversation) {
      return NextResponse.json(
        { error: "Une conversation existe déjà" },
        { status: 409 }
      );
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        etudiantId,
        consultationId,
        createdAt: new Date(),
      },
    });

    // Créer une notification pour l'étudiant
    const psychologue = await prisma.utilisateur.findUnique({
      where: { id: userId },
    });

    await prisma.notification.create({
      data: {
        userId: etudiantId,
        message: `Une nouvelle conversation a été initiée par ${psychologue?.prenom} ${psychologue?.nom}`,
        date: new Date(),
        read: false,
        conversationId: conversation.id,
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
