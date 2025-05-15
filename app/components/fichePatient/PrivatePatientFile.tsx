"use client";

import React, { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import Input from "../ui/input";
import {
  ConsultationStatus,
  FichePatient,
  EtudiantInfo,
} from "../../(mvc)/types/patient";

interface PrivatePatientFileProps {
  patientData: {
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
    etudiant: {
      id_etudiant: number;
      numero_carte_etudiant: string;
      niveau: string;
      etablissement: string;
      utilisateur: {
        id: number;
        nom: string;
        prenom: string;
        email: string;
        telephone: string | null;
        date_naissance: Date | null;
        adresse: string | null;
        ville: string | null;
        code_postal: string | null;
        civilite: "M" | "Mme";
      };
    } | null;
    fichePatient: FichePatient | null;
  };
  onDataChange: (data: Partial<FichePatient>) => void;
  onSave: () => Promise<void>;
  onUpdateStatus: (status: ConsultationStatus) => void;
}

const initialFichePatientState: FichePatient = {
  id: "",
  etudiantId: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  antecedentsMedicaux: null,
  antecedentsPsychologiques: null,
  allergies: null,
  medicamentsActuels: null,
  traitementsEnCours: null,
  symptomesActuels: null,
  objectifsTherapie: null,
  notesPsychologue: null,
  historiqueConsultations: null,
};

export default function PrivatePatientFile({
  patientData,
  onDataChange,
  onSave,
  onUpdateStatus,
}: PrivatePatientFileProps) {
  const [fichePatient, setFichePatient] = useState<FichePatient>(
    patientData.fichePatient || {
      ...initialFichePatientState,
      etudiantId: patientData.etudiantId,
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("medical");

  const saveData = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error("Error in saveData:", error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  const handleChange = (field: keyof FichePatient, value: string | null) => {
    const updatedFiche = {
      ...fichePatient,
      [field]: value,
    };
    setFichePatient(updatedFiche);
    onDataChange({ [field]: value });
  };

  const renderTextAreaField = (
    label: string,
    field: keyof FichePatient,
    value: string | null
  ) => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <Textarea
        value={value || ""}
        onChange={(e) => handleChange(field, e.target.value || null)}
        className="border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md w-full min-h-28 shadow-sm"
      />
    </div>
  );

  const renderInputField = (
    label: string,
    field: keyof FichePatient,
    value: string | null
  ) => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <Input
        value={value || ""}
        onChange={(e) => handleChange(field, e.target.value || null)}
        className="border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-md w-full shadow-sm"
      />
    </div>
  );

  const renderInfoField = (label: string, value: string | null | undefined) => (
    <div className="mb-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || "Non renseigné"}</dd>
    </div>
  );

  const renderTab = (id: string, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 font-medium text-base transition-colors ${
        activeTab === id
          ? "border-b-2 border-green-500 text-green-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  // Récupérer les informations de l'étudiant
  const studentInfo = patientData.etudiant?.utilisateur;
  const academicInfo = patientData.etudiant;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-6xl mx-auto">
      {/* En-tête avec titre et sous-titre */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Fiche Patient
          </h2>
        </div>
        {studentInfo && (
          <p className="text-green-600 font-medium ml-11">
            {studentInfo.prenom} {studentInfo.nom}
          </p>
        )}
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 flex">
        {renderTab("info", "Informations Patient")}
        {renderTab("medical", "Informations Médicales")}
        {renderTab("mental", "Santé Mentale")}
        {renderTab("history", "Historique")}
      </div>

      {/* Contenu par onglets */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations personnelles
              </h3>
              <dl className="divide-y divide-gray-200">
                {renderInfoField(
                  "Nom complet",
                  studentInfo
                    ? `${studentInfo.civilite} ${studentInfo.prenom} ${studentInfo.nom}`
                    : null
                )}
                {renderInfoField("Email", studentInfo?.email)}
                {renderInfoField("Téléphone", studentInfo?.telephone || null)}
                {renderInfoField(
                  "Date de naissance",
                  studentInfo?.date_naissance
                    ? new Date(studentInfo.date_naissance).toLocaleDateString(
                        "fr-FR"
                      )
                    : null
                )}
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations académiques
              </h3>
              <dl className="divide-y divide-gray-200">
                {renderInfoField("Établissement", academicInfo?.etablissement)}
                {renderInfoField("Niveau", academicInfo?.niveau)}
                {renderInfoField(
                  "N° Carte Étudiant",
                  academicInfo?.numero_carte_etudiant
                )}
                {renderInfoField(
                  "Adresse",
                  studentInfo?.adresse
                    ? `${studentInfo.adresse}, ${studentInfo.code_postal} ${studentInfo.ville}`
                    : null
                )}
              </dl>
            </div>
          </div>
        )}

        {activeTab === "medical" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {renderTextAreaField(
                "Antécédents Médicaux",
                "antecedentsMedicaux",
                fichePatient.antecedentsMedicaux
              )}
              {renderTextAreaField(
                "Antécédents Psychologiques",
                "antecedentsPsychologiques",
                fichePatient.antecedentsPsychologiques
              )}
            </div>
            <div>
              {renderInputField(
                "Allergies",
                "allergies",
                fichePatient.allergies
              )}
              {renderTextAreaField(
                "Médicaments Actuels",
                "medicamentsActuels",
                fichePatient.medicamentsActuels
              )}
              {renderTextAreaField(
                "Traitements en Cours",
                "traitementsEnCours",
                fichePatient.traitementsEnCours
              )}
            </div>
          </div>
        )}

        {activeTab === "mental" && (
          <>
            {renderTextAreaField(
              "Symptômes Actuels",
              "symptomesActuels",
              fichePatient.symptomesActuels
            )}
            {renderTextAreaField(
              "Objectifs de la Thérapie",
              "objectifsTherapie",
              fichePatient.objectifsTherapie
            )}
            {renderTextAreaField(
              "Notes du Psychologue",
              "notesPsychologue",
              fichePatient.notesPsychologue
            )}
          </>
        )}

        {activeTab === "history" && (
          <div>
            {renderTextAreaField(
              "Résumé des Consultations",
              "historiqueConsultations",
              fichePatient.historiqueConsultations
            )}
          </div>
        )}

        {/* Bouton de sauvegarde uniquement */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={saveData}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md font-medium text-sm shadow-sm"
          >
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>
    </div>
  );
}
