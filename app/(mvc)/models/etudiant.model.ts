import prisma from "../lib/prisma";

// Interface for creating an Etudiant
interface EtudiantCreateData {
  numero_carte_etudiant: string;
  niveau: string;
  etablissement: string;
  utilisateurId: number;
}

// Interface for updating an Etudiant
interface EtudiantUpdateData {
  numero_carte_etudiant?: string;
  niveau?: string;
  etablissement?: string;
  utilisateur?: { connect: { id: number } };
}

// Récupérer un étudiant par son ID
export const findEtudiantById = async (id_etudiant: number) => {
  try {
    return await prisma.etudiant.findUnique({
      where: { id_etudiant },
    });
  } catch (error) {
    console.error("Error finding etudiant by ID:", error);
    throw new Error("Failed to find etudiant");
  }
};

// Récupérer un étudiant par l'ID de l'utilisateur associé
export const findEtudiantByUtilisateurId = async (utilisateurId: number) => {
  try {
    return await prisma.etudiant.findUnique({
      where: {
        id_etudiant: utilisateurId, // id_etudiant matches utilisateur.id
      },
    });
  } catch (error) {
    console.error("Error finding etudiant by utilisateurId:", error);
    throw new Error("Failed to find etudiant by utilisateurId");
  }
};
// Récupérer un étudiant par son numéro de carte
export const findEtudiantByNumeroCarteEtudiant = async (
  numero_carte_etudiant: string
) => {
  try {
    return await prisma.etudiant.findUnique({
      where: { numero_carte_etudiant },
    });
  } catch (error) {
    console.error("Error finding etudiant by numero_carte_etudiant:", error);
    throw new Error("Failed to find etudiant by numero_carte_etudiant");
  }
};

// Récupérer tous les étudiants avec leurs informations utilisateur
export const findAllEtudiants = async () => {
  try {
    return await prisma.etudiant.findMany({
      include: {
        utilisateur: true,
      },
    });
  } catch (error) {
    console.error("Error finding all etudiants:", error);
    throw new Error("Failed to find all etudiants");
  }
};

// Créer un nouvel étudiant
export const createEtudiant = async (etudiantData: EtudiantCreateData) => {
  try {
    return await prisma.etudiant.create({
      data: {
        numero_carte_etudiant: etudiantData.numero_carte_etudiant,
        niveau: etudiantData.niveau,
        etablissement: etudiantData.etablissement,
        utilisateur: {
          connect: { id: etudiantData.utilisateurId },
        },
      },
    });
  } catch (error) {
    console.error("Error creating etudiant:", error);
    throw new Error("Failed to create etudiant");
  }
};

// Mettre à jour un étudiant existant
export const updateEtudiant = async (
  id_etudiant: number,
  etudiantData: EtudiantUpdateData
) => {
  try {
    return await prisma.etudiant.update({
      where: { id_etudiant },
      data: etudiantData,
    });
  } catch (error) {
    console.error("Error updating etudiant:", error);
    throw new Error("Failed to update etudiant");
  }
};

// Supprimer un étudiant
export const deleteEtudiant = async (id_etudiant: number) => {
  try {
    return await prisma.etudiant.delete({
      where: { id_etudiant },
    });
  } catch (error) {
    console.error("Error deleting etudiant:", error);
    throw new Error("Failed to delete etudiant");
  }
};
