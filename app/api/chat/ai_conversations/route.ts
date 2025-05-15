import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("AI conversation request body:", body);
    const { userId, reset } = body;

    if (!userId || isNaN(userId)) {
      console.error("Missing or invalid userId:", userId);
      return NextResponse.json({ error: "User ID requis" }, { status: 400 });
    }

    if (reset) {
      console.log("Creating new AI conversation for userId:", userId);
      const newConversation = await prisma.aIConversation.create({
        data: {
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ conversationId: newConversation.id });
    }

    console.log("Checking existing AI conversation for userId:", userId);
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId },
      include: { messages: { orderBy: { sentAt: "asc" } } },
    });

    if (!conversation) {
      console.log("No existing conversation, creating new for userId:", userId);
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
