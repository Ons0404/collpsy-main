// /home/ubuntu/collpsy_mvc_project/app/api/etudiants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllEtudiants } from "../../(mvc)/controllers/etudiantController";

export async function GET() {
  return getAllEtudiants();
}

// Gestion des méthodes non supportées (optionnel)
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Méthode POST non supportée pour cette route" },
    { status: 405 }
  );
}
