import { NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

export async function GET() {
  try {
    // Récupérer tous les psychologues avec leurs informations
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
        disponibilites: true,
      },
    });

    // Transformer les données pour le frontend
    const formattedData = psychologists.map((psy) => {
      // Calculer le temps de réponse moyen (en heures)
      const rendezVousAvecReponse = psy.rendezVous.filter(
        (rdv) => rdv.statut !== "en attente" && rdv.createdAt && rdv.updatedAt
      );

      let responseTime = 0;
      if (rendezVousAvecReponse.length > 0) {
        const totalResponseTime = rendezVousAvecReponse.reduce((sum, rdv) => {
          const createdAt = new Date(rdv.createdAt);
          const updatedAt = new Date(rdv.updatedAt);
          const diffInHours =
            (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          return sum + diffInHours;
        }, 0);
        responseTime = totalResponseTime / rendezVousAvecReponse.length;
      } else {
        // Valeur par défaut si aucune donnée
        responseTime = 24; // 24 heures par défaut
      }

      // Calculer la note moyenne
      const evaluations = psy.rendezVous
        .filter((rdv) => rdv.consultation)
        .flatMap((rdv) => rdv.consultation?.evaluations || []);

      let rating = 0;
      if (evaluations.length > 0) {
        const totalRating = evaluations.reduce((sum, evaluation) => {
          // Moyenne des différents critères d'évaluation
          const evalScore =
            (evaluation.satisfaction +
              (evaluation.empathie || 0) +
              (evaluation.ecoute || 0) +
              (evaluation.comprehension || 0) +
              (evaluation.recommandation || 0)) /
            5;
          return sum + evalScore;
        }, 0);
        rating = totalRating / evaluations.length;
      } else {
        // Valeur par défaut si aucune évaluation
        rating = 4.0;
      }

      // Déterminer les spécialités (à adapter selon votre modèle de données)
      // Ici nous utilisons le titre comme spécialité par défaut
      const specialties = [psy.titre];

      // Déterminer la région à partir de l'adresse du cabinet ou de l'établissement
      const region = psy.adresse_cabinet
        ? psy.adresse_cabinet.split(",").pop()?.trim() || psy.etablissement
        : psy.etablissement;

      // Calculer le taux de réussite (consultations terminées avec succès / total)
      const consultationsTerminees = psy.rendezVous.filter(
        (rdv) => rdv.consultation && rdv.consultation.status === "COMPLETED"
      ).length;

      const totalConsultations = psy.rendezVous.filter(
        (rdv) => rdv.consultation
      ).length;

      const successRate =
        totalConsultations > 0
          ? (consultationsTerminees / totalConsultations) * 100
          : 85; // Valeur par défaut

      return {
        id: psy.id_psychologue,
        name: `${psy.utilisateur.prenom} ${psy.utilisateur.nom}`,
        avatar: psy.utilisateur.avatar
          ? Buffer.from(psy.utilisateur.avatar).toString("base64")
          : null,
        region: region,
        experience:
          new Date().getFullYear() - new Date(psy.date_obtention).getFullYear(),
        specialties: specialties,
        rating: rating,
        responseTime: responseTime,
        consultationCount: psy.rendezVous.length,
        successRate: successRate,
        sessionTypes: psy.mode_consultation
          ? [psy.mode_consultation]
          : ["EN_LIGNE"],
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
