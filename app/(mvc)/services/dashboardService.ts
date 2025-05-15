import { PrismaClient } from "@prisma/client";
import { RoleEnum } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour récupérer le profil utilisateur complet
export async function getUserProfile(userId: number) {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: {
        id: userId,
      },
      include: {
        psychologue: true,
        etudiant: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    throw error;
  }
}

// Fonction pour mettre à jour le profil utilisateur
export async function updateUserProfile(userId: number, userData: any) {
  try {
    const { psychologue, etudiant, ...userBasicData } = userData;
    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: {
        ...userBasicData,
        date_naissance: userBasicData.date_naissance
          ? new Date(userBasicData.date_naissance)
          : undefined,
      },
      include: { psychologue: true, etudiant: true },
    });

    if (updatedUser.role === RoleEnum.PSYCHOLOGUE && psychologue) {
      const psychologueData = {
        cin: psychologue.cin || "",
        titre: psychologue.titre || "",
        etablissement: psychologue.etablissement || "",
        adresse_cabinet: psychologue.adresse_cabinet,
        intitule_diplome: psychologue.intitule_diplome || "",
        date_obtention: psychologue.date_obtention
          ? new Date(psychologue.date_obtention)
          : new Date(),
        mode_consultation: psychologue.mode_consultation,
        tarif: psychologue.tarif ? Number(psychologue.tarif) : undefined,
      };

      const existingPsychologue = await prisma.psychologue.findUnique({
        where: { id_psychologue: userId },
      });

      if (existingPsychologue) {
        await prisma.psychologue.update({
          where: { id_psychologue: userId },
          data: psychologueData,
        });
      } else {
        await prisma.psychologue.create({
          data: {
            id_psychologue: userId,
            ...psychologueData,
          },
        });
      }
    }

    return await getUserProfile(userId); // Ensure getUserProfile is also moved or imported
  } catch (error) {
    console.error("Detailed error in updateUserProfile:", error);
    throw error;
  }
}


// Fonction pour mettre à jour uniquement l'avatar de l'utilisateur
export async function updateUserAvatar(userId: number, avatarData: string) {
  try {
    // Convertir la string base64 en Buffer
    const avatarBuffer = Buffer.from(avatarData, "base64");

    const updatedUser = await prisma.utilisateur.update({
      where: {
        id: userId,
      },
      data: {
        avatar: avatarBuffer,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    throw error;
  }
}

// Fonction pour récupérer les disponibilités d'un psychologue
export async function getUserDisponibilities(psychologueId: number) {
  try {
    const disponibilities = await prisma.disponibilite.findMany({
      where: {
        id_psychologue: psychologueId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return disponibilities;
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    throw error;
  }
}

// Fonction pour créer une nouvelle disponibilité
export async function createDisponibility(
  psychologueId: number,
  disponibilityData: any
) {
  try {
    const { date, heure_debut, heure_fin, type, est_disponible } =
      disponibilityData;

    const newDisponibility = await prisma.disponibilite.create({
      data: {
        id_psychologue: psychologueId,
        date: new Date(date),
        heure_debut,
        heure_fin,
        type,
        est_disponible: est_disponible !== undefined ? est_disponible : true,
      },
    });

    return newDisponibility;
  } catch (error) {
    console.error("Erreur lors de la création de la disponibilité:", error);
    throw error;
  }
}

// Fonction pour mettre à jour une disponibilité existante
export async function updateDisponibility(
  disponibilityId: number,
  disponibilityData: any
) {
  try {
    const { date, heure_debut, heure_fin, type, est_disponible } =
      disponibilityData;

    const updatedDisponibility = await prisma.disponibilite.update({
      where: {
        id: disponibilityId,
      },
      data: {
        date: date ? new Date(date) : undefined,
        heure_debut,
        heure_fin,
        type,
        est_disponible,
      },
    });

    return updatedDisponibility;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);
    throw error;
  }
}

// Fonction pour supprimer une disponibilité
export async function deleteDisponibility(disponibilityId: number) {
  try {
    await prisma.disponibilite.delete({
      where: {
        id: disponibilityId,
      },
    });

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la disponibilité:", error);
    return false;
  }
}

// Fonction pour récupérer les rendez-vous d'un utilisateur
export async function getUserAppointments(userId: number, userRole: string) {
  try {
    // Définir le filtre en fonction du rôle de l'utilisateur
    const filter =
      userRole === "PSYCHOLOGUE"
        ? { id_psychologue: userId }
        : { id_utilisateur: userId };

    const appointments = await prisma.rendezVous.findMany({
      where: filter,
      include: {
        psychologue: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return appointments;
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    throw error;
  }
}

// Fonction pour mettre à jour le statut d'un rendez-vous
export async function updateAppointmentStatus(
  appointmentId: number,
  status: string
) {
  try {
    const updatedAppointment = await prisma.rendezVous.update({
      where: {
        id: appointmentId,
      },
      data: {
        statut: status,
      },
    });

    return updatedAppointment;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut du rendez-vous:",
      error
    );
    throw error;
  }
}
