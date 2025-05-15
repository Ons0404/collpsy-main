import { NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";
import { Prisma } from "@prisma/client";

interface RegionStatistics {
  region: string;
  psychologistCount: number;
  averageRating: number;
  averageResponseTime: number;
  consultationCount: number;
}

export async function GET() {
  try {
    // Requête optimisée pour récupérer les psychologues avec leurs données associées
    const psychologists = await prisma.psychologue.findMany({
      include: {
        utilisateur: true,
        rendezVous: {
          include: {
            consultation: {
              include: {
                evaluations: true,
              },
            },
          },
        },
      },
    });

    // Traitement des données par région
    const regionMap = new Map<
      string,
      {
        psychologists: number;
        totalRating: number;
        evaluationCount: number;
        totalResponseTime: number;
        responseCount: number;
        consultationCount: number;
      }
    >();

    psychologists.forEach((psy) => {
      // Détermination de la région
      const region = extractRegion(psy);

      // Initialisation des données pour la région si nécessaire
      if (!regionMap.has(region)) {
        regionMap.set(region, {
          psychologists: 0,
          totalRating: 0,
          evaluationCount: 0,
          totalResponseTime: 0,
          responseCount: 0,
          consultationCount: 0,
        });
      }

      const regionData = regionMap.get(region)!;

      // Incrémentation du nombre de psychologues
      regionData.psychologists++;

      // Calcul des consultations
      const consultations = psy.rendezVous.filter((rdv) => rdv.consultation);
      regionData.consultationCount += consultations.length;

      // Calcul du temps de réponse
      const rendezVousAvecReponse = psy.rendezVous.filter(
        (rdv) => rdv.statut !== "en attente" && rdv.createdAt && rdv.updatedAt
      );

      regionData.responseCount += rendezVousAvecReponse.length;

      rendezVousAvecReponse.forEach((rdv) => {
        const createdAt = new Date(rdv.createdAt);
        const updatedAt = new Date(rdv.updatedAt);
        regionData.totalResponseTime +=
          (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      });

      // Calcul des évaluations
      const evaluations = psy.rendezVous
        .filter((rdv) => rdv.consultation)
        .flatMap((rdv) => rdv.consultation?.evaluations || []);

      regionData.evaluationCount += evaluations.length;

      evaluations.forEach((evaluation) => {
        const evalScore = calculateEvaluationScore(evaluation);
        regionData.totalRating += evalScore;
      });
    });

    // Conversion en tableau de statistiques par région
    const regionStats: RegionStatistics[] = Array.from(regionMap.entries()).map(
      ([region, data]) => {
        // Calcul des moyennes
        const averageRating =
          data.evaluationCount > 0
            ? data.totalRating / data.evaluationCount
            : 4.0;

        const averageResponseTime =
          data.responseCount > 0
            ? data.totalResponseTime / data.responseCount
            : 24.0;

        return {
          region,
          psychologistCount: data.psychologists,
          averageRating: Number.parseFloat(averageRating.toFixed(1)),
          averageResponseTime: Number.parseFloat(
            averageResponseTime.toFixed(1)
          ),
          consultationCount: data.consultationCount,
        };
      }
    );

    return NextResponse.json(regionStats);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des statistiques par région:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques par région" },
      { status: 500 }
    );
  }
}

// Fonction pour extraire la région d'un psychologue
function extractRegion(psy: any): string {
  return psy.adresse_cabinet
    ? psy.adresse_cabinet.split(",").pop()?.trim() || psy.etablissement
    : psy.etablissement;
}

// Fonction pour calculer le score d'évaluation
function calculateEvaluationScore(evaluation: any): number {
  return (
    (evaluation.satisfaction +
      (evaluation.empathie ?? 0) +
      (evaluation.ecoute ?? 0) +
      (evaluation.comprehension ?? 0) +
      (evaluation.recommandation ?? 0)) /
    5
  );
}
