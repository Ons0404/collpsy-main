import { NextResponse } from "next/server";
import  prisma  from "../../../../(mvc)/lib/prisma";

export async function GET() {
  try {
    // Calculer le nombre total d'utilisateurs
    const totalUsers = await prisma.utilisateur.count();

    // Compter les comptes en attente (utilisateurs non vérifiés)
    const pendingAccounts = await prisma.utilisateur.count({
      where: {
        statut: false,
      },
    });

    // Pour le taux de conversion, nous allons calculer le pourcentage de psychologues actifs
    // par rapport au nombre total de psychologues
    const totalPsychologues = await prisma.psychologue.count();

    const activePsychologues = await prisma.psychologue.count({
      where: {
        utilisateur: {
          statut: true,
        },
      },
    });

    const conversionRate =
      totalPsychologues > 0
        ? Math.round((activePsychologues / totalPsychologues) * 100)
        : 0;

    // Pour la performance de l'app, nous pouvons calculer le ratio de rendez-vous
    // complétés par rapport aux rendez-vous totaux comme indicateur
    const totalRendezVous = await prisma.rendezVous.count();

    const completedRendezVous = await prisma.rendezVous.count({
      where: {
        statut: "terminé", // ou le statut que vous utilisez pour les rendez-vous terminés
      },
    });

    const appPerformance =
      totalRendezVous > 0
        ? Math.round((completedRendezVous / totalRendezVous) * 100)
        : 100; // 100% par défaut si aucun rendez-vous

    // Statistiques additionnelles qui pourraient être utiles
    const etudiants = await prisma.etudiant.count();
    const psychologues = await prisma.psychologue.count();
    const pendingPsychologues = await prisma.psychologue.count({
      where: {
        utilisateur: {
          statut: false,
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      pendingAccounts,
      conversionRate,
      appPerformance,
      additionalStats: {
        etudiants,
        psychologues,
        pendingPsychologues,
        // On pourrait ajouter d'autres statistiques ici
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
