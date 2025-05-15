export type AppointmentType = "online" | "inPerson";

export interface Appointment {
  id: string;
  number: number;
  date: string;
  doctorName: string;
  type: AppointmentType;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
}

export interface PsychologicalTest {
  id: string;
  name: string;
  description: string;
  duration: string;
}

// app/(mvc)/types/appointment.types.ts
export interface Psychologist {
  id: number; // Change to number
  name: string;
  specialty: string;
  experience: string;
}

