import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma"; // Ajustez le chemin relatif vers votre instance prisma

export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany({
      select: {
        satisfaction: true, // Champ numérique de 1 à 5 par exemple
      },
    });

    if (!evaluations || evaluations.length === 0) {
      return NextResponse.json({
        averageSatisfaction: "N/A",
        totalEvaluations: 0,
        message:
          "Aucune évaluation disponible pour calculer le taux de satisfaction.",
      });
    }

    const totalSatisfactionScore = evaluations.reduce(
      (sum, evalItem) => sum + evalItem.satisfaction,
      0
    );
    const averageSatisfaction = totalSatisfactionScore / evaluations.length;

    // Supposons que la satisfaction est notée sur 5.
    // On peut aussi retourner le score moyen et le nombre total d'évaluations.
    return NextResponse.json({
      averageSatisfaction: parseFloat(averageSatisfaction.toFixed(2)),
      totalEvaluations: evaluations.length,
      satisfactionDistribution: {
        // Optionnel: on pourrait ajouter une distribution des notes ici
        // e.g. { "1": count, "2": count, ... }
      },
    });
  } catch (error) {
    console.error("Error fetching satisfaction rate data:", error);
    return NextResponse.json(
      { error: "Failed to fetch satisfaction rate data" },
      { status: 500 }
    );
  }
}
