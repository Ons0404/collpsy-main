// /home/ubuntu/collpsy_mvc_project/app/controllers/messages/messageController.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Ensure prisma client is correctly initialized and accessible.
// Using a new instance for now, but centralizing prisma client is recommended.
const prisma = new PrismaClient();

// Handler for POST /api/messages (Uses 'Message' model)
export const sendMessage = async (req: NextRequest) => {
  try {
    const { senderId, conversationId, content } = await req.json();

    // Validation basique
    if (!senderId || !conversationId || !content) {
      return NextResponse.json(
        { error: "Paramètres manquants (senderId, conversationId, content)" },
        { status: 400 }
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        conversationId,
        content,
      },
      include: {
        sender: true,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Controller Error sending message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l\'envoi du message" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Handler for GET /api/messages?conversationId=... (Uses 'Message' model)
export const getMessagesByConversation = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "ID de conversation manquant dans les paramètres de requête" },
        { status: 400 }
      );
    }

    const conversationIdNum = Number(conversationId);
    if (isNaN(conversationIdNum)) {
        return NextResponse.json(
            { error: "ID de conversation invalide" },
            { status: 400 }
        );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: conversationIdNum },
      include: {
        sender: true,
      },
      orderBy: { sentAt: "asc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Controller Error fetching messages:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Handler for GET /api/conversations/[conversationId]/messages (Uses 'UserMessage' model)
export const getUserMessagesByConversationId = async (
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) => {
  try {
    const conversationId = parseInt(params.conversationId);

    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: "conversationId doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Consider adding authorization check

    const messages = await prisma.userMessage.findMany({
      where: { conversationId: conversationId },
      include: {
        sender: {
          select: { id: true, nom: true, prenom: true },
        },
        recipient: {
          select: { id: true, nom: true, prenom: true },
        },
      },
      orderBy: { sentAt: "asc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Controller Error fetching user messages:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne lors de la récupération des messages utilisateur" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Handler for POST /api/conversations/[conversationId]/messages (Uses 'UserMessage' model)
export const sendUserMessageToConversation = async (
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) => {
  try {
    const conversationId = parseInt(params.conversationId);
    const body = await request.json();
    const { senderId, recipientId, content } = body;

    if (!senderId || !recipientId || !content) {
      return NextResponse.json(
        { error: "senderId, recipientId et content sont requis" },
        { status: 400 }
      );
    }

    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: "conversationId doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Vérifier que la conversation existe
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Consider adding authorization check: does senderId match logged-in user?
    // Is recipientId valid for this conversation?

    // Créer le message
    const message = await prisma.userMessage.create({
      data: {
        senderId: senderId,
        recipientId: recipientId,
        content: content,
        conversationId: conversationId,
      },
      include: {
        sender: {
          select: { id: true, nom: true, prenom: true },
        },
        recipient: {
          select: { id: true, nom: true, prenom: true },
        },
      },
    });

    // Créer une notification pour le destinataire
    // Consider moving notification creation to a separate service/function
    await prisma.notification.create({
      data: {
        userId: recipientId,
        message: `Nouveau message de ${message.sender.prenom} ${message.sender.nom}`,
        userMessageId: message.id,
        conversationId: conversationId,
      },
    });

    // TODO: Potentially trigger real-time updates (e.g., WebSockets)

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Controller Error sending user message:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne lors de l\'envoi du message utilisateur" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Handler for PUT /api/conversations/[conversationId]/messages/read
export const markMessagesAsRead = async (
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) => {
  try {
    const { recipientId } = await request.json();
    const conversationId = parseInt(params.conversationId);

    if (!recipientId || isNaN(conversationId)) {
      return NextResponse.json({ error: "Données d'entrée invalides" }, { status: 400 });
    }

    // Update messages where recipientId matches and readAt is null
    await prisma.userMessage.updateMany({
      where: {
        conversationId,
        recipientId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Messages marqués comme lus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Controller Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne lors du marquage des messages comme lus" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Placeholder for other message-related controller functions
// e.g., getUnreadCount, etc.
