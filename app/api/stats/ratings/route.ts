import { NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

interface RatingCriteria {
  satisfaction: number;
  empathie: number;
  ecoute: number;
  comprehension: number;
  recommandation: number;
}

interface PsychologistRating {
  id: number;
  name: string;
  overallRating: number;
  criteria: RatingCriteria;
  evaluationCount: number;
}

// Define a type for the rendezVous with consultation included, similar to the regions API
interface RendezVousWithConsultation {
  consultation?: {
    evaluations: Array<{
      satisfaction: number;
      empathie?: number | null;
      ecoute?: number | null;
      comprehension?: number | null;
      recommandation?: number | null;
    }>;
  } | null;
}

export async function GET() {
  try {
    // Récupérer tous les psychologues avec leurs évaluations
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

    // Transformer les données pour le frontend
    const ratingsData: PsychologistRating[] = psychologists.map((psy) => {
      // Récupérer toutes les évaluations pour ce psychologue
      const evaluations = psy.rendezVous
        .filter((rdv: any) => rdv.consultation)
        .flatMap((rdv: any) => rdv.consultation?.evaluations || []);

      // Initialiser les valeurs par défaut
      let overallRating = 0;
      let satisfactionTotal = 0;
      let empathieTotal = 0;
      let ecouteTotal = 0;
      let comprehensionTotal = 0;
      let recommandationTotal = 0;

      // Calculer les moyennes si des évaluations existent
      if (evaluations.length > 0) {
        satisfactionTotal = evaluations.reduce(
          (sum, evaluation) => sum + evaluation.satisfaction,
          0
        );
        empathieTotal = evaluations.reduce(
          (sum, evaluation) => sum + (evaluation.empathie || 0),
          0
        );
        ecouteTotal = evaluations.reduce(
          (sum, evaluation) => sum + (evaluation.ecoute || 0),
          0
        );
        comprehensionTotal = evaluations.reduce(
          (sum, evaluation) => sum + (evaluation.comprehension || 0),
          0
        );
        recommandationTotal = evaluations.reduce(
          (sum, evaluation) => sum + (evaluation.recommandation || 0),
          0
        );

        // Calculer la note globale
        overallRating =
          (satisfactionTotal +
            empathieTotal +
            ecouteTotal +
            comprehensionTotal +
            recommandationTotal) /
          (5 * evaluations.length);
      } else {
        // Valeurs par défaut si aucune évaluation
        overallRating = 4.0;
        satisfactionTotal = 4.0;
        empathieTotal = 4.0;
        ecouteTotal = 4.0;
        comprehensionTotal = 4.0;
        recommandationTotal = 4.0;
      }

      return {
        id: psy.id_psychologue,
        name: `${psy.utilisateur.prenom} ${psy.utilisateur.nom}`,
        overallRating: Number.parseFloat(overallRating.toFixed(1)),
        criteria: {
          satisfaction: Number.parseFloat(
            (satisfactionTotal / Math.max(1, evaluations.length)).toFixed(1)
          ),
          empathie: Number.parseFloat(
            (empathieTotal / Math.max(1, evaluations.length)).toFixed(1)
          ),
          ecoute: Number.parseFloat(
            (ecouteTotal / Math.max(1, evaluations.length)).toFixed(1)
          ),
          comprehension: Number.parseFloat(
            (comprehensionTotal / Math.max(1, evaluations.length)).toFixed(1)
          ),
          recommandation: Number.parseFloat(
            (recommandationTotal / Math.max(1, evaluations.length)).toFixed(1)
          ),
        },
        evaluationCount: evaluations.length,
      };
    });

    return NextResponse.json(ratingsData);
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des évaluations" },
      { status: 500 }
    );
  }
}
