import { NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    // Fetch unread messages
    const messages = await prisma.message.findMany({
      where: {
        senderId: {
          not: userId, // Messages not sent by the user (received)
        },
        readAt: null, // Unread messages
        OR: [
          { consultationId: { not: null } },
          { rendezVousId: { not: null } },
          { conversationId: { not: null } },
        ],
      },
      orderBy: {
        sentAt: "desc", // Most recent first
      },
      take: 5, // Limit to 5 for performance
    });

    return NextResponse.json(
      messages.map((msg) => ({
        id: msg.id,
        sujet: "Message reçu", // Placeholder, adjust if you have a sujet field
        contenu: msg.content,
        lu: !!msg.readAt,
        date: msg.sentAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des messages non lus pour userId ${params.userId}:`,
      error
    );
    return NextResponse.json(
      { error: "Échec de la récupération des messages" },
      { status: 500 }
    );
  }
}
