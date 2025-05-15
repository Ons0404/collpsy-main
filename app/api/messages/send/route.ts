// app/api/messages/send/route.ts
import { NextResponse } from "next/server";
import  prisma  from "../../../(mvc)/lib/prisma";

export async function POST(request: Request) {
  try {
    const { senderId, recipientId, content, rendezVousId, conversationId } =
      await request.json();

    if (!senderId || !recipientId || !content) {
      return NextResponse.json(
        { error: "senderId, recipientId et content sont requis" },
        { status: 400 }
      );
    }

    const message = await prisma.userMessage.create({
      data: {
        senderId,
        recipientId,
        content,
        sentAt: new Date(),
        rendezVousId,
        conversationId,
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
        recipient: {
          select: {
            id: true,
            prenom: true,
            nom: true,
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: recipientId,
        message: `Vous avez reçu un nouveau message de ${message.sender.prenom} ${message.sender.nom}`,
        date: new Date(),
        read: false,
        userMessageId: message.id,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
