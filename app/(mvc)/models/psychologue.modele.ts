// models/psychologueModel.ts
import prisma from "../lib/prisma";

// Interface représentant un psychologue dans la base de données
export interface Psychologue {
  id_psychologue: number;
  cin: string;
  titre: string;
  etablissement: string;
  adresse_cabinet?: string | null;
  intitule_diplome: string;
  date_obtention: Date;
  mode_consultation?: "PRESENTIEL" | "EN_LIGNE" | "LES_DEUX" | null;
  photo_diplome?: Buffer | null;
  utilisateurId: number;
}

// Interface pour les données de création d'un psychologue
export type PsychologueCreateInput = Omit<Psychologue, "id_psychologue"> & {
  utilisateurId: number;
};

// Interface pour les données de mise à jour d'un psychologue
export type PsychologueUpdateInput = Partial<
  Omit<Psychologue, "id_psychologue" | "utilisateurId">
>;

// Interface pour les psychologues avec leurs informations utilisateur
export interface PsychologueWithUtilisateur extends Psychologue {
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
    ville: string | null;
    avatar: string | null;
    statut: string;
  };
}

// Interface pour les psychologues avec leurs disponibilités
export interface PsychologueWithDisponibilites
  extends PsychologueWithUtilisateur {
  disponibilites: Array<{
    id: number;
    date: Date;
    heure_debut: Date;
    heure_fin: Date;
    est_disponible: boolean;
    psychologueId: number;
  }>;
}

// Interface pour les psychologues avec pagination
export interface PaginatedPsychologues {
  psychologues: PsychologueWithUtilisateur[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface pour les filtres de recherche de psychologues
export interface PsychologueSearchFilters {
  ville?: string;
  mode_consultation?: "PRESENTIEL" | "EN_LIGNE" | "LES_DEUX";
  disponible_date?: Date;
  search?: string; // Pour chercher dans le nom, prénom ou titre
}

// Interface pour trier les psychologues
export enum PsychologueSortOrder {
  RECENT = "recent",
  ANCIEN = "ancien",
  NOM_ASC = "nom_asc",
  NOM_DESC = "nom_desc",
}

// Type pour les statistiques des psychologues
export interface PsychologueStats {
  total: number;
  enLigne: number;
  presentiel: number;
  lesDeux: number;
  parVille: Record<string, number>;
}
// app/(mvc)/models/psychologue.model.ts


export const getAllPsychologues = async () => {
  return prisma.psychologue.findMany({
    include: {
      utilisateur: true, // Inclure les données de l'utilisateur associé
    },
  });
};