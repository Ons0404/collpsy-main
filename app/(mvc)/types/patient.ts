import { Buffer } from "buffer";

// Types for consultation status and type
export type ConsultationStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TypeConsultation = "PRESENTIEL" | "EN_LIGNE" | "LES_DEUX";
export enum RoleEnum {ETUDIANT = "ETUDIANT",
  PSYCHOLOGUE = "PSYCHOLOGUE",}
// Interface for EtudiantInfo with Buffer for avatar
export interface EtudiantInfo {
  id_etudiant: number;
  numero_carte_etudiant: string;
  niveau: string;
  etablissement: string;
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
    date_inscription: Date;
    date_naissance: Date | null;
    adresse: string | null;
    ville: string | null;
    code_postal: string | null;
    telephone: string | null;
    role: RoleEnum;
    civilite: "M" | "Mme";
    statut: boolean;
    avatar: Buffer | null;
  };
}
// Interface for FichePatient


// Interface for PatientRecord with fichePatient property
export interface PatientRecord {
  id: string;
  etudiantId: number;
  psychologueId: number;
  status: ConsultationStatus;
  type: string;
  startTime: Date;
  endTime: Date;
  notes: string | null;
  summary: string | null;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
  fichePatientId: string | null;
  rendezVousId: string;
  etudiant: EtudiantInfo | null;
  fichePatient: FichePatient | null;
}
export interface FichePatient {
  id: string;
  etudiantId: number;
  createdAt: Date;
  updatedAt: Date;
  antecedentsMedicaux: string | null;
  antecedentsPsychologiques: string | null;
  allergies: string | null;
  medicamentsActuels: string | null;
  traitementsEnCours: string | null;
  symptomesActuels: string | null;
  objectifsTherapie: string | null;
  notesPsychologue: string | null;
  historiqueConsultations: string | null;
}