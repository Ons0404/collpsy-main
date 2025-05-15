// app/api/psychologists/[id]/conversations/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        psychologistId: parseInt(params.id),
      },
      include: {
        utilisateur: true,
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
