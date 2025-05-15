// /contexts/consultationContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Consultation {
  roomId: number;
  userId: number;
  psychologistId: number;
  consultationId?: number;
}

interface ConsultationContextType {
  activeConsultation: Consultation | null;
  setActiveConsultation: (consultation: Consultation | null) => void;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(
  undefined
);

export const ConsultationProvider = ({ children }: { children: ReactNode }) => {
  const [activeConsultation, setActiveConsultation] =
    useState<Consultation | null>(null);

  return (
    <ConsultationContext.Provider
      value={{ activeConsultation, setActiveConsultation }}
    >
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error(
      "useConsultation must be used within a ConsultationProvider"
    );
  }
  return context;
};
