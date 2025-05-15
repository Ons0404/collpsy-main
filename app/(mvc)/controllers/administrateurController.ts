import { NextResponse } from "next/server";
import {
  findAdministrateurById,
  findAdministrateurByEmail,
  createAdministrateur,
  updateAdministrateur,
  deleteAdministrateur,
  verifyAdministrateurCredentials,
} from "../models/adminstrateur.model";

// Récupérer un administrateur par son ID
export async function getAdministrateur(id: number) {
  try {
    const administrateur = await findAdministrateurById(id);

    if (!administrateur) {
      return null;
    }

    return administrateur;
  } catch (err) {
    console.error("Erreur lors de la récupération de l'administrateur:", err);
    return null;
  }
}

// Récupérer un administrateur par son email
export async function getAdministrateurByEmail(email: string) {
  try {
    const administrateur = await findAdministrateurByEmail(email);

    if (!administrateur) {
      return null;
    }

    return administrateur;
  } catch (err) {
    console.error("Erreur lors de la récupération de l'administrateur:", err);
    return null;
  }
}

// Créer un nouvel administrateur
export async function addAdministrateur(data: any) {
  try {
    // Validation des données requises
    if (!data.email || !data.mot_de_passe) {
      return null;
    }

    // Vérifier si l'email est déjà utilisé
    const existingAdmin = await findAdministrateurByEmail(data.email);
    if (existingAdmin) {
      return null;
    }

    const nouvelAdministrateur = await createAdministrateur({
      email: data.email,
      mot_de_passe: data.mot_de_passe,
    });

    return nouvelAdministrateur;
  } catch (err) {
    console.error("Erreur lors de la création de l'administrateur:", err);
    return null;
  }
}

// Mettre à jour un administrateur
export async function updateAdministrateurInfo(id: number, data: any) {
  try {
    // Vérifier si l'administrateur existe
    const existingAdmin = await findAdministrateurById(id);
    if (!existingAdmin) {
      return null;
    }

    // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
    if (data.email && data.email !== existingAdmin.email) {
      const emailExists = await findAdministrateurByEmail(data.email);
      if (emailExists) {
        return null;
      }
    }

    const updatedAdministrateur = await updateAdministrateur(id, data);
    return updatedAdministrateur;
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'administrateur:", err);
    return null;
  }
}

// Supprimer un administrateur
export async function removeAdministrateur(id: number) {
  try {
    // Vérifier si l'administrateur existe
    const existingAdmin = await findAdministrateurById(id);
    if (!existingAdmin) {
      return false;
    }

    await deleteAdministrateur(id);
    return true;
  } catch (err) {
    console.error("Erreur lors de la suppression de l'administrateur:", err);
    return false;
  }
}

// Authentifier un administrateur
export async function authenticateAdministrateur(data: any) {
  try {
    // Validation des données requises
    if (!data.email || !data.mot_de_passe) {
      return null;
    }

    const admin = await verifyAdministrateurCredentials(
      data.email,
      data.mot_de_passe
    );

    return admin;
  } catch (err) {
    console.error("Erreur lors de l'authentification:", err);
    return null;
  }
}
