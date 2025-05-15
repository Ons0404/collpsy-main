import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../(mvc)/lib/prisma"; // Adjust path as needed

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } } // Removed promptId as it’s unused
) {
  try {
    const chatId = params.chatId;
    const { userId, content, isAiMessage } = await req.json();

    // Validate input
    if (!userId || !content || typeof isAiMessage !== "boolean") {
      return NextResponse.json(
        {
          error: "Champs obligatoires manquants (userId, content, isAiMessage)",
        },
        { status: 400 }
      );
    }

    // Verify AIConversation exists
    const aiConversation = await prisma.aIConversation.findUnique({
      where: { id: parseInt(chatId) },
    });
    if (!aiConversation) {
      return NextResponse.json(
        { error: "Conversation AI non trouvée" },
        { status: 404 }
      );
    }

    // Verify user exists and is a student
    const user = await prisma.utilisateur.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user || user.role !== "ETUDIANT") {
      return NextResponse.json(
        { error: "Utilisateur non trouvé ou non étudiant" },
        { status: 404 }
      );
    }

    // Create new message
    const newMessage = await prisma.message.create({
      data: {
        senderId: parseInt(userId),
        content,
        isAiMessage,
        aiConversationId: parseInt(chatId),
        sentAt: new Date(),
      },
    });

    // Update AIConversation's updatedAt
    await prisma.aIConversation.update({
      where: { id: parseInt(chatId) },
      data: { updatedAt: new Date() },
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
