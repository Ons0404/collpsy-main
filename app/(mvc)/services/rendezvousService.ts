import {
  getRendezVousById,
  updateRendezVous,
  createRendezVous as createRendezVousModel,
} from "../models/rendezvous.model";

export async function createRendezVousService(data: {
  id_psychologue: number;
  id_utilisateur: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  statut?: string;
  notes?: string;
}) {
  return createRendezVousModel({
    ...data,
    id_psychologue: Number(data.id_psychologue),
    id_utilisateur: Number(data.id_utilisateur),
    date: new Date(data.date),
    statut: data.statut || "en attente",
    notes: data.notes || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateRendezVousService(
  id: number,
  data: { statut: string }
) {
  const rendezVous = await getRendezVousById(id);
  if (!rendezVous) return null;
  return updateRendezVous(id, data);
}
