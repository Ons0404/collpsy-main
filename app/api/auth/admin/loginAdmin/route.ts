import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Vérifiez les informations d'identification de l'admin
  if (email === "admin@example.com" && password === "adminpassword") {
    const response = NextResponse.json({ message: "Connexion admin réussie" });
    response.cookies.set("auth-token", "admin-jwt-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400, // 1 jour
      path: "/",
    });
    return response;
  }

  return NextResponse.json(
    { error: "Identifiants admin invalides" },
    { status: 401 }
  );
}
