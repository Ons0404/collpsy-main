// app/api/users/[id]/avatar/route.ts
import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import prisma from "../../../../(mvc)/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to database
    await prisma.utilisateur.update({
      where: { id: userId },
      data: {
        avatar: {
          set: buffer, // Use the Buffer directly
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
