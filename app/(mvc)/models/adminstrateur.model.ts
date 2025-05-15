import prisma from "../lib/prisma";

// Récupérer un administrateur par son ID
export const findAdministrateurById = async (id: number) => {
  return prisma.administrateur.findUnique({
    where: { id },
  });
};

// Récupérer un administrateur par son email
export const findAdministrateurByEmail = async (email: string) => {
  return prisma.administrateur.findUnique({
    where: { email },
  });
};

// Créer un nouvel administrateur
export const createAdministrateur = async (adminData: {
  email: string;
  mot_de_passe: string;
}) => {
  // Pas de hashage, on utilise le mot de passe tel quel
  return prisma.administrateur.create({
    data: {
      email: adminData.email,
      mot_de_passe: adminData.mot_de_passe,
    },
  });
};

// Mettre à jour un administrateur existant
export const updateAdministrateur = async (id: number, adminData: any) => {
  // Pas de traitement spécial pour le mot de passe
  return prisma.administrateur.update({
    where: { id },
    data: adminData,
  });
};

// Supprimer un administrateur
export const deleteAdministrateur = async (id: number) => {
  return prisma.administrateur.delete({
    where: { id },
  });
};

// Vérifier les identifiants d'un administrateur
export const verifyAdministrateurCredentials = async (
  email: string,
  password: string
) => {
  const admin = await findAdministrateurByEmail(email);

  if (!admin) return null;

  // Comparaison directe des mots de passe sans bcrypt
  const passwordValid = admin.mot_de_passe === password;

  return passwordValid ? admin : null;
};

// Vérifier l'ancien mot de passe d'un administrateur
export const verifyOldPassword = async (id: number, oldPassword: string) => {
  const admin = await findAdministrateurById(id);
  if (!admin) return false;

  // Comparaison directe des mots de passe
  return admin.mot_de_passe === oldPassword;
};
