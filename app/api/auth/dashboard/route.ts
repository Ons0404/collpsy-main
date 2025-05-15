import { NextResponse } from "next/server";

export async function GET() {
  // Simuler des données de tableau de bord
  const dashboardData = {
    message: "Bienvenue sur le tableau de bord",
    stats: {
      users: 1200,
      activeSessions: 45,
      revenue: 15000,
    },
  };

  return NextResponse.json(dashboardData);
}
