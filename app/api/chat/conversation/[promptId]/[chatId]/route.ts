// app/api/chat/[chatId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId;
    const { content, senderId, isAiMessage } = await req.json();

    if (!content || !senderId || typeof isAiMessage !== "boolean") {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const aiConversation = await prisma.aIConversation.findUnique({
      where: { id: parseInt(chatId) },
    });
    if (!aiConversation) {
      return NextResponse.json(
        { error: "Conversation AI non trouvée" },
        { status: 404 }
      );
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id: parseInt(senderId) },
    });
    if (!user || user.role !== "ETUDIANT") {
      return NextResponse.json(
        { error: "Utilisateur non trouvé ou non étudiant" },
        { status: 404 }
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        content,
        isAiMessage,
        aiConversationId: parseInt(chatId),
        sentAt: new Date(),
      },
    });

    await prisma.aIConversation.update({
      where: { id: parseInt(chatId) },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
