import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;

    // Validate conversationId
    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId" },
        { status: 400 }
      );
    }

    // Fetch messages for the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: Number(conversationId),
      },
      orderBy: {
        sentAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            avatar: true,
          },
        },
      },
    });

    if (!messages) {
      return NextResponse.json(
        { error: "No messages found for this conversation" },
        { status: 404 }
      );
    }

    // Format messages to match the expected Message interface
    const formattedMessages = messages.map((message) => ({
      id: message.id.toString(),
      content: message.content,
      sentAt: message.sentAt.toISOString(),
      readAt: message.readAt ? message.readAt.toISOString() : null,
      sender: {
        id: message.sender.id,
        prenom: message.sender.prenom,
        nom: message.sender.nom,
        avatar: message.sender.avatar || undefined,
      },
      conversationId: message.conversationId,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
