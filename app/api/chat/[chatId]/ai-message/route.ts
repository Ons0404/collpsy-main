import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId, reset } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID requis" }, { status: 400 });
    }

    if (reset) {
      // Create a new AI conversation
      const newConversation = await prisma.aIConversation.create({
        data: {
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ conversationId: newConversation.id });
    }

    // Check for existing AI conversation
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId },
      include: { messages: { orderBy: { sentAt: "asc" } } },
    });

    if (!conversation) {
      // Create new AI conversation if none exists
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: { messages: { orderBy: { sentAt: "asc" } } },
      });
    }

    return NextResponse.json({
      conversationId: conversation.id,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Erreur dans l'API AI conversation:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
