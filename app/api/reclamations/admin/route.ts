import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Fetch all reclamations
    const reclamations = await prisma.reclamation.findMany({
      orderBy: {
        dateCreation: "desc",
      },
    });

    return NextResponse.json(reclamations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réclamations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réclamations" },
      { status: 500 }
    );
  }
}
