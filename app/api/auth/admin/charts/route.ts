import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

interface DashboardData {
  userDistribution: {
    psychologists: number;
    students: number;
  };
  avgSatisfaction: number;
  userStatusRates: {
    accepted: number;
    rejected: number;
  };
  complaints: {
    psychologists: number;
    students: number;
  };
}

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const [
      psychologistsCount,
      studentsCount,
      onlineEvaluations,
      acceptedUsers,
      rejectedUsers,
      psychologistComplaints,
      studentComplaints,
    ] = await Promise.all([
      prisma.utilisateur.count({ where: { role: "PSYCHOLOGUE" } }),
      prisma.utilisateur.count({ where: { role: "ETUDIANT" } }),
      prisma.evaluation.findMany({
        where: {
          consultation: { type: "EN_LIGNE" },
          satisfaction: { gt: 0 },
        },
        select: { satisfaction: true },
      }),
      prisma.utilisateur.count({ where: { statut: true } }),
      prisma.utilisateur.count({ where: { statut: false } }),
      prisma.reclamation.count({ where: { roleUtilisateur: "PSYCHOLOGUE" } }),
      prisma.reclamation.count({ where: { roleUtilisateur: "ETUDIANT" } }),
    ]);

    const avgSatisfaction =
      onlineEvaluations.length > 0
        ? onlineEvaluations.reduce(
            (sum, evaluation) => sum + evaluation.satisfaction,
            0
          ) / onlineEvaluations.length
        : 0;

    const data: DashboardData = {
      userDistribution: {
        psychologists: psychologistsCount,
        students: studentsCount,
      },
      avgSatisfaction,
      userStatusRates: {
        accepted: acceptedUsers,
        rejected: rejectedUsers,
      },
      complaints: {
        psychologists: psychologistComplaints,
        students: studentComplaints,
      },
    };

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
