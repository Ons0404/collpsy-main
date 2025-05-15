import { NextResponse } from "next/server";
import  prisma  from "../../../../(mvc)/lib/prisma";

export async function GET() {
  try {
    // Récupérer les réclamations non résolues (nouvelles ou en traitement)
    const unresolvedReclamations = await prisma.reclamation.findMany({
      where: {
        OR: [{ status: "NOUVELLE" }, { status: "EN_TRAITEMENT" }],
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: [
        { isUrgent: "desc" }, // Réclamations urgentes en priorité
        { dateCreation: "asc" }, // Puis par date de création (plus anciennes d'abord)
      ],
    });

    return NextResponse.json(unresolvedReclamations);
  } catch (error) {
    console.error("Error fetching unresolved reclamations:", error);
    return NextResponse.json(
      { error: "Failed to fetch unresolved reclamations" },
      { status: 500 }
    );
  }
}

// API pour mettre à jour le statut d'une réclamation
export async function PUT(request: Request) {
  const { id, status, adminComment } = await request.json();

  if (!id || !status) {
    return NextResponse.json(
      { error: "Reclamation ID and status are required" },
      { status: 400 }
    );
  }

  try {
    // Mettre à jour le statut de la réclamation
    const updatedReclamation = await prisma.reclamation.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
        ...(status === "RÉSOLUE" ? { dateResolution: new Date() } : {}),
        ...(adminComment
          ? {
              description: `${adminComment}\n\n---\nRéponse d'origine :\n${
                (
                  await prisma.reclamation.findUnique({
                    where: { id: Number(id) },
                  })
                )?.description
              }`,
            }
          : {}),
      },
      include: {
        utilisateur: {
          select: {
            id: true,
          },
        },
      },
    });

    // Si la réclamation est résolue et qu'un utilisateur est associé, créer une notification
    if (status === "RÉSOLUE" && updatedReclamation.utilisateur) {
      await prisma.notification.create({
        data: {
          userId: updatedReclamation.utilisateur.id,
          message: `Votre réclamation concernant "${updatedReclamation.categorie}" a été résolue.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Reclamation status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating reclamation:", error);
    return NextResponse.json(
      { error: "Failed to update reclamation" },
      { status: 500 }
    );
  }
}
