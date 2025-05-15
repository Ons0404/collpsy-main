// app/api/users/[userId]/connections/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = Number(params.userId);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Fetch patients connected to the psychologist
    const patients = await prisma.utilisateur.findMany({
      where: {
        conversations: {
          some: {
            psychologistId: userId,
          },
        },
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        date_naissance: true,
        telephone: true,
        rendezVous: {
          select: {
            id: true,
            date: true,
            heure_debut: true,
            statut: true,
          },
        },
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
