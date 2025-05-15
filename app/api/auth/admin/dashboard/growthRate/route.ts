import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma"; // Ajustez le chemin relatif vers votre instance prisma

export async function GET() {
  try {
    // Récupérer toutes les dates d'inscription des utilisateurs
    const users = await prisma.utilisateur.findMany({
      select: {
        date_inscription: true,
      },
      orderBy: {
        date_inscription: "asc",
      },
    });

    if (!users || users.length === 0) {
      return NextResponse.json({ monthlyGrowth: [], growthRate: 0 });
    }

    // Agréger les inscriptions par mois
    const inscriptionsByMonth: { [key: string]: number } = {};
    users.forEach((user) => {
      const monthYear = user.date_inscription.toISOString().substring(0, 7); // YYYY-MM
      if (inscriptionsByMonth[monthYear]) {
        inscriptionsByMonth[monthYear]++;
      } else {
        inscriptionsByMonth[monthYear] = 1;
      }
    });

    const monthlyData = Object.keys(inscriptionsByMonth)
      .map((monthYear) => ({
        month: monthYear,
        count: inscriptionsByMonth[monthYear],
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    if (monthlyData.length < 2) {
      return NextResponse.json({
        monthlyGrowth: monthlyData,
        growthRate: "N/A",
        message:
          "Pas assez de données pour calculer un taux de croissance significatif.",
      });
    }

    // Calculer le taux de croissance pour le dernier mois complet par rapport au précédent
    // On prend les deux derniers mois complets disponibles pour le calcul.
    let lastMonthCount = 0;
    let previousMonthCount = 0;
    let currentGrowthRate: number | string = "N/A";

    if (monthlyData.length >= 2) {
      lastMonthCount = monthlyData[monthlyData.length - 1].count;
      previousMonthCount = monthlyData[monthlyData.length - 2].count;
      if (previousMonthCount > 0) {
        currentGrowthRate =
          ((lastMonthCount - previousMonthCount) / previousMonthCount) * 100;
        currentGrowthRate = parseFloat(currentGrowthRate.toFixed(2));
      } else if (lastMonthCount > 0) {
        currentGrowthRate =
          "Nouvelles inscriptions ce mois-ci, aucune le mois précédent.";
      } else {
        currentGrowthRate = 0; // Aucun changement si les deux sont à zéro
      }
    }

    return NextResponse.json({
      monthlyRegistrations: monthlyData, // Contient le nombre d'inscriptions par mois
      currentMonthlyGrowthRate: currentGrowthRate, // Taux de croissance du dernier mois par rapport au précédent
      lastMonthRegistrations: lastMonthCount,
      previousMonthRegistrations: previousMonthCount,
    });
  } catch (error) {
    console.error("Error fetching monthly growth rate data:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly growth rate data" },
      { status: 500 }
    );
  }
}
