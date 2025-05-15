// app/(mvc)/types/consultation.types.ts
export enum ConsultationType {
  ONLINE = "ONLINE",
  IN_PERSON = "IN_PERSON",
}

export enum ConsultationStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Consultation {
  id: number;
  userId: string;
  psychologistId: string;
  psychologist: {
    id: string;
    name: string;
    title: string;
  };
  date: Date;
  type: ConsultationType;
  status: ConsultationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
