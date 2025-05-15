import { NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

// Définir des interfaces pour nos types
interface PsychologistResponseTime {
  id: number;
  name: string;
  responseTimes: number[];
}

interface ResponseTimeMap {
  [key: number]: PsychologistResponseTime;
}

interface FormattedResponseTime {
  id: number;
  name: string;
  averageResponseTime: number;
  responseCount: number;
}

export async function GET() {
  try {
    // Récupérer tous les rendez-vous avec leurs dates de création et de mise à jour
    const rendezVous = await prisma.rendezVous.findMany({
      where: {
        statut: {
          not: "en attente",
        },
      },
      include: {
        psychologue: {
          include: {
            utilisateur: true,
          },
        },
      },
    });

    // Calculer les temps de réponse par psychologue
    const psychologistResponseTimes = rendezVous.reduce(
      (acc: ResponseTimeMap, rdv) => {
        const psychologueId = rdv.id_psychologue;

        if (!acc[psychologueId]) {
          acc[psychologueId] = {
            id: psychologueId,
            name: `${rdv.psychologue.utilisateur.prenom} ${rdv.psychologue.utilisateur.nom}`,
            responseTimes: [],
          };
        }

        const createdAt = new Date(rdv.createdAt);
        const updatedAt = new Date(rdv.updatedAt);
        const responseTimeHours =
          (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        acc[psychologueId].responseTimes.push(responseTimeHours);

        return acc;
      },
      {}
    );

    // Calculer les moyennes et formater les données
    const responseTimeData: FormattedResponseTime[] = Object.values(
      psychologistResponseTimes
    ).map((psy) => {
      const averageResponseTime =
        psy.responseTimes.length > 0
          ? psy.responseTimes.reduce(
              (sum: number, time: number) => sum + time,
              0
            ) / psy.responseTimes.length
          : 0;

      return {
        id: psy.id,
        name: psy.name,
        averageResponseTime: Number.parseFloat(averageResponseTime.toFixed(2)),
        responseCount: psy.responseTimes.length,
      };
    });

    return NextResponse.json(responseTimeData);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des temps de réponse:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des temps de réponse" },
      { status: 500 }
    );
  }
}
