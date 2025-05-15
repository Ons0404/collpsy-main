import { Psychologue, utilisateur, RendezVous } from "@prisma/client";

export type RendezVousWithRelations = RendezVous & {
  psychologue: Psychologue & { utilisateur: utilisateur };
  utilisateur: utilisateur;
};
