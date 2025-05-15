import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const results = await prisma.resultatTest.findMany({
      where: { etudiantId: parseInt(params.id) },
      include: { test: true },
      orderBy: { datePassation: "desc" },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des résultats" },
      { status: 500 }
    );
  }
}
