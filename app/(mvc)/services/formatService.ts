// app/(mvc)/services/formatService.ts

import { RendezVous, Psychologue, utilisateur } from "@prisma/client";

// Définition des types pour les données formatées
interface FormattedPsychologue {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  civilite: string;
  avatar: string | null;
  titre: string;
  etablissement: string;
  adresse_cabinet: string | null;
  intitule_diplome: string;
  mode_consultation: string | null;
}

interface FormattedRendezVous {
  id: number;
  date: Date;
  heure_debut: string;
  heure_fin: string;
  type: string;
  statut: string;
  id_utilisateur: number;
  id_psychologue: number;
  createdAt: Date;
  updatedAt: Date;
  psychologue: FormattedPsychologue;
}

// Type pour les données prisma récupérées avec includes
interface RendezVousWithRelations extends RendezVous {
  psychologue: Psychologue & {
    utilisateur: utilisateur;
  };
}

/**
 * Transforme les données de rendez-vous pour un format adapté au frontend
 * @param rendezVous Array de rendez-vous avec relations
 * @returns Array de rendez-vous formatés pour le frontend
 */
export const formatRendezVousPourFrontend = (
  rendezVous: RendezVousWithRelations[]
): FormattedRendezVous[] => {
  return rendezVous.map((rdv) => {
    return {
      id: rdv.id,
      date: rdv.date,
      heure_debut: rdv.heure_debut,
      heure_fin: rdv.heure_fin,
      type: rdv.type,
      statut: rdv.statut,
      id_utilisateur: rdv.id_utilisateur,
      id_psychologue: rdv.id_psychologue,
      createdAt: rdv.createdAt,
      updatedAt: rdv.updatedAt,
      psychologue: {
        id: rdv.psychologue.id_psychologue,
        nom: rdv.psychologue.utilisateur.nom,
        prenom: rdv.psychologue.utilisateur.prenom,
        email: rdv.psychologue.utilisateur.email,
        telephone: rdv.psychologue.utilisateur.telephone,
        civilite: rdv.psychologue.utilisateur.civilite,
        avatar: rdv.psychologue.utilisateur.avatar
          ? Buffer.from(rdv.psychologue.utilisateur.avatar).toString("base64")
          : null,
        titre: rdv.psychologue.titre,
        etablissement: rdv.psychologue.etablissement,
        adresse_cabinet: rdv.psychologue.adresse_cabinet,
        intitule_diplome: rdv.psychologue.intitule_diplome,
        mode_consultation: rdv.psychologue.mode_consultation,
      },
    };
  });
};

/**
 * Formate un rendez-vous individuel pour le frontend
 * @param rdv Rendez-vous avec relations
 * @returns Rendez-vous formaté pour le frontend
 */
export const formatRendezVousIndividuel = (
  rdv: RendezVousWithRelations
): FormattedRendezVous => {
  return {
    id: rdv.id,
    date: rdv.date,
    heure_debut: rdv.heure_debut,
    heure_fin: rdv.heure_fin,
    type: rdv.type,
    statut: rdv.statut,
    id_utilisateur: rdv.id_utilisateur,
    id_psychologue: rdv.id_psychologue,
    createdAt: rdv.createdAt,
    updatedAt: rdv.updatedAt,
    psychologue: {
      id: rdv.psychologue.id_psychologue,
      nom: rdv.psychologue.utilisateur.nom,
      prenom: rdv.psychologue.utilisateur.prenom,
      email: rdv.psychologue.utilisateur.email,
      telephone: rdv.psychologue.utilisateur.telephone,
      civilite: rdv.psychologue.utilisateur.civilite,
      avatar: rdv.psychologue.utilisateur.avatar
        ? Buffer.from(rdv.psychologue.utilisateur.avatar).toString("base64")
        : null,
      titre: rdv.psychologue.titre,
      etablissement: rdv.psychologue.etablissement,
      adresse_cabinet: rdv.psychologue.adresse_cabinet,
      intitule_diplome: rdv.psychologue.intitule_diplome,
      mode_consultation: rdv.psychologue.mode_consultation,
    },
  };
};

/**
 * Formate les données d'un psychologue pour le frontend
 * @param psychologue Psychologue avec relation utilisateur
 * @returns Données formatées du psychologue
 */
export const formatPsychologueData = (
  psychologue: Psychologue & { utilisateur: utilisateur }
): FormattedPsychologue => {
  return {
    id: psychologue.id_psychologue,
    nom: psychologue.utilisateur.nom,
    prenom: psychologue.utilisateur.prenom,
    email: psychologue.utilisateur.email,
    telephone: psychologue.utilisateur.telephone,
    civilite: psychologue.utilisateur.civilite,
    avatar: psychologue.utilisateur.avatar
      ? Buffer.from(psychologue.utilisateur.avatar).toString("base64")
      : null,
    titre: psychologue.titre,
    etablissement: psychologue.etablissement,
    adresse_cabinet: psychologue.adresse_cabinet,
    intitule_diplome: psychologue.intitule_diplome,
    mode_consultation: psychologue.mode_consultation,
  };
};

/**
 * Transforme les données de rendez-vous pour le format nécessaire au calendrier
 * @param rendezVous Array de rendez-vous avec relations
 * @returns Events formatés pour le calendrier
 */
export const formatRendezVousPourCalendrier = (
  rendezVous: RendezVousWithRelations[]
) => {
  return rendezVous.map((rdv) => {
    const dateObj = new Date(rdv.date);
    const [heures, minutes] = rdv.heure_debut.split(":").map(Number);
    const [heuresFin, minutesFin] = rdv.heure_fin.split(":").map(Number);

    // Configurer les dates de début et de fin
    const start = new Date(dateObj);
    start.setHours(heures, minutes, 0);

    const end = new Date(dateObj);
    end.setHours(heuresFin, minutesFin, 0);

    // Définir la couleur en fonction du statut
    let color = "#3788d8"; // Bleu par défaut
    if (rdv.statut === "confirmé") {
      color = "#2ecc71"; // Vert
    } else if (rdv.statut === "rejeté") {
      color = "#e74c3c"; // Rouge
    }

    return {
      id: rdv.id.toString(),
      title: `${rdv.psychologue.utilisateur.prenom} ${rdv.psychologue.utilisateur.nom}`,
      start: start.toISOString(),
      end: end.toISOString(),
      description: `Consultation ${rdv.type}`,
      color: color,
      extendedProps: {
        statut: rdv.statut,
        type: rdv.type,
        psychologueId: rdv.id_psychologue,
        utilisateurId: rdv.id_utilisateur,
      },
    };
  });
};
