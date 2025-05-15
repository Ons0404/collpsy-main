// /types/index.ts

export type UserWithRelations = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  date_inscription: Date;
  date_naissance?: Date;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  telephone?: string;
  role: RoleEnum;
  civilite: CiviliteEnum;
  avatar?: Buffer;
  statut: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  etudiant?: Student;
  psychologue?: Psychologist;
  rendezVous?: Appointment[];
  messages?: Message[];
};

export type Student = {
  id_etudiant: number;
  numero_carte_etudiant: string;
  niveau: string;
  etablissement: string;
  utilisateur: UserWithRelations;
};

export type Psychologist = {
  id_psychologue: number;
  cin: string;
  titre: string;
  etablissement: string;
  adresse_cabinet?: string;
  intitule_diplome: string;
  date_obtention: Date;
  mode_consultation?: string;
  photo_diplome?: Buffer;
  disponibilites?: Availability[];
  utilisateur: UserWithRelations;
  rendezVous?: Appointment[];
};

export type Availability = {
  id: number;
  id_psychologue: number;
  date: Date;
  heure_debut: string;
  heure_fin: string;
  type: TypeConsultation;
  est_disponible: boolean;
  psychologue: Psychologist;
};

export type Appointment = {
  id: number;
  id_psychologue: number;
  id_utilisateur: number;
  date: Date;
  heure_debut: string;
  heure_fin: string;
  type: string;
  statut: string;
  createdAt: Date;
  updatedAt: Date;
  psychologue: Psychologist;
  utilisateur: UserWithRelations;
};

export interface Consultation {
  etudiantId: number;
  psychologistId: number;
  startTime: Date;
  endTime: Date;
  type: TypeConsultation;
  status: ConsultationStatus;
  notes?: string | null;
  roomId?: string;
  rendezVousId?: number;
}

// Type pour createConsultation, sans etudiantId
export interface CreateConsultationData {
  etudiantId: number; // Ajouté explicitement
  psychologistId: number;
  startTime: Date;
  endTime: Date;
  type: TypeConsultation;
  status: ConsultationStatus;
  notes?: string | null;
  roomId?: string | null;
  rendezVousId?: number;
}
export type Message = {
  id: string;
  consultationId: string;
  senderId: string;
  content: string;
  sentAt: Date;
  readAt?: Date;
  consultation: Consultation;
};

export type ConsultationFormData = {
  psychologistId: number;
  type: ConsultationType;
  startTime: Date;
  endTime: Date;
  notes?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Enums
export enum RoleEnum {
  PSYCHOLOGUE = "PSYCHOLOGUE",
  ETUDIANT = "ETUDIANT",
}

export enum CiviliteEnum {
  M = "M",
  Mme = "Mme",
}

export enum TypeConsultation {
  PRESENTIEL = "PRESENTIEL",
  EN_LIGNE = "EN_LIGNE",
  LES_DEUX = "LES_DEUX",
}
export enum ConsultationStatus {
  REQUESTED = "REQUESTED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ConsultationType {
  VIDEO = "VIDEO",
  CHAT = "CHAT",
  IN_PERSON = "IN_PERSON",
}
