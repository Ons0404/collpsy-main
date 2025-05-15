import prisma from "../../(mvc)/lib/prisma"; // Assurez-vous que ce chemin correspond à votre configuration

interface ReclamationInput {
  categorie: string;
  description: string;
  isUrgent: boolean;
  pieceJointe?: string | null;
  utilisateurId: number;
  roleUtilisateur: string;
}

/**
 * Crée une nouvelle réclamation dans la base de données
 * @param reclamationData Les données de la réclamation à créer
 * @returns La réclamation créée
 */
export async function createReclamation(reclamationData: ReclamationInput) {
  try {
    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: reclamationData.utilisateurId },
    });

    if (!utilisateur) {
      throw new Error("Utilisateur non trouvé");
    }

    // Créer la réclamation
    const reclamation = await prisma.reclamation.create({
      data: {
        categorie: reclamationData.categorie,
        description: reclamationData.description,
        isUrgent: reclamationData.isUrgent,
        pieceJointe: reclamationData.pieceJointe,
        utilisateurId: reclamationData.utilisateurId,
        roleUtilisateur: reclamationData.roleUtilisateur,
        status: "NOUVELLE",
        dateCreation: new Date(),
      },
    });

    // Créer une notification pour l'administrateur
    // Note: Cette partie suppose que vous avez un système de notification et des administrateurs
    try {
      // Récupérer les administrateurs
      const administrateurs = await prisma.administrateur.findMany();

      for (const admin of administrateurs) {
        await prisma.notification.create({
          data: {
            userId: reclamationData.utilisateurId,
            message: `Nouvelle réclamation ${
              reclamation.isUrgent ? "URGENTE" : ""
            } reçue: ${reclamation.categorie}`,
            administrateurId: admin.id,
          },
        });
      }
    } catch (notifError) {
      console.error(
        "Erreur lors de la création des notifications:",
        notifError
      );
      // On continue même si la création de notification échoue
    }

    return reclamation;
  } catch (error) {
    console.error(
      "Erreur dans reclamationController.createReclamation:",
      error
    );
    throw error;
  }
}

/**
 * Récupère une réclamation par son ID
 * @param id L'ID de la réclamation à récupérer
 * @returns La réclamation trouvée ou null
 */
export async function getReclamationById(id: number) {
  return await prisma.reclamation.findUnique({
    where: { id },
    include: {
      utilisateur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

/**
 * Récupère toutes les réclamations d'un utilisateur
 * @param utilisateurId L'ID de l'utilisateur
 * @returns Liste des réclamations de l'utilisateur
 */
export async function getReclamationsByUser(utilisateurId: number) {
  return await prisma.reclamation.findMany({
    where: {
      utilisateurId,
    },
    orderBy: {
      dateCreation: "desc",
    },
  });
}

/**
 * Récupère toutes les réclamations avec pagination et filtrage
 * @param options Options de pagination et filtrage
 * @returns Liste paginée des réclamations
 */
export async function getAllReclamations(options: {
  page?: number;
  limit?: number;
  status?: string;
  isUrgent?: boolean;
}) {
  const { page = 1, limit = 10, status, isUrgent } = options;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (status) whereClause.status = status;
  if (isUrgent !== undefined) whereClause.isUrgent = isUrgent;

  const [reclamations, totalCount] = await Promise.all([
    prisma.reclamation.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [{ isUrgent: "desc" }, { dateCreation: "desc" }],
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.reclamation.count({ where: whereClause }),
  ]);

  return {
    reclamations,
    pagination: {
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      page,
      limit,
    },
  };
}

/**
 * Met à jour le statut d'une réclamation
 * @param id L'ID de la réclamation à mettre à jour
 * @param status Le nouveau statut
 * @returns La réclamation mise à jour
 */
export async function updateReclamationStatus(id: number, status: string) {
  const data: any = { status };

  // Si la réclamation est résolue, ajoutez la date de résolution
  if (status === "RÉSOLUE") {
    data.dateResolution = new Date();
  }

  return await prisma.reclamation.update({
    where: { id },
    data,
  });
}
