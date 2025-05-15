import { NextRequest, NextResponse } from "next/server";
import { updateRendezVousStatus } from "../../../(mvc)/controllers/rendezVousController";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de rendez-vous invalide" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const result = await updateRendezVousStatus(id, data);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
