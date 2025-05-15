import { NextRequest, NextResponse } from "next/server";
import { DisponibiliteController } from "../../../../(mvc)/controllers/disponibiliteController";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const response = await DisponibiliteController.getDisponibilites(
      userId,
      startDate,
      endDate
    );
    return response;
  } catch (error: unknown) {
    console.error(
      `Error fetching availabilities for user ${params.id}:`,
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    const response = await DisponibiliteController.createDisponibilite(
      userId,
      body
    );
    return response;
  } catch (error: unknown) {
    console.error(`Error creating availability for user ${params.id}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const response = await DisponibiliteController.updateDisponibilite(
      userId,
      body
    );
    return response;
  } catch (error: unknown) {
    console.error(`Error updating availability for user ${params.id}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const disponibiliteId = url.searchParams.get("disponibiliteId");

    if (!disponibiliteId) {
      return NextResponse.json(
        { error: "ID de disponibilité manquant" },
        { status: 400 }
      );
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const response = await DisponibiliteController.deleteDisponibilite(
      userId,
      parseInt(disponibiliteId)
    );
    return response;
  } catch (error: unknown) {
    console.error(`Error deleting availability for user ${params.id}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
