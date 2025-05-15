"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Video,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import VideoCall from "./VideoCall";
import PrivatePatientFile from "./fichePatient/PrivatePatientFile";
import {
  PatientRecord,
  ConsultationStatus,
  TypeConsultation,
  EtudiantInfo as PatientEtudiantInfo,
  FichePatient,
} from "../(mvc)/types/patient";
import { RoleEnum } from "../(mvc)/types";

interface RendezVous {
  id: number;
  id_psychologue: number;
  id_utilisateur: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  statut: string;
  createdAt: string;
  updatedAt: string;
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
}

interface GestionRendezVousProps {
  id_psychologue: number;
}

export default function GestionRendezVous({
  id_psychologue,
}: GestionRendezVousProps) {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConsultationId, setSelectedConsultationId] = useState<
    number | null
  >(null);
  const [selectedEtudiantId, setSelectedEtudiantId] = useState<number | null>(
    null
  );
  const [activeConsultation, setActiveConsultation] = useState(false);
  const [patientData, setPatientData] = useState<PatientRecord | null>(null);
  const [privatePatientData, setPrivatePatientData] =
    useState<PatientRecord | null>(null);
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const rdvDate = new Date(dateString);
    return (
      today.getFullYear() === rdvDate.getFullYear() &&
      today.getMonth() === rdvDate.getMonth() &&
      today.getDate() === rdvDate.getDate()
    );
  };

  const isPastDate = (dateString: string) => {
    const today = new Date();
    const rdvDate = new Date(dateString);
    today.setHours(0, 0, 0, 0); // Réinitialiser à minuit
    rdvDate.setHours(0, 0, 0, 0); // Réinitialiser à minuit
    return rdvDate < today;
  };

  const fetchPatientData = async (etudiantId: number) => {
    try {
      const etudiantResponse = await fetch(`/api/users/${etudiantId}`);
      if (!etudiantResponse.ok)
        throw new Error(
          "Erreur lors de la récupération des données de l'étudiant"
        );

      const etudiantData = await etudiantResponse.json();

      let fichePatient = null;
      try {
        const ficheResponse = await fetch(`/api/FichePatient/${etudiantId}`);
        if (ficheResponse.ok) fichePatient = await ficheResponse.json();
      } catch (ficheErr) {
        console.warn("Aucune fiche patient existante trouvée:", ficheErr);
      }

      const currentRdv = rendezVous.find(
        (rdv) => rdv.id === selectedConsultationId
      );

      const patientRecord: PatientRecord = {
        id: crypto.randomUUID(),
        etudiantId: etudiantId,
        psychologueId: id_psychologue,
        status: "IN_PROGRESS" as ConsultationStatus,
        type: (currentRdv?.type === "en ligne"
          ? "ONLINE"
          : "IN_PERSON") as TypeConsultation,
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
        notes: null,
        summary: null,
        roomId: `consultation-${selectedConsultationId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        fichePatientId: fichePatient?.id || null,
        rendezVousId: selectedConsultationId?.toString() || "",
        etudiant: {
          id_etudiant: etudiantId,
          numero_carte_etudiant: etudiantData.numero_carte_etudiant || "",
          niveau: etudiantData.niveau || "",
          etablissement: etudiantData.etablissement || "",
          utilisateur: {
            id: etudiantData.utilisateur?.id || 0,
            nom: etudiantData.utilisateur?.nom || "",
            prenom: etudiantData.utilisateur?.prenom || "",
            email: etudiantData.utilisateur?.email || "",
            mot_de_passe: etudiantData.utilisateur?.mot_de_passe || "",
            date_inscription:
              etudiantData.utilisateur?.date_inscription || new Date(),
            date_naissance: etudiantData.utilisateur?.date_naissance || null,
            adresse: etudiantData.utilisateur?.adresse || null,
            ville: etudiantData.utilisateur?.ville || null,
            code_postal: etudiantData.utilisateur?.code_postal || null,
            telephone: etudiantData.utilisateur?.telephone || null,
            role: etudiantData.utilisateur?.role || RoleEnum.ETUDIANT,
            civilite: etudiantData.utilisateur?.civilite || "M",
            statut: etudiantData.utilisateur?.statut || false,
            avatar: etudiantData.utilisateur?.avatar || null,
          },
        },
        fichePatient: fichePatient,
      };

      setPatientData(patientRecord);
      setPrivatePatientData(patientRecord);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les données du patient");
    }
  };

  const fetchRendezVous = async () => {
    try {
      const response = await fetch(
        `/api/rendezvous/psychologue/${id_psychologue}`
      );
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des rendez-vous");

      const data = await response.json();
      console.log("Données brutes de l'API:", data); // Log des données brutes

      const dataArray = Array.isArray(data) ? data : data.data || [];
      if (!Array.isArray(dataArray)) {
        console.error("Expected an array but received:", dataArray);
        return;
      }

      const rendezVousArray = dataArray.map((rdv) => {
        console.log("Rendez-vous mappé:", rdv); // Log de chaque rendez-vous
        return {
          id: rdv.id,
          id_psychologue: rdv.psychologue?.id_psychologue,
          id_utilisateur: rdv.utilisateur?.id,
          date: rdv.date,
          heure_debut: rdv.heure_debut,
          heure_fin: rdv.heure_fin,
          type: rdv.type,
          statut: rdv.statut,
          createdAt: rdv.createdAt || rdv.date, // Utiliser createdAt si disponible
          updatedAt: rdv.updatedAt || rdv.date, // Utiliser updatedAt si disponible
          utilisateur: rdv.utilisateur,
        };
      });

      setRendezVous(rendezVousArray);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    if (id_psychologue) fetchRendezVous();
  }, [id_psychologue]);

  const handleUpdateStatut = async (id: number, statut: string) => {
    try {
      const response = await fetch(`/api/rendezvous/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la mise à jour du statut"
        );
      }

      const result = await response.json();

      setRendezVous((prev) =>
        prev.map((rdv) =>
          rdv.id === id
            ? { ...rdv, statut, updatedAt: new Date().toISOString() }
            : rdv
        )
      );

      if (statut === "confirmé") {
        const rdv = rendezVous.find((r) => r.id === id);
        if (!rdv) throw new Error("Rendez-vous non trouvé");

        const datePart = new Date(rdv.date).toISOString().split("T")[0];
        const startTime = new Date(`${datePart}T${rdv.heure_debut}Z`);
        const endTime = new Date(`${datePart}T${rdv.heure_fin}Z`);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          throw new Error("Format de date ou d'heure invalide");
        }

        const etudiantResponse = await fetch(
          `/api/etudiants/by-utilisateur/${rdv.id_utilisateur}`
        );
        if (!etudiantResponse.ok) {
          const errorData = await etudiantResponse.json();
          throw new Error(errorData.error || "Étudiant non trouvé");
        }
        const etudiantData = await etudiantResponse.json();
        const etudiantId = etudiantData.id_etudiant;

        const consultationData = {
          etudiantId,
          psychologueId: rdv.id_psychologue,
          status: "CONFIRMED" as ConsultationStatus,
          type:
            rdv.type === "en ligne"
              ? "ONLINE"
              : ("IN_PERSON" as TypeConsultation),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes: null,
          summary: null,
          roomId: `consultation-${rdv.id}`,
          rendezVousId: rdv.id.toString(),
        };

        // Check if consultation already exists
        const checkResponse = await fetch(
          `/api/consultations/${rdv.id}`
        );
        let consultationExists = false;
        let existingConsultationId = null;
        if (checkResponse.ok) {
          const consultations = await checkResponse.json();
          if (Array.isArray(consultations) && consultations.length > 0) {
            consultationExists = true;
            existingConsultationId = consultations[0].id;
          }
        }

        let consultationResponse;
        if (consultationExists && existingConsultationId) {
          consultationResponse = await fetch(
            `/api/consultations/${existingConsultationId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(consultationData),
            }
          );
        } else {
          consultationResponse = await fetch("/api/consultations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(consultationData),
          });
        }

        if (!consultationResponse.ok) {
          const errorData = await consultationResponse.json();
          throw new Error(
            errorData.error ||
              "Erreur lors de la création/mise à jour de la consultation"
          );
        }

        const consultationResult = await consultationResponse.json();
        console.log("Consultation créée/mise à jour:", consultationResult);

        alert(
          result.emailSent
            ? "Rendez-vous confirmé, consultation enregistrée et email envoyé."
            : "Rendez-vous confirmé et consultation enregistrée."
        );
      } else if (statut === "rejeté") {
        alert("Rendez-vous rejeté.");
      }
    } catch (err) {
      console.error("Erreur dans handleUpdateStatut:", err);
      alert(
        `Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`
      );
    }
  };

  const handleStartConsultation = async (rdvId: number, etudiantId: number) => {
    setSelectedConsultationId(rdvId);
    setSelectedEtudiantId(etudiantId);
    setActiveConsultation(true);
    await fetchPatientData(etudiantId);
  };

  const handleSavePatientData = async () => {
    if (!patientData || !selectedConsultationId) return;

    try {
      const requestBody = {
        etudiantId: patientData.etudiantId,
        antecedentsMedicaux:
          patientData.fichePatient?.antecedentsMedicaux || "",
        antecedentsPsychologiques:
          patientData.fichePatient?.antecedentsPsychologiques || "",
        allergies: patientData.fichePatient?.allergies || "",
        medicamentsActuels: patientData.fichePatient?.medicamentsActuels || "",
        traitementsEnCours: patientData.fichePatient?.traitementsEnCours || "",
        symptomesActuels: patientData.fichePatient?.symptomesActuels || "",
        objectifsTherapie: patientData.fichePatient?.objectifsTherapie || "",
        notesPsychologue: patientData.fichePatient?.notesPsychologue || "",
        historiqueConsultations:
          patientData.fichePatient?.historiqueConsultations || "",
      };

      let ficheExists = false;
      try {
        const checkResponse = await fetch(
          `/api/FichePatient/${patientData.etudiantId}`
        );
        ficheExists = checkResponse.ok;
      } catch (checkErr) {
        console.warn("Error checking if fiche exists:", checkErr);
        ficheExists = false;
      }

      let createResponse;
      if (ficheExists) {
        createResponse = await fetch(
          `/api/FichePatient/${patientData.etudiantId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );
      } else {
        createResponse = await fetch(`/api/FichePatient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      }

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(
          errorData.message || "Error creating/updating patient file"
        );
      }

      alert("Dossier patient enregistré avec succès");
    } catch (error) {
      console.error("Error:", error);
      setError("Une erreur est survenue lors de l'enregistrement");
    }
  };

  const handleUpdatePatientStatus = async (status: ConsultationStatus) => {
    if (!patientData) return;

    const updatedData: PatientRecord = {
      ...patientData,
      status,
      updatedAt: new Date(),
    };

    setPatientData(updatedData);

    if (status === "COMPLETED") {
      setTimeout(() => {
        setSelectedConsultationId(null);
        setSelectedEtudiantId(null);
        setActiveConsultation(false);
        setPatientData(null);
        setPrivatePatientData(null);
        router.refresh();
      }, 1500);
    }
  };

  const rendezVousEnAttente = rendezVous.filter(
    (rdv) => rdv.statut === "en attente"
  );
  const rendezVousConfirmes = rendezVous.filter(
    (rdv) => rdv.statut === "confirmé" && !isPastDate(rdv.date)
  );
  const rendezVousRejetes = rendezVous.filter((rdv) => rdv.statut === "rejeté");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmé":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" /> Confirmé
          </Badge>
        );
      case "en attente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" /> En attente
          </Badge>
        );
      case "rejeté":
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" /> Rejeté
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Rendez-vous
        </h1>
        <p className="text-gray-600 mt-2">
          Consultez et gérez vos consultations avec vos patients
        </p>
      </div>

      {/* Demandes en attente */}
      <section>
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-lg font-semibold">Demandes en attente</span>
              <Badge variant="secondary" className="px-2 py-1">
                {rendezVousEnAttente.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rendezVousEnAttente.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune demande en attente</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rendezVousEnAttente.map((rdv) => (
                  <Card
                    key={rdv.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-900">
                          {rdv.utilisateur?.prenom} {rdv.utilisateur?.nom}
                        </h3>
                        {getStatusBadge(rdv.statut)}
                      </div>

                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(rdv.date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {rdv.heure_debut} - {rdv.heure_fin}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="capitalize">{rdv.type}</span>
                        </div>
                        {rdv.utilisateur?.telephone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{rdv.utilisateur.telephone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          className="flex-1"
                          onClick={() => handleUpdateStatut(rdv.id, "confirmé")}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accepter
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleUpdateStatut(rdv.id, "rejeté")}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Rendez-vous confirmés */}
      <section>
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-lg font-semibold">Rendez-vous à venir</span>
              <Badge variant="secondary" className="px-2 py-1">
                {rendezVousConfirmes.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rendezVousConfirmes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun rendez-vous confirmé à venir</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rendezVousConfirmes.map((rdv) => (
                  <Card
                    key={rdv.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-900">
                          {rdv.utilisateur?.prenom} {rdv.utilisateur?.nom}
                        </h3>
                        {getStatusBadge(rdv.statut)}
                      </div>

                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(rdv.date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {rdv.heure_debut} - {rdv.heure_fin}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="capitalize">{rdv.type}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-6">
                        <Button
                          className="w-full"
                          onClick={() =>
                            handleStartConsultation(rdv.id, rdv.id_utilisateur)
                          }
                          disabled={!isToday(rdv.date)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Commencer
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleUpdateStatut(rdv.id, "rejeté")}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Rendez-vous annulés */}
      <section>
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-lg font-semibold">Rendez-vous annulés</span>
              <Badge variant="secondary" className="px-2 py-1">
                {rendezVousRejetes.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rendezVousRejetes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun rendez-vous annulé</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rendezVousRejetes.map((rdv) => (
                  <Card
                    key={rdv.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-900">
                          {rdv.utilisateur?.prenom} {rdv.utilisateur?.nom}
                        </h3>
                        {getStatusBadge(rdv.statut)}
                      </div>

                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(rdv.date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {rdv.heure_debut} - {rdv.heure_fin}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="capitalize">{rdv.type}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Consultation en cours */}
      {activeConsultation && selectedConsultationId && selectedEtudiantId && (
        <Card className="border-t-4 border-indigo-500 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                Consultation en cours
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedConsultationId(null);
                  setSelectedEtudiantId(null);
                  setActiveConsultation(false);
                  setPatientData(null);
                  setPrivatePatientData(null);
                  router.refresh();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <VideoCall
                  roomId={selectedConsultationId}
                  userId={id_psychologue}
                  etudiantId={selectedEtudiantId ?? 0}
                  psychologueId={id_psychologue}
                  isPsychologist={true}
                  isEtudiant={false}
                  userRole="psychologist"
                  onEndCall={() => {
                    setSelectedConsultationId(null);
                    setSelectedEtudiantId(null);
                    setActiveConsultation(false);
                    setPatientData(null);
                    setPrivatePatientData(null);
                    router.refresh();
                  }}
                />
              </div>

              <div className="border rounded-lg p-4">
                {privatePatientData && (
                  <PrivatePatientFile
                    patientData={privatePatientData}
                    onDataChange={(data) => setPrivatePatientData(data)}
                    onSave={handleSavePatientData}
                    onUpdateStatus={handleUpdatePatientStatus}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
