import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "id doit être un nombre valide" },
        { status: 400 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: userId },
      include: {
        psychologue: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Convert avatar binary data to base64 if it exists, and handle null psychologue
    const formattedConversations = conversations.map((conv) => {
      const psychologueData = conv.psychologue
        ? {
            ...conv.psychologue,
            utilisateur: {
              ...conv.psychologue.utilisateur,
              avatar: conv.psychologue.utilisateur.avatar
                ? Buffer.from(conv.psychologue.utilisateur.avatar).toString(
                    "base64"
                  )
                : null,
            },
          }
        : null;

      return {
        ...conv,
        psychologue: psychologueData,
      };
    });

    return NextResponse.json(
      { conversations: formattedConversations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
