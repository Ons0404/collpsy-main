import { NextResponse } from "next/server";
import  prisma  from "../../../../(mvc)/lib/prisma";

export async function GET() {
  try {
    // Obtenir le mois actuel et les 5 mois précédents
    const today = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(month);
    }

    // Données d'inscription des utilisateurs par mois
    const userRegistrationData = await Promise.all(
      months.map(async (month) => {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(
          month.getFullYear(),
          month.getMonth() + 1,
          0
        );

        const count = await prisma.utilisateur.count({
          where: {
            date_inscription: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        return {
          month: `${month.getMonth() + 1}/${month.getFullYear()}`,
          count,
        };
      })
    );

    // Données pour le graphique des rendez-vous par statut
    const appointmentStatusData = await prisma.rendezVous.groupBy({
      by: ["statut"],
      _count: {
        id: true,
      },
    });

    const appointmentsByStatus = appointmentStatusData.map((item) => ({
      status: item.statut,
      count: item._count.id,
    }));

    // Répartition des utilisateurs par rôle
    const usersByRole = [
      {
        role: "ETUDIANT",
        count: await prisma.utilisateur.count({
          where: { role: "ETUDIANT" },
        }),
      },
      {
        role: "PSYCHOLOGUE",
        count: await prisma.utilisateur.count({
          where: { role: "PSYCHOLOGUE" },
        }),
      },
    ];

    // Top 5 des psychologues par nombre de consultations
    const topPsychologues = await prisma.psychologue.findMany({
      select: {
        id_psychologue: true,
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
          },
        },
        _count: {
          select: {
            consultations: true,
          },
        },
      },
      orderBy: {
        consultations: {
          _count: "desc",
        },
      },
      take: 5,
    });

    const formattedTopPsychologues = topPsychologues.map((psy) => ({
      id: psy.id_psychologue,
      name: `${psy.utilisateur.prenom} ${psy.utilisateur.nom}`,
      consultationCount: psy._count.consultations,
    }));

    // Nombre de réclamations par catégorie
    const reclamationsByCategory = await prisma.reclamation.groupBy({
      by: ["categorie"],
      _count: {
        id: true,
      },
    });

    const formattedReclamations = reclamationsByCategory.map((item) => ({
      category: item.categorie,
      count: item._count.id,
    }));

    return NextResponse.json({
      userRegistrationData,
      appointmentsByStatus,
      usersByRole,
      topPsychologues: formattedTopPsychologues,
      reclamationsByCategory: formattedReclamations,
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
