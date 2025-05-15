"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../../../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import { RoleEnum } from "../../../../../(mvc)/types/patient";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  X,
  Check,
  FileText,
  History,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import PrivatePatientFile from "../../../../../components/fichePatient/PrivatePatientFile";
import VideoCall from "../../../../../components/VideoCall";
import {
  ConsultationStatus,
  FichePatient as FichePatientType,
  EtudiantInfo,
} from "../../../../../(mvc)/types/patient";

interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe?: string;
  date_inscription?: Date;
  date_naissance: Date | null;
  adresse: string | null;
  ville: string | null;
  code_postal: string | null;
  telephone: string | null;
  avatar?: string | null;
  civilite: "M" | "Mme";
  role: string;
  statut: string;

  psychologue?: {
    id_psychologue: number;
  };
}

interface Etudiant {
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
    telephone?: string | null;
    avatar?: string | null;
    civilite: "M" | "Mme";
    date_naissance?: Date | null;
    adresse?: string | null;
    ville?: string | null;
    code_postal?: string | null;
    role: string;
    statut: string;
  };
}

interface FichePatient {
  id: string;
  etudiantId: number;
  createdAt: Date;
  updatedAt: Date;
  antecedentsMedicaux?: string | null;
  antecedentsPsychologiques?: string | null;
  allergies?: string | null;
  medicamentsActuels?: string | null;
  traitementsEnCours?: string | null;
  symptomesActuels?: string | null;
  objectifsTherapie?: string | null;
  notesPsychologue?: string | null;
  historiqueConsultations?: string | null;
}

interface Consultation {
  id: number;
  etudiantId: number;
  psychologueId: number;
  status: ConsultationStatus;
  type: "EN_LIGNE" | "PRESENTIEL";
  startTime: string;
  endTime: string;
  notes: string | null;
  summary: string | null;
  roomId: number | null;
  createdAt: string;
  updatedAt: string;
  fichePatientId: string | null;
  rendezVousId: number;
  etudiant: Etudiant;
  fichePatient: FichePatient | null;
  rendezVous: {
    id: number;
    date: string;
    heure_debut: string;
    heure_fin: string;
    type: string;
    statut: string;
  };
}

const defaultFichePatient: FichePatient = {
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

const defaultConsultation: Consultation = {
  id: 0,
  etudiantId: 0,
  psychologueId: 0,
  status: "CONFIRMED",
  type: "EN_LIGNE",
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  notes: null,
  summary: null,
  roomId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fichePatientId: null,
  rendezVousId: 0,
  etudiant: {
    id_etudiant: 0,
    numero_carte_etudiant: "",
    niveau: "",
    etablissement: "",
    utilisateur: {
      id: 0,
      nom: "",
      prenom: "",
      email: "",
      mot_de_passe: "",
      date_inscription: new Date(),
      telephone: null,
      avatar: null,
      civilite: "M",
      date_naissance: null,
      adresse: null,
      ville: null,
      code_postal: null,
      role: "ETUDIANT",
      statut: "ACTIVE",
    },
  },
  fichePatient: defaultFichePatient,
  rendezVous: {
    id: 0,
    date: new Date().toISOString(),
    heure_debut: "",
    heure_fin: "",
    type: "",
    statut: "",
  },
};

// Helper function to convert base64 to Buffer
const base64ToBuffer = (base64: string | null | undefined): Buffer | null => {
  if (!base64) return null;
  try {
    return Buffer.from(base64, "base64");
  } catch (error) {
    console.error("Error converting base64 to Buffer:", error);
    return null;
  }
};

export default function ConsultationPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState({ user: true, consultations: true });
  const [error, setError] = useState("");
  const [selectedConsultationId, setSelectedConsultationId] = useState<
    number | null
  >(null);
  const [selectedEtudiantId, setSelectedEtudiantId] = useState<number | null>(
    null
  );
  const [activeConsultation, setActiveConsultation] = useState(false);
  const [patientData, setPatientData] = useState<Consultation | null>(null);
  const [completedConsultations, setCompletedConsultations] = useState<
    Consultation[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        console.log("Fetching user data for userId:", userId);
        if (!userId) throw new Error("Utilisateur non authentifié.");
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération.");
        const data = await response.json();
        console.log("User data fetched:", data);
        setUserData(data.user || data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        router.push("/auth/login");
      } finally {
        setLoading((prev) => ({ ...prev, user: false }));
      }
    };
    fetchUserData();
  }, [router]);

  const fetchConsultations = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Utilisateur non authentifié.");

      console.log("Fetching consultations for psychologist ID:", userId);

      const response = await fetch(`/api/consultations/psychologue/${userId}`);
      console.log("API response status:", response.status);

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data = await response.json();
      console.log("Raw API response data:", data);

      const dataArray = Array.isArray(data) ? data : data.data || [];
      console.log("Processed data array:", dataArray);

      const validConsultations = dataArray
        .map((consult: any) => {
          console.log("Processing consultation:", consult);
          const startTime = new Date(consult.startTime);
          const endTime = new Date(consult.endTime);
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            console.warn(
              "Invalid startTime or endTime for consultation:",
              consult
            );
            return null;
          }
          return {
            id: consult.id,
            etudiantId: consult.etudiantId,
            psychologueId: consult.psychologueId,
            status: consult.status,
            type: consult.type,
            startTime: consult.startTime,
            endTime: consult.endTime,
            notes: consult.notes ?? null,
            summary: consult.summary ?? null,
            roomId: consult.roomId ?? null,
            createdAt: consult.createdAt,
            updatedAt: consult.updatedAt,
            fichePatientId: consult.fichePatient?.id ?? null,
            rendezVousId: consult.rendezVousId,
            etudiant: {
              id_etudiant: consult.etudiant?.id_etudiant || 0,
              numero_carte_etudiant:
                consult.etudiant?.numero_carte_etudiant || "",
              niveau: consult.etudiant?.niveau || "",
              etablissement: consult.etudiant?.etablissement || "",
              utilisateur: {
                id: consult.etudiant?.utilisateur?.id || consult.etudiantId,
                nom: consult.etudiant?.utilisateur?.nom || "Inconnu",
                prenom: consult.etudiant?.utilisateur?.prenom || "Inconnu",
                email: consult.etudiant?.utilisateur?.email || "",
                mot_de_passe: consult.etudiant?.utilisateur?.mot_de_passe || "",
                date_inscription:
                  consult.etudiant?.utilisateur?.date_inscription || new Date(),
                telephone: consult.etudiant?.utilisateur?.telephone ?? null,
                avatar: consult.etudiant?.utilisateur?.avatar ?? null,
                civilite: consult.etudiant?.utilisateur?.civilite || "M",
                date_naissance:
                  consult.etudiant?.utilisateur?.date_naissance ?? null,
                adresse: consult.etudiant?.utilisateur?.adresse ?? null,
                ville: consult.etudiant?.utilisateur?.ville ?? null,
                code_postal: consult.etudiant?.utilisateur?.code_postal ?? null,
                role: consult.etudiant?.utilisateur?.role || "ETUDIANT",
                statut: consult.etudiant?.utilisateur?.statut || "ACTIVE",
              },
            },
            fichePatient: consult.fichePatient
              ? {
                  ...consult.fichePatient,
                  createdAt: new Date(consult.fichePatient.createdAt),
                  updatedAt: new Date(consult.fichePatient.updatedAt),
                }
              : null,
            rendezVous: {
              id: consult.rendezVous?.id || consult.rendezVousId,
              date: consult.rendezVous?.date || consult.startTime,
              heure_debut: consult.rendezVous?.heure_debut || "",
              heure_fin: consult.rendezVous?.heure_fin || "",
              type: consult.rendezVous?.type || consult.type,
              statut: consult.rendezVous?.statut || "",
            },
          };
        })
        .filter((consult: Consultation) => {
          if (consult === null) return false;
          if (!consult.etudiantId) {
            console.warn(
              "Consultation filtered out due to missing etudiantId:",
              consult
            );
          }
          return consult.etudiantId > 0;
        });

      console.log("Valid consultations:", validConsultations);
      setConsultations(validConsultations);
    } catch (err) {
      console.error("Erreur lors de la récupération des consultations:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading((prev) => ({ ...prev, consultations: false }));
    }
  };

  useEffect(() => {
    if (userData?.psychologue?.id_psychologue) {
      fetchConsultations();
    }
  }, [userData]);

  const fetchPatientData = async (
    etudiantId: number,
    consultationId: number
  ) => {
    try {
      const [etudiantResponse, consultationResponse, ficheResponse] =
        await Promise.all([
          fetch(`/api/etudiants/by-utilisateur/${etudiantId}`),
          fetch(`/api/consultations/${consultationId}`),
          fetch(`/api/FichePatient/${etudiantId}`),
        ]);

      if (!etudiantResponse.ok) {
        console.log("Etudiant response status:", etudiantResponse.status);
        console.log("Etudiant response text:", await etudiantResponse.text());
        throw new Error(
          "Erreur lors de la récupération des données de l'étudiant"
        );
      }

      let consultationData;
      if (!consultationResponse.ok) {
        console.log(
          "Consultation response status:",
          consultationResponse.status
        );
        console.log(
          "Consultation response text:",
          await consultationResponse.text()
        );
        // Si la consultation n'est pas trouvée, on utilise defaultConsultation
        if (
          consultationResponse.status === 400 ||
          consultationResponse.status === 404
        ) {
          console.warn(
            "Consultation non trouvée, utilisation des valeurs par défaut"
          );
          consultationData = { success: true, data: defaultConsultation };
        } else {
          throw new Error("Erreur lors de la récupération de la consultation");
        }
      } else {
        consultationData = await consultationResponse.json();
      }

      let ficheData;
      if (!ficheResponse.ok) {
        console.log("Fiche response status:", ficheResponse.status);
        console.log("Fiche response text:", await ficheResponse.text());
        if (ficheResponse.status === 404) {
          // Créer une nouvelle fiche patient si elle n'existe pas
          console.log(
            "Fiche patient non trouvée, création d'une nouvelle fiche..."
          );
          const newFicheResponse = await fetch(`/api/FichePatient`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              etudiantId: etudiantId,
              antecedentsMedicaux: null,
              antecedentsPsychologiques: null,
              allergies: null,
              medicamentsActuels: null,
              traitementsEnCours: null,
              symptomesActuels: null,
              objectifsTherapie: null,
              notesPsychologue: null,
              historiqueConsultations: null,
            }),
          });

          if (!newFicheResponse.ok) {
            console.error(
              "Erreur lors de la création de la fiche patient:",
              await newFicheResponse.text()
            );
            ficheData = null;
          } else {
            ficheData = await newFicheResponse.json();
            console.log("Nouvelle fiche patient créée:", ficheData);
          }
        } else {
          throw new Error("Erreur lors de la récupération de la fiche patient");
        }
      } else {
        ficheData = await ficheResponse.json();
      }

      const etudiantData = await etudiantResponse.json();

      console.log("Consultation data:", consultationData);

      if (!consultationData.success || !consultationData.data) {
        console.warn(
          "Consultation non trouvée, utilisation des valeurs par défaut"
        );
        consultationData = { success: true, data: defaultConsultation };
      }

      const consult = consultationData.data;
      const patientRecord: Consultation = {
        id: consult.id,
        etudiantId: consult.etudiantId,
        psychologueId: consult.psychologueId,
        status: consult.status,
        type: consult.type,
        startTime: consult.startTime,
        endTime: consult.endTime,
        notes: consult.notes ?? null,
        summary: consult.summary ?? null,
        roomId: consult.roomId ?? null,
        createdAt: consult.createdAt,
        updatedAt: consult.updatedAt,
        fichePatientId: ficheData?.id ?? null,
        rendezVousId: consult.rendezVousId,
        etudiant: {
          id_etudiant: etudiantData.id_etudiant || 0,
          numero_carte_etudiant: etudiantData.numero_carte_etudiant || "",
          niveau: etudiantData.niveau || "",
          etablissement: etudiantData.etablissement || "",
          utilisateur: {
            id: etudiantData.utilisateur?.id || etudiantId,
            nom: etudiantData.utilisateur?.nom || "Inconnu",
            prenom: etudiantData.utilisateur?.prenom || "Inconnu",
            email: etudiantData.utilisateur?.email || "",
            mot_de_passe: etudiantData.utilisateur?.mot_de_passe || "",
            date_inscription:
              etudiantData.utilisateur?.date_inscription || new Date(),
            telephone: etudiantData.utilisateur?.telephone ?? null,
            avatar: etudiantData.utilisateur?.avatar ?? null,
            civilite: etudiantData.utilisateur?.civilite || "M",
            date_naissance: etudiantData.utilisateur?.date_naissance ?? null,
            adresse: etudiantData.utilisateur?.adresse ?? null,
            ville: etudiantData.utilisateur?.ville ?? null,
            code_postal: etudiantData.utilisateur?.code_postal ?? null,
            role: etudiantData.utilisateur?.role || "ETUDIANT",
            statut: etudiantData.utilisateur?.statut || "ACTIVE",
          },
        },
        fichePatient: ficheData
          ? {
              ...ficheData,
              createdAt: new Date(ficheData.createdAt),
              updatedAt: new Date(ficheData.updatedAt),
            }
          : defaultFichePatient,
        rendezVous: {
          id: consult.rendezVous?.id || consultationId,
          date: consult.rendezVous?.date || consult.startTime,
          heure_debut: consult.rendezVous?.heure_debut || "",
          heure_fin: consult.rendezVous?.heure_fin || "",
          type: consult.rendezVous?.type || consult.type,
          statut: consult.rendezVous?.statut || "",
        },
      };

      setPatientData(patientRecord);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError(
        "Impossible de charger les données du patient: " +
          (err instanceof Error ? err.message : "Erreur inconnue")
      );
    }
  };

  const handleStartConsultation = async (consult: Consultation) => {
    try {
      if (!consult.rendezVousId) {
        throw new Error("ID de rendez-vous manquant");
      }

      console.log("Starting consultation:", consult);

      setSelectedConsultationId(consult.rendezVousId);
      setSelectedEtudiantId(consult.etudiantId);
      setActiveConsultation(true);

      // Mettre à jour le statut
      const requestBody = {
        status: "IN_PROGRESS",
      };
      console.log("Request body sent:", requestBody);

      const updateResponse = await fetch(
        `/api/consultations/${consult.rendezVousId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Response status:", updateResponse.status);
      console.log("Response text:", await updateResponse.text());

      if (!updateResponse.ok) {
        throw new Error("Échec de la mise à jour du statut");
      }

      // Récupérer les données mises à jour
      await fetchPatientData(consult.etudiantId, consult.rendezVousId);

      setConsultations((prev) =>
        prev.map((c) =>
          c.id === consult.id ? { ...c, status: "IN_PROGRESS" } : c
        )
      );
    } catch (error) {
      console.error("Erreur lors du démarrage de la consultation:", error);
      setError(
        `Erreur: ${error instanceof Error ? error.message : "Inconnue"}`
      );
      setSelectedConsultationId(null);
      setSelectedEtudiantId(null);
      setActiveConsultation(false);
      setPatientData(null);
    }
  };

  const handleSavePatientData = async () => {
    if (!patientData || !patientData.fichePatient) return;
    try {
      const requestBody: FichePatient = {
        id: patientData.fichePatient.id || "",
        etudiantId: patientData.etudiantId,
        antecedentsMedicaux:
          patientData.fichePatient.antecedentsMedicaux ?? null,
        antecedentsPsychologiques:
          patientData.fichePatient.antecedentsPsychologiques ?? null,
        allergies: patientData.fichePatient.allergies ?? null,
        medicamentsActuels: patientData.fichePatient.medicamentsActuels ?? null,
        traitementsEnCours: patientData.fichePatient.traitementsEnCours ?? null,
        symptomesActuels: patientData.fichePatient.symptomesActuels ?? null,
        objectifsTherapie: patientData.fichePatient.objectifsTherapie ?? null,
        notesPsychologue: patientData.fichePatient.notesPsychologue ?? null,
        historiqueConsultations:
          patientData.fichePatient.historiqueConsultations ?? null,
        createdAt: patientData.fichePatient.createdAt,
        updatedAt: new Date(),
      };

      const response = await fetch(
        `/api/FichePatient/${patientData.etudiantId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour de la fiche patient");

      const toastElem = document.createElement("div");
      toastElem.className =
        "fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center";
      toastElem.innerHTML =
        '<Check className="w-5 h-5 mr-2" /> Dossier patient enregistré avec succès';
      document.body.appendChild(toastElem);

      setTimeout(() => {
        document.body.removeChild(toastElem);
      }, 3000);
    } catch (error) {
      console.error("Error saving patient data:", error);
      setError("Erreur lors de l'enregistrement de la fiche patient");
    }
  };

  const handleUpdatePatientStatus = async (status: ConsultationStatus) => {
    if (!patientData || !selectedConsultationId) return;

    try {
      const response = await fetch(
        `/api/consultations/${selectedConsultationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour du statut");

      const updatedConsultation = {
        ...patientData,
        status,
        updatedAt: new Date().toISOString(),
      };
      setPatientData(updatedConsultation);

      if (status === "COMPLETED") {
        setCompletedConsultations((prev) => [...prev, updatedConsultation]);
        setTimeout(() => {
          setSelectedConsultationId(null);
          setSelectedEtudiantId(null);
          setActiveConsultation(false);
          setPatientData(null);
          router.refresh();
        }, 1500);
      }

      setConsultations((prev) =>
        prev.map((c) =>
          c.rendezVousId === selectedConsultationId ? { ...c, status } : c
        )
      );

      setError("");
    } catch (error) {
      console.error("Error updating patient status:", error);
      setError("Erreur lors de la mise à jour du statut de la consultation");
    }
  };

  const canStartConsultation = (consult: Consultation): boolean => {
    const now = new Date();
    const startTime = new Date(consult.startTime);
    const endTime = new Date(consult.endTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.warn("Invalid date for consultation:", consult);
      return false;
    }

    const bufferTime = 5 * 60 * 1000; // 5 minutes
    const isWithinTime =
      now >= new Date(startTime.getTime() - bufferTime) && now <= endTime;

    const result = consult.type === "EN_LIGNE" && isWithinTime;

    console.log("Can Start:", result, "Details:", {
      now,
      startTime,
      endTime,
      type: consult.type,
      isWithinTime,
    });

    return result;
  };

  const getTimeUntilConsultation = (consult: Consultation) => {
    const now = new Date();
    const startTime = new Date(consult.startTime);
    const diffMs = startTime.getTime() - now.getTime();
    if (diffMs <= 0) return "Maintenant";

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs > 24) {
      return `Dans ${Math.floor(diffHrs / 24)} jour(s)`;
    } else if (diffHrs > 0) {
      return `Dans ${diffHrs}h${diffMins}`;
    } else {
      return `Dans ${diffMins} min`;
    }
  };

  const sortConsultations = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    console.log("All consultations:", consultations);

    const pastConsultations = consultations.filter((consult) => {
      const consultDate = new Date(consult.startTime);
      const isPast = consultDate < today;
      console.log(
        `Consultation ${consult.id} isPast:`,
        isPast,
        consult.startTime,
        consult.status
      );
      return isPast;
    });

    const todayConsultations = consultations.filter((consult) => {
      const consultDate = new Date(consult.startTime);
      const isToday =
        consultDate.getFullYear() === today.getFullYear() &&
        consultDate.getMonth() === today.getMonth() &&
        consultDate.getDate() === today.getDate() &&
        ["CONFIRMED", "IN_PROGRESS", "PENDING"].includes(consult.status);
      console.log(
        `Consultation ${consult.id} isToday:`,
        isToday,
        consult.startTime,
        consult.status
      );
      return isToday;
    });

    const futureConsultations = consultations.filter((consult) => {
      const consultDate = new Date(consult.startTime);
      const isFuture =
        consultDate > today &&
        ["CONFIRMED", "PENDING"].includes(consult.status);
      console.log(
        `Consultation ${consult.id} isFuture:`,
        isFuture,
        consult.startTime,
        consult.status
      );
      return isFuture;
    });

    console.log("Past consultations:", pastConsultations);
    console.log("Today consultations:", todayConsultations);
    console.log("Future consultations:", futureConsultations);

    return {
      pastConsultations: pastConsultations.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ),
      todayConsultations: todayConsultations.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
      futureConsultations: futureConsultations.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading.user || loading.consultations)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
          <p className="text-xl font-medium text-gray-700">
            Chargement des consultations...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-6 text-red-600">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">
            Une erreur est survenue
          </h2>
          <p className="text-gray-600 text-center">{error}</p>
          <div className="mt-6">
            <Button
              className="w-full"
              onClick={() => {
                setError("");
                fetchConsultations();
              }}
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );

  if (!userData) return null;

  console.log("Current consultations state:", consultations);
  const { pastConsultations, todayConsultations, futureConsultations } =
    sortConsultations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card className="shadow-lg border-0 overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Espace Consultations
              </CardTitle>
              <p className="text-blue-100 mt-2 opacity-90">
                Gérez vos consultations avec vos étudiants
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              {userData && (
                <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                  <Avatar className="h-8 w-8 mr-2 border-2 border-white">
                    {userData.avatar ? (
                      <AvatarImage
                        src={`data:image/jpeg;base64,${userData.avatar}`}
                        alt={`${userData.prenom} ${userData.nom}`}
                      />
                    ) : (
                      <AvatarFallback className="bg-white text-blue-600 font-medium">
                        {userData.prenom.charAt(0)}
                        {userData.nom.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium">
                    {userData.prenom} {userData.nom}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!activeConsultation ? (
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b px-6">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-blue-50"
                >
                  Aujourd'hui{" "}
                  {todayConsultations.length > 0 && (
                    <Badge className="ml-2 bg-blue-600">
                      {todayConsultations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-blue-50"
                >
                  À venir{" "}
                  {futureConsultations.length > 0 && (
                    <Badge className="ml-2 bg-blue-600">
                      {futureConsultations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-blue-50"
                >
                  Historique{" "}
                  {pastConsultations.length + completedConsultations.length >
                    0 && (
                    <Badge className="ml-2 bg-blue-600">
                      {pastConsultations.length + completedConsultations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-gray-900">
                    Consultations d'aujourd'hui
                  </h2>
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>

                {todayConsultations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                    <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">
                      Aucune consultation programmée aujourd'hui
                    </p>
                    <p className="text-gray-500 mt-2">
                      Votre journée est libre. Total des consultations:{" "}
                      {consultations.length}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {todayConsultations.map((consult) => (
                      <Card
                        key={consult.id}
                        className="hover:shadow-md transition-shadow overflow-hidden border-0 shadow"
                      >
                        <div
                          className={`h-2 ${
                            canStartConsultation(consult)
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 mr-3 border">
                                {consult.etudiant.utilisateur.avatar ? (
                                  <AvatarImage
                                    src={`data:image/jpeg;base64,${consult.etudiant.utilisateur.avatar}`}
                                    alt={`${consult.etudiant.utilisateur.prenom} ${consult.etudiant.utilisateur.nom}`}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                                    {consult.etudiant.utilisateur.prenom.charAt(
                                      0
                                    )}
                                    {consult.etudiant.utilisateur.nom.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {consult.etudiant.utilisateur.prenom}{" "}
                                  {consult.etudiant.utilisateur.nom}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {consult.etudiant.utilisateur.email}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`${
                                canStartConsultation(consult)
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}
                            >
                              {canStartConsultation(consult) ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>{" "}
                                  Disponible
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" /> Confirmé
                                </>
                              )}
                            </Badge>
                          </div>

                          <div className="space-y-3 text-sm text-gray-600 mt-4">
                            <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">
                                {formatTime(consult.startTime)} -{" "}
                                {formatTime(consult.endTime)}
                              </span>
                              <Badge variant="outline" className="ml-auto">
                                {getTimeUntilConsultation(consult)}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 p-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span className="capitalize">
                                {consult.type === "EN_LIGNE"
                                  ? "Consultation vidéo"
                                  : "Rendez-vous en personne"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-6">
                            {consult.type === "EN_LIGNE" ? (
                              <Button
                                className={`w-full gap-2 ${
                                  canStartConsultation(consult)
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-200 text-gray-600 cursor-not-allowed"
                                }`}
                                onClick={() => {
                                  console.log(
                                    "Button clicked for consultation:",
                                    consult
                                  );
                                  handleStartConsultation(consult);
                                }}
                                disabled={!canStartConsultation(consult)}
                              >
                                {canStartConsultation(consult) ? (
                                  <>
                                    <Video className="h-4 w-4" />
                                    Rejoindre maintenant
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4" />
                                    Pas encore disponible
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                className="w-full gap-2 bg-gray-200 text-gray-600 cursor-not-allowed"
                                disabled
                              >
                                <MapPin className="h-4 w-4" />
                                Consultation en personne
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-gray-900">
                    Consultations à venir
                  </h2>
                </div>

                {futureConsultations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                    <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">
                      Aucune consultation programmée
                    </p>
                    <p className="text-gray-500 mt-2">
                      Votre agenda est vide pour le moment. Total des
                      consultations: {consultations.length}
                    </p>
                  </div>
                ) : (
                  <div>
                    {Array.from(
                      new Set(
                        futureConsultations.map((consult) =>
                          new Date(consult.startTime).toDateString()
                        )
                      )
                    ).map((date) => (
                      <div key={date} className="mb-8">
                        <div className="flex items-center mb-4">
                          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-medium text-gray-900">
                            {formatDate(date)}
                          </h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {futureConsultations
                            .filter(
                              (consult) =>
                                new Date(consult.startTime).toDateString() ===
                                date
                            )
                            .map((consult) => (
                              <Card
                                key={consult.id}
                                className="hover:shadow-md transition-shadow overflow-hidden border border-gray-100 shadow-sm"
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                      <Avatar className="h-10 w-10 mr-3 bg-blue-100">
                                        {consult.etudiant.utilisateur.avatar ? (
                                          <AvatarImage
                                            src={`data:image/jpeg;base64,${consult.etudiant.utilisateur.avatar}`}
                                            alt={`${consult.etudiant.utilisateur.prenom} ${consult.etudiant.utilisateur.nom}`}
                                          />
                                        ) : (
                                          <AvatarFallback className="text-blue-800 font-semibold">
                                            {consult.etudiant.utilisateur.prenom.charAt(
                                              0
                                            )}
                                            {consult.etudiant.utilisateur.nom.charAt(
                                              0
                                            )}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                      <div>
                                        <h3 className="font-medium text-gray-900">
                                          {consult.etudiant.utilisateur.prenom}{" "}
                                          {consult.etudiant.utilisateur.nom}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                          {consult.etudiant.utilisateur.email}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      À venir
                                    </Badge>
                                  </div>

                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                                      <span>
                                        {formatTime(consult.startTime)} -{" "}
                                        {formatTime(consult.endTime)}
                                      </span>
                                    </div>

                                    <div className="flex items-center">
                                      {consult.type === "EN_LIGNE" ? (
                                        <Video className="h-4 w-4 text-blue-600 mr-2" />
                                      ) : (
                                        <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                                      )}
                                      <span className="capitalize">
                                        {consult.type === "EN_LIGNE"
                                          ? "Consultation vidéo"
                                          : "Rendez-vous en personne"}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-gray-900">
                    Historique des consultations
                  </h2>
                </div>

                {pastConsultations.length === 0 &&
                completedConsultations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                    <History className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">
                      Aucun historique de consultation
                    </p>
                    <p className="text-gray-500 mt-2">
                      Les consultations terminées apparaîtront ici. Total des
                      consultations: {consultations.length}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...pastConsultations, ...completedConsultations]
                      .sort(
                        (a, b) =>
                          new Date(b.startTime).getTime() -
                          new Date(a.startTime).getTime()
                      )
                      .map((consult) => (
                        <Card
                          key={consult.id}
                          className="border border-gray-100 shadow-sm"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-10 w-10 bg-gray-100">
                                  {consult.etudiant.utilisateur.avatar ? (
                                    <AvatarImage
                                      src={`data:image/jpeg;base64,${consult.etudiant.utilisateur.avatar}`}
                                      alt={`${consult.etudiant.utilisateur.prenom} ${consult.etudiant.utilisateur.nom}`}
                                    />
                                  ) : (
                                    <AvatarFallback className="text-gray-800 font-semibold">
                                      {consult.etudiant.utilisateur.prenom.charAt(
                                        0
                                      )}
                                      {consult.etudiant.utilisateur.nom.charAt(
                                        0
                                      )}
                                    </AvatarFallback>
                                  )}
                                </Avatar>

                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {consult.etudiant.utilisateur.prenom}{" "}
                                    {consult.etudiant.utilisateur.nom}
                                  </h3>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(consult.startTime)} •{" "}
                                    {formatTime(consult.startTime)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center">
                                <Badge className="bg-gray-100 text-gray-800">
                                  Terminée
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2"
                                  // TODO: Implement report viewing
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">
                                    Voir le rapport
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              <div className="col-span-2 border-r border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="mr-4"
                        onClick={() => {
                          setSelectedConsultationId(null);
                          setSelectedEtudiantId(null);
                          setActiveConsultation(false);
                          setPatientData(null);
                        }}
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </Button>
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          {patientData?.etudiant.utilisateur.avatar ? (
                            <AvatarImage
                              src={`data:image/jpeg;base64,${patientData.etudiant.utilisateur.avatar}`}
                              alt={`${patientData.etudiant.utilisateur.prenom} ${patientData.etudiant.utilisateur.nom}`}
                            />
                          ) : (
                            <AvatarFallback className="bg-blue-100 text-blue-800 font-bold">
                              {patientData?.etudiant.utilisateur.prenom?.charAt(
                                0
                              )}
                              {patientData?.etudiant.utilisateur.nom?.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <h2 className="text-xl font-medium">
                          Consultation avec{" "}
                          {patientData?.etudiant.utilisateur.prenom}{" "}
                          {patientData?.etudiant.utilisateur.nom}
                        </h2>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleUpdatePatientStatus("CANCELLED")}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleUpdatePatientStatus("COMPLETED")}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Terminer
                      </Button>
                    </div>
                  </div>

                  {patientData?.type === "EN_LIGNE" && (
                    <div className="mb-6">
                      <VideoCall
                        roomId={
                          patientData.roomId != null
                            ? Number(patientData.roomId)
                            : patientData.rendezVousId
                        }
                        userId={userData.id}
                        userRole="psychologist"
                        etudiantId={patientData.etudiantId}
                        psychologueId={
                          userData.psychologue?.id_psychologue || 0
                        }
                        onEndCall={() => setActiveConsultation(false)}
                      />
                    </div>
                  )}

                  <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Informations patient
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">
                            Informations personnelles
                          </h3>
                          <dl className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Nom</dt>
                              <dd>
                                {patientData?.etudiant.utilisateur.civilite}{" "}
                                {patientData?.etudiant.utilisateur.prenom}{" "}
                                {patientData?.etudiant.utilisateur.nom}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Email</dt>
                              <dd>{patientData?.etudiant.utilisateur.email}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Téléphone</dt>
                              <dd>
                                {patientData?.etudiant.utilisateur.telephone ||
                                  "Non renseigné"}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">
                                Date de naissance
                              </dt>
                              <dd>
                                {patientData?.etudiant.utilisateur
                                  .date_naissance
                                  ? new Date(
                                      patientData.etudiant.utilisateur.date_naissance
                                    ).toLocaleDateString("fr-FR")
                                  : "Non renseignée"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">
                            Informations académiques
                          </h3>
                          <dl className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Établissement</dt>
                              <dd>
                                {patientData?.etudiant.etablissement ||
                                  "Non renseigné"}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Niveau</dt>
                              <dd>
                                {patientData?.etudiant.niveau ||
                                  "Non renseigné"}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">
                                N° Carte Étudiant
                              </dt>
                              <dd>
                                {patientData?.etudiant.numero_carte_etudiant ||
                                  "Non renseigné"}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Adresse</dt>
                              <dd className="text-right">
                                {patientData?.etudiant.utilisateur.adresse
                                  ? `${patientData.etudiant.utilisateur.adresse}, ${patientData.etudiant.utilisateur.code_postal} ${patientData.etudiant.utilisateur.ville}`
                                  : "Non renseignée"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="col-span-1 bg-gray-50 min-h-screen">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Dossier Patient</h2>
                    <Button size="sm" onClick={handleSavePatientData}>
                      Enregistrer
                    </Button>
                  </div>

                  {patientData && (
                    <PrivatePatientFile
                      patientData={{
                        id: patientData.id.toString(),
                        etudiantId: patientData.etudiantId,
                        psychologueId: patientData.psychologueId,
                        status: patientData.status,
                        type: patientData.type,
                        startTime: new Date(patientData.startTime),
                        endTime: new Date(patientData.endTime),
                        notes: patientData.notes ?? null,
                        summary: patientData.summary ?? null,
                        roomId:
                          patientData.roomId != null
                            ? String(patientData.roomId)
                            : String(patientData.rendezVousId),
                        createdAt: new Date(patientData.createdAt),
                        updatedAt: new Date(patientData.updatedAt),
                        fichePatientId: patientData.fichePatientId ?? null,
                        rendezVousId: patientData.rendezVousId.toString(),
                        etudiant: {
                          id_etudiant: patientData.etudiant.id_etudiant,
                          numero_carte_etudiant:
                            patientData.etudiant.numero_carte_etudiant,
                          niveau: patientData.etudiant.niveau,
                          etablissement: patientData.etudiant.etablissement,
                          utilisateur: {
                            id: patientData.etudiant.utilisateur.id,
                            nom: patientData.etudiant.utilisateur.nom,
                            prenom: patientData.etudiant.utilisateur.prenom,
                            email: patientData.etudiant.utilisateur.email,
                            telephone:
                              patientData.etudiant.utilisateur.telephone ??
                              null,
                            avatar:
                              patientData.etudiant.utilisateur.avatar ?? null,
                            civilite: patientData.etudiant.utilisateur.civilite,
                            date_naissance: patientData.etudiant.utilisateur
                              .date_naissance
                              ? new Date(
                                  patientData.etudiant.utilisateur.date_naissance
                                )
                              : null,
                            adresse:
                              patientData.etudiant.utilisateur.adresse ?? null,
                            ville:
                              patientData.etudiant.utilisateur.ville ?? null,
                            code_postal:
                              patientData.etudiant.utilisateur.code_postal ??
                              null,
                            role:
                              (patientData.etudiant?.utilisateur
                                ?.role as RoleEnum) || RoleEnum.ETUDIANT,
                            statut:
                              typeof patientData.etudiant?.utilisateur
                                ?.statut === "string"
                                ? patientData.etudiant?.utilisateur?.statut ===
                                  "ACTIVE"
                                : patientData.etudiant?.utilisateur?.statut ??
                                  true,
                          },
                        },
                        fichePatient: patientData.fichePatient
                          ? {
                              ...patientData.fichePatient,
                              antecedentsMedicaux:
                                patientData.fichePatient.antecedentsMedicaux ??
                                null,
                              antecedentsPsychologiques:
                                patientData.fichePatient
                                  .antecedentsPsychologiques ?? null,
                              allergies:
                                patientData.fichePatient.allergies ?? null,
                              medicamentsActuels:
                                patientData.fichePatient.medicamentsActuels ??
                                null,
                              traitementsEnCours:
                                patientData.fichePatient.traitementsEnCours ??
                                null,
                              symptomesActuels:
                                patientData.fichePatient.symptomesActuels ??
                                null,
                              objectifsTherapie:
                                patientData.fichePatient.objectifsTherapie ??
                                null,
                              notesPsychologue:
                                patientData.fichePatient.notesPsychologue ??
                                null,
                              historiqueConsultations:
                                patientData.fichePatient
                                  .historiqueConsultations ?? null,
                            }
                          : null,
                      }}
                      onDataChange={(data: Partial<FichePatientType>) =>
                        setPatientData((prev) =>
                          prev && prev.fichePatient
                            ? {
                                ...prev,
                                fichePatient: {
                                  ...prev.fichePatient,
                                  ...data,
                                  id: prev.fichePatient.id || data.id || "",
                                  createdAt:
                                    prev.fichePatient.createdAt ||
                                    data.createdAt ||
                                    new Date(),
                                  updatedAt: new Date(),
                                },
                              }
                            : prev
                        )
                      }
                      onSave={async () => {
                        await handleSavePatientData();
                      }}
                      onUpdateStatus={handleUpdatePatientStatus}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}