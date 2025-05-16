import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";  // Ajustez ce chemin selon votre structure

// Handler pour PATCH : Mettre à jour un prompt
export async function PATCH(
  req: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const promptId = parseInt(params.promptId, 10); // Convert to number
    const { name, src, description, instructions, category, isPublic } =
      await req.json();

    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt non trouvé" }, { status: 404 });
    }

    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        // ... rest of the data
      },
    });

    return NextResponse.json(updatedPrompt, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du prompt:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const promptId = parseInt(params.promptId, 10); // Convert to number

    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt non trouvé" }, { status: 404 });
    }

    await prisma.prompt.delete({
      where: { id: promptId },
    });

    return NextResponse.json(
      { message: "Prompt supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du prompt:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}