import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";  // Ajustez ce chemin selon votre structure

// Handler pour PATCH : Mettre à jour un prompt
export async function PATCH(
  req: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const promptId = params.promptId; // ID est une string (uuid) dans votre schéma
    const { name, src, description, instructions, category, isPublic } =
      await req.json();

    // Vérifier si le prompt existe
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt non trouvé" }, { status: 404 });
    }

    // Mettre à jour le prompt
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        name: name !== undefined ? name : existingPrompt.name,
        src: src !== undefined ? src : existingPrompt.src,
        description:
          description !== undefined ? description : existingPrompt.description,
        instructions:
          instructions !== undefined
            ? instructions
            : existingPrompt.instructions,
        category: category !== undefined ? category : existingPrompt.category,
        isPublic: isPublic !== undefined ? isPublic : existingPrompt.isPublic,
        updatedAt: new Date(),
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

// Handler pour DELETE : Supprimer un prompt
export async function DELETE(
  req: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const promptId = params.promptId;

    // Vérifier si le prompt existe
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    if (!existingPrompt) {
      return NextResponse.json({ error: "Prompt non trouvé" }, { status: 404 });
    }

    // Supprimer le prompt
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
