import { NextResponse } from "next/server";
import {
  getUserById,
  updateUser,
} from "../../../(mvc)/controllers/dashboardController";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = parseInt(params.id, 10);

  if (isNaN(userId)) {
    return NextResponse.json(
      { error: "ID utilisateur invalide." },
      { status: 400 }
    );
  }

  return await getUserById(userId);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = parseInt(params.id, 10);

  if (isNaN(userId)) {
    return NextResponse.json(
      { error: "ID utilisateur invalide." },
      { status: 400 }
    );
  }

  const userData = await request.json();
  return await updateUser(userId, userData);
}
