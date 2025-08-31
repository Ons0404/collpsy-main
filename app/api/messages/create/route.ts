import { NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma"; // Adjust based on your Prisma export

export async function POST(request: Request) {
  try {
    const { etudiantId, psychologistId, content } = await request.json();

    // Find the utilisateur associated with the Etudiant
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        etudiant: {
          id_etudiant: etudiantId,
        },
      },
    });

    if (!utilisateur) {
      return NextResponse.json(
        { error: "Utilisateur not found for Etudiant" },
        { status: 404 }
      );
    }

    // Find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId: utilisateur.id,
        psychologistId: psychologistId,
      },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: utilisateur.id,
          psychologistId: psychologistId,
        },
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: utilisateur.id,
        content: content,
        conversationId: conversation.id,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
