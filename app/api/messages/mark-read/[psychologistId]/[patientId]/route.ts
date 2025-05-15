import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { psychologistId: string; patientId: string } }
) {
  try {
    const { psychologistId, patientId } = params;

    // Trouver la conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        psychologistId: Number(psychologistId),
        userId: Number(patientId),
      },
      include: {
        messages: {
          where: {
            readAt: null,
            senderId: Number(patientId), // Seuls les messages du patient doivent être marqués comme lus
          },
        },
        userMessages: {
          where: {
            readAt: null,
            senderId: Number(patientId), // Seuls les messages du patient doivent être marqués comme lus
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Mettre à jour les messages non lus
    await prisma.$transaction([
      prisma.message.updateMany({
        where: {
          id: {
            in: conversation.messages.map((msg) => msg.id),
          },
        },
        data: {
          readAt: new Date(),
        },
      }),
      prisma.userMessage.updateMany({
        where: {
          id: {
            in: conversation.userMessages.map((msg) => msg.id),
          },
        },
        data: {
          readAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: "Messages marked as read" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
