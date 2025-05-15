// app/api/messages/mark-read/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const { conversationId, userId } = await request.json();

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "Missing conversationId or userId" },
        { status: 400 }
      );
    }

    await prisma.userMessage.updateMany({
      where: {
        conversationId,
        recipientId: userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
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
