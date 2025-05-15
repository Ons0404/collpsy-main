import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

// Log pour vérifier que la clé API est bien chargée
console.log("Clé API OpenAI utilisée:", process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Définir max_tokens comme une variable
    const MAX_TOKENS = 50;

    console.log("Params reçus:", params);

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      console.error("ID invalide:", params.id);
      return NextResponse.json(
        { error: "Format ID invalide" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log("Body reçu:", body);
    } catch (error) {
      console.error("Erreur lors de la lecture du corps:", error);
      return NextResponse.json(
        { error: "Corps de la requête invalide" },
        { status: 400 }
      );
    }

    if (body.init) {
      let conversation = await prisma.conversation.findFirst({
        where: { userId },
        include: {
          messages: {
            orderBy: { sentAt: "asc" },
            take: 50,
            include: { sender: true },
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { userId },
          include: { messages: { include: { sender: true } } },
        });
      }

      return NextResponse.json({
        conversationId: conversation.id,
        existingMessages: conversation.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          isAiMessage: msg.isAiMessage,
          sender: msg.sender,
          sentAt: msg.sentAt.toISOString(),
        })),
      });
    }

    if (!body.message?.trim() || !body.conversationId) {
      console.error("Données manquantes:", body);
      return NextResponse.json(
        { error: "Message ou conversationId manquant" },
        { status: 400 }
      );
    }

    // Vérification du nombre de messages récents pour limiter les requêtes
    const recentMessages = await prisma.message.findMany({
      where: {
        conversationId: body.conversationId,
        sentAt: {
          gte: new Date(Date.now() - 60 * 1000), // Messages des dernières 60 secondes
        },
      },
    });

    if (recentMessages.length >= 5) {
      console.warn(
        "Limite de messages atteinte pour cette conversation:",
        body.conversationId
      );
      return NextResponse.json(
        { error: "Trop de messages envoyés. Veuillez attendre un moment." },
        { status: 429 }
      );
    }

    const userMessage = await prisma.message.create({
      data: {
        content: body.message,
        senderId: userId,
        conversationId: body.conversationId,
        isAiMessage: false,
      },
      include: { sender: true },
    });

    let aiContent;
    try {
      console.log(
        "Envoi d'une requête à OpenAI pour le message:",
        body.message
      );
      const aiResponse = await openai.chat.completions.create({
        model: process.env.AI_MODEL || "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Assistant CollPsy - Réponses professionnelles et bienveillantes",
          },
          { role: "user", content: body.message },
        ],
        temperature: 0.7,
        max_tokens: MAX_TOKENS, // Utilisation de la variable
      });
      aiContent = aiResponse.choices[0]?.message?.content || "Pas de réponse";
      console.log("Réponse OpenAI reçue:", aiContent);
    } catch (openAiError: any) {
      console.error("Erreur OpenAI:", openAiError);
      if (openAiError.response?.status === 429) {
        aiContent =
          "Désolé, nous avons atteint notre limite temporaire avec OpenAI. Veuillez réessayer plus tard.";
        const aiMessage = await prisma.message.create({
          data: {
            content: aiContent,
            senderId: userId,
            conversationId: body.conversationId,
            isAiMessage: true,
          },
          include: { sender: true },
        });
        const updatedMessages = await prisma.message.findMany({
          where: { conversationId: body.conversationId },
          orderBy: { sentAt: "asc" },
          include: { sender: true },
        });
        return NextResponse.json({
          messages: updatedMessages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            isAiMessage: msg.isAiMessage,
            sender: msg.sender,
            sentAt: msg.sentAt.toISOString(),
          })),
        });
      }
      throw openAiError;
    }

    const aiMessage = await prisma.message.create({
      data: {
        content: aiContent,
        senderId: userId,
        conversationId: body.conversationId,
        isAiMessage: true,
      },
      include: { sender: true },
    });

    const updatedMessages = await prisma.message.findMany({
      where: { conversationId: body.conversationId },
      orderBy: { sentAt: "asc" },
      include: { sender: true },
    });

    return NextResponse.json({
      messages: updatedMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        isAiMessage: msg.isAiMessage,
        sender: msg.sender,
        sentAt: msg.sentAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur serveur interne",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
