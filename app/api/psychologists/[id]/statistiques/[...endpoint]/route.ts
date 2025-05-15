import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Créer un client Prisma singleton pour éviter trop de connexions en dev
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Type pour les paramètres des endpoints
type RouteParams = {
  params: {
    id: string;
    endpoint: string[];
  };
};

// Helper pour calculer les dates en fonction de la période
function getDateRange(periode: string) {
  const now = new Date();
  let fromDate = new Date();

  switch (periode) {
    case "semaine":
      fromDate.setDate(now.getDate() - 7);
      break;
    case "mois":
      fromDate.setMonth(now.getMonth() - 1);
      break;
    case "annee":
      fromDate.setFullYear(now.getFullYear() - 1);
      break;
    case "tout":
      fromDate = new Date(0); // Date très ancienne
      break;
    default:
      fromDate.setMonth(now.getMonth() - 1); // Par défaut: dernier mois
  }

  return { fromDate, toDate: now };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const psychologueId = parseInt(params.id);

    // Validation de l'ID
    if (isNaN(psychologueId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Authentification: Récupérer userId depuis l'en-tête x-user-id
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé: userId manquant" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a accès à ces statistiques
    const isAdmin = await prisma.administrateur
      .findUnique({
        where: { id: parseInt(userId) },
      })
      .catch((error) => {
        console.error("Error checking admin:", error);
        return null;
      });

    if (!isAdmin) {
      // Si pas admin, vérifier si l'utilisateur est le psychologue concerné
      const isPsychologue = await prisma.psychologue
        .findUnique({
          where: { id_psychologue: parseInt(userId) },
        })
        .catch((error) => {
          console.error("Error checking psychologue:", error);
          return null;
        });

      if (!isPsychologue || isPsychologue.id_psychologue !== psychologueId) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    }

    // Extraction des paramètres
    const url = new URL(req.url);
    const periode = url.searchParams.get("periode") || "mois";
    const { fromDate, toDate } = getDateRange(periode);

    // Validation de l'endpoint
    const endpoint = params.endpoint?.join("/") || "";
    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint non spécifié" },
        { status: 400 }
      );
    }

    // Routage vers la fonction appropriée
    switch (endpoint) {
      case "consultations/total":
        return await getTotalConsultations(psychologueId, fromDate, toDate);
      case "consultations/duree-moyenne":
        return await getDureeMoyenne(psychologueId, fromDate, toDate);
      case "consultations/repartition-types":
        return await getRepartitionTypes(psychologueId, fromDate, toDate);
      case "consultations/repartition-statuts":
        return await getRepartitionStatuts(psychologueId, fromDate, toDate);
      case "patients/nouveaux":
        return await getNouveauxPatients(psychologueId, fromDate, toDate);
      case "patients/consultations-moyennes":
        return await getConsultationsMoyennes(psychologueId, fromDate, toDate);
      case "rendezvous/comptes":
        return await getComptesRendezVous(psychologueId, fromDate, toDate);
      case "rendezvous/taux-annulation":
        return await getTauxAnnulation(psychologueId, fromDate, toDate);
      case "evaluations/satisfaction-moyenne":
        return await getSatisfactionMoyenne(psychologueId, fromDate, toDate);
      case "evaluations/details-moyens":
        return await getDetailsEvaluations(psychologueId, fromDate, toDate);
      case "evaluations/total":
        return await getTotalEvaluations(psychologueId, fromDate, toDate);
      case "reclamations/total-concernees":
        return await getTotalReclamations(psychologueId, fromDate, toDate);
      default:
        return NextResponse.json(
          { error: "Endpoint non trouvé" },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error("Erreur dans la route API:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

// Fonctions des statistiques

async function getTotalConsultations(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const count = await prisma.consultation.count({
      where: {
        psychologueId,
        createdAt: { gte: fromDate, lte: toDate },
      },
    });
    return NextResponse.json({ totalConsultations: count });
  } catch (error) {
    console.error("Error in getTotalConsultations:", error);
    throw new Error("Failed to fetch total consultations");
  }
}

async function getDureeMoyenne(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const consultations = await prisma.consultation.findMany({
      where: {
        psychologueId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    if (consultations.length === 0) {
      return NextResponse.json({ dureeMoyenneMinutes: 0 });
    }

    const dureeMinutes = consultations.reduce((total, consultation) => {
      const duree =
        (consultation.endTime.getTime() - consultation.startTime.getTime()) /
        (1000 * 60);
      return total + (duree > 0 ? duree : 0);
    }, 0);

    const moyenne = dureeMinutes / consultations.length;
    return NextResponse.json({ dureeMoyenneMinutes: Math.round(moyenne) });
  } catch (error) {
    console.error("Error in getDureeMoyenne:", error);
    throw new Error("Failed to calculate average duration");
  }
}

async function getRepartitionTypes(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const repartition = await prisma.consultation.groupBy({
      by: ["type"],
      where: {
        psychologueId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      _count: { type: true },
    });

    return NextResponse.json({
      types: repartition.map((r) => ({
        type: r.type || "Non spécifié",
        nombre: r._count.type,
      })),
    });
  } catch (error) {
    console.error("Error in getRepartitionTypes:", error);
    throw new Error("Failed to fetch consultation types distribution");
  }
}

async function getRepartitionStatuts(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const repartition = await prisma.consultation.groupBy({
      by: ["status"],
      where: {
        psychologueId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      _count: { status: true },
    });

    return NextResponse.json({
      statuts: repartition.map((r) => ({
        statut: r.status || "Non spécifié",
        nombre: r._count.status,
      })),
    });
  } catch (error) {
    console.error("Error in getRepartitionStatuts:", error);
    throw new Error("Failed to fetch consultation status distribution");
  }
}

async function getNouveauxPatients(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const patientsUniques = await prisma.consultation.findMany({
      where: {
        psychologueId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      distinct: ["etudiantId"],
      select: { etudiantId: true },
    });

    return NextResponse.json({ nouveauxPatients: patientsUniques.length });
  } catch (error) {
    console.error("Error in getNouveauxPatients:", error);
    throw new Error("Failed to fetch new patients count");
  }
}

async function getConsultationsMoyennes(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const consultationsParEtudiant = await prisma.consultation.groupBy({
      by: ["etudiantId"],
      where: {
        psychologueId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      _count: { id: true },
    });

    if (consultationsParEtudiant.length === 0) {
      return NextResponse.json({ consultationsMoyennesParPatient: 0 });
    }

    const totalConsultations = consultationsParEtudiant.reduce(
      (sum, record) => sum + (record._count.id ?? 0),
      0
    );

    const moyenne = totalConsultations / consultationsParEtudiant.length;

    return NextResponse.json({
      consultationsMoyennesParPatient: parseFloat(moyenne.toFixed(1)),
    });
  } catch (error) {
    console.error("Error in getConsultationsMoyennes:", error);
    throw new Error("Failed to calculate average consultations per patient");
  }
}

async function getComptesRendezVous(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const allRdv = await prisma.rendezVous.findMany({
      where: {
        id_psychologue: psychologueId,
        date: { gte: fromDate, lte: toDate },
      },
      select: { statut: true },
    });

    const total = allRdv.length;
    const confirmes = allRdv.filter((rdv) => rdv.statut === "confirmé").length;
    const annules = allRdv.filter((rdv) => rdv.statut === "annulé").length;
    const enAttente = allRdv.filter(
      (rdv) => rdv.statut === "en attente"
    ).length;

    return NextResponse.json({
      total,
      confirmes,
      annules,
      enAttente,
    });
  } catch (error) {
    console.error("Error in getComptesRendezVous:", error);
    throw new Error("Failed to fetch appointment counts");
  }
}

async function getTauxAnnulation(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const allRdv = await prisma.rendezVous.findMany({
      where: {
        id_psychologue: psychologueId,
        date: { gte: fromDate, lte: toDate },
      },
      select: { statut: true },
    });

    const total = allRdv.length;
    const annules = allRdv.filter((rdv) => rdv.statut === "annulé").length;
    const taux = total > 0 ? annules / total : 0;

    return NextResponse.json({
      tauxAnnulation: parseFloat((taux * 100).toFixed(2)),
    });
  } catch (error) {
    console.error("Error in getTauxAnnulation:", error);
    throw new Error("Failed to calculate cancellation rate");
  }
}

async function getSatisfactionMoyenne(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: {
        consultation: {
          psychologueId,
          createdAt: { gte: fromDate, lte: toDate },
        },
      },
      select: { satisfaction: true },
    });

    const validEvaluations = evaluations.filter(
      (e) => e.satisfaction !== null && e.satisfaction !== undefined
    );

    if (validEvaluations.length === 0) {
      return NextResponse.json({ satisfactionMoyenne: 0 });
    }

    const moyenne =
      validEvaluations.reduce((sum, e) => sum + e.satisfaction, 0) /
      validEvaluations.length;

    return NextResponse.json({
      satisfactionMoyenne: parseFloat(moyenne.toFixed(1)),
    });
  } catch (error) {
    console.error("Error in getSatisfactionMoyenne:", error);
    throw new Error("Failed to calculate average satisfaction");
  }
}

async function getDetailsEvaluations(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: {
        consultation: {
          psychologueId,
          createdAt: { gte: fromDate, lte: toDate },
        },
      },
      select: {
        empathie: true,
        ecoute: true,
        comprehension: true,
      },
    });

    const calculerMoyenne = (
      field: "empathie" | "ecoute" | "comprehension"
    ) => {
      const valeurs = evaluations
        .map((e) => e[field])
        .filter((v): v is number => v !== null && v !== undefined);
      return valeurs.length > 0
        ? valeurs.reduce((sum, v) => sum + v, 0) / valeurs.length
        : 0;
    };

    return NextResponse.json({
      empathieMoyenne: parseFloat(calculerMoyenne("empathie").toFixed(1)),
      ecouteMoyenne: parseFloat(calculerMoyenne("ecoute").toFixed(1)),
      comprehensionMoyenne: parseFloat(
        calculerMoyenne("comprehension").toFixed(1)
      ),
    });
  } catch (error) {
    console.error("Error in getDetailsEvaluations:", error);
    throw new Error("Failed to fetch evaluation details");
  }
}

async function getTotalEvaluations(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const count = await prisma.evaluation.count({
      where: {
        consultation: {
          psychologueId,
          createdAt: { gte: fromDate, lte: toDate },
        },
      },
    });

    return NextResponse.json({ totalEvaluations: count });
  } catch (error) {
    console.error("Error in getTotalEvaluations:", error);
    throw new Error("Failed to fetch total evaluations");
  }
}

async function getTotalReclamations(
  psychologueId: number,
  fromDate: Date,
  toDate: Date
) {
  try {
    const etudiantsIds = await prisma.consultation
      .findMany({
        where: { psychologueId },
        select: { etudiantId: true },
        distinct: ["etudiantId"],
      })
      .then((results) => results.map((r) => r.etudiantId));

    const count = await prisma.reclamation.count({
      where: {
        dateCreation: { gte: fromDate, lte: toDate },
        OR: [
          { roleUtilisateur: "PSYCHOLOGUE", utilisateurId: psychologueId },
          {
            roleUtilisateur: "ETUDIANT",
            utilisateurId: { in: etudiantsIds },
          },
        ],
      },
    });

    return NextResponse.json({ totalReclamationsConcernees: count });
  } catch (error) {
    console.error("Error in getTotalReclamations:", error);
    throw new Error("Failed to fetch total reclamations");
  }
}
