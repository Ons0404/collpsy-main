// /home/ubuntu/collpsy_mvc_project/app/controllers/conversations/conversationController.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getConversations = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const psychologistId = searchParams.get("psychologistId");
    const userId = searchParams.get("userId");

    if (psychologistId && !userId) {
      // Fetch all conversations for a psychologist
      const conversations = await prisma.conversation.findMany({
        where: { psychologistId: parseInt(psychologistId) },
        include: {
          utilisateur: {
            select: {
              id: true,
              prenom: true,
              nom: true,
            },
          },
          userMessages: {
            select: {
              content: true,
              sentAt: true,
              readAt: true,
            },
            orderBy: { sentAt: "desc" },
            take: 1,
          },
        },
      });

      // Format conversations with latest message and unread count
      const formattedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount = await prisma.userMessage.count({
            where: {
              conversationId: conv.id,
              recipientId: parseInt(psychologistId),
              readAt: null,
            },
          });

          return {
            ...conv,
            latestMessage: conv.userMessages[0]
              ? {
                  content: conv.userMessages[0].content,
                  sentAt: conv.userMessages[0].sentAt.toISOString(),
                  read: !!conv.userMessages[0].readAt,
                }
              : undefined,
            unreadCount,
            userMessages: undefined, // Remove raw messages from response
          };
        })
      );

      return NextResponse.json(formattedConversations, { status: 200 });
    }

    if (userId && psychologistId) {
      // Fetch a specific conversation
      const conversation = await prisma.conversation.findUnique({
        where: {
          userId_psychologistId: {
            userId: parseInt(userId),
            psychologistId: parseInt(psychologistId),
          },
        },
      });

      if (!conversation) {
        return NextResponse.json(
          { message: "Aucune conversation trouvée" },
          { status: 404 }
        );
      }

      return NextResponse.json(conversation, { status: 200 });
    }

    return NextResponse.json(
      { error: "psychologistId ou userId requis" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  } finally {
    // Consider moving prisma disconnect to middleware or a central place
    // await prisma.$disconnect();
  }
};

export const createConversation = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, psychologistId } = body;

    if (!userId || !psychologistId) {
      return NextResponse.json(
        { error: "userId et psychologistId sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si une conversation existe déjà
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        userId_psychologistId: {
          userId: userId,
          psychologistId: psychologistId,
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation, { status: 200 });
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId: userId,
        psychologistId: psychologistId,
      },
    });

    // Créer une notification pour le patient
    await prisma.notification.create({
      data: {
        userId: userId,
        message: `Une nouvelle conversation a été initiée avec votre psychologue.`,
        conversationId: conversation.id,
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  } finally {
    // Consider moving prisma disconnect to middleware or a central place
    // await prisma.$disconnect();
  }
};

