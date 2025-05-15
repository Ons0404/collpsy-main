import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Get the cookies
    const cookieStore = cookies();

    // Clear all relevant authentication cookies
    cookieStore.delete("sessionToken");
    cookieStore.delete("adminId");
    cookieStore.delete("userId");
    cookieStore.delete("userRole");
    cookieStore.delete("__client_uat");

    // Return a success response
    return NextResponse.json(
      { success: true, message: "Déconnexion réussie" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de la déconnexion:", error);

    let errorMessage = "Erreur lors de la déconnexion";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
