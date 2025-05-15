import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

// Handler pour GET : Récupérer les détails d'une conversation
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = parseInt(params.chatId);

    // Vérifier si le chatId est valide
    if (isNaN(chatId)) {
      return NextResponse.json(
        { error: "ID de conversation invalide" },
        { status: 400 }
      );
    }

    // Récupérer la conversation avec ses messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { sentAt: "asc" }, // Trier les messages par date d'envoi
        },
        utilisateur: true, // Inclure les détails de l'utilisateur associé
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de la conversation:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

// Handler pour POST : Ajouter un nouveau message à la conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = parseInt(params.chatId);
    const { content, senderId, isAiMessage } = await req.json();

    // Vérifier les paramètres
    if (isNaN(chatId)) {
      return NextResponse.json(
        { error: "ID de conversation invalide" },
        { status: 400 }
      );
    }
    if (!content || !senderId) {
      return NextResponse.json(
        { error: "Contenu ou ID de l'expéditeur manquant" },
        { status: 400 }
      );
    }

    // Vérifier si la conversation existe
    const conversation = await prisma.conversation.findUnique({
      where: { id: chatId },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Créer le nouveau message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: chatId,
        senderId: parseInt(senderId),
        content,
        sentAt: new Date(),
        isAiMessage: isAiMessage || false, // Par défaut false si non spécifié
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout du message:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
