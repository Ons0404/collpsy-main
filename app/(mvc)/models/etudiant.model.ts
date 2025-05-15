import prisma from "../lib/prisma";

// Récupérer un étudiant par son ID
export const findEtudiantById = async (id_etudiant: number) => {
  return prisma.etudiant.findUnique({
    where: { id_etudiant },
  });
};

// Récupérer un étudiant par l'ID de l'utilisateur associé
export const findEtudiantByUtilisateurId = async (utilisateurId: number) => {
  return prisma.etudiant.findUnique({
    where: { utilisateurId },
  });
};

// Récupérer un étudiant par son numéro de carte
export const findEtudiantByNumeroCarteEtudiant = async (
  numero_carte_etudiant: string
) => {
  return prisma.etudiant.findUnique({
    where: { numero_carte_etudiant },
  });
};

// Récupérer tous les étudiants avec leurs informations utilisateur
export const findAllEtudiants = async () => {
  return prisma.etudiant.findMany({
    include: {
      utilisateur: true,
    },
  });
};

// Créer un nouvel étudiant
export const createEtudiant = async (etudiantData: {
  numero_carte_etudiant: string;
  niveau: string;
  etablissement: string;
  utilisateurId: number;
}) => {
  return prisma.etudiant.create({
    data: etudiantData,
  });
};

// Mettre à jour un étudiant existant
export const updateEtudiant = async (
  id_etudiant: number,
  etudiantData: any
) => {
  return prisma.etudiant.update({
    where: { id_etudiant },
    data: etudiantData,
  });
};

// Supprimer un étudiant
export const deleteEtudiant = async (id_etudiant: number) => {
  return prisma.etudiant.delete({
    where: { id_etudiant },
  });
};
