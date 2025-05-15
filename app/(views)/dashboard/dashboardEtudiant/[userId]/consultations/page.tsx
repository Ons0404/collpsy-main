"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
  Calendar,
  Clock,
  User,
  Video,
  AlertCircle,
  Star,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../../components/ui/dialog";
import { Label } from "../../../../../components/ui/label";
import Input from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import VideoCall from "../../../../../components/VideoCall";

interface Consultation {
  id: number;
  etudiantId: number;
  psychologueId: number;
  status: string;
  type: "EN_LIGNE" | "PRESENTIEL";
  startTime: string;
  endTime: string;
  roomId: number | null;
  createdAt: string;
  updatedAt: string;
  rendezVousId: number;
  psychologue: {
    utilisateur: {
      id: number;
      nom: string;
      prenom: string;
      email: string;
      civilite: "M" | "Mme";
    };
  };
  rendezVous: {
    id: number;
    date: string;
    heure_debut: string;
    heure_fin: string;
    type: string;
    statut: string;
  };
}

const ConsultationPage = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeConsultation, setActiveConsultation] =
    useState<Consultation | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [evaluation, setEvaluation] = useState({
    satisfaction: 0,
    empathie: 0,
    ecoute: 0,
    comprehension: 0,
    recommandation: 0,
    commentaires: "",
  });
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const userId = params.userId as string;
        if (!userId) throw new Error("Utilisateur non authentifié.");

        const response = await fetch(`/api/consultations/etudiant/${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Erreur HTTP: ${response.status} - ${
              errorData.error || "Unknown error"
            }`
          );
        }

        const data = await response.json();
        const dataArray = Array.isArray(data) ? data : data.data || [];
        const validConsultations = dataArray
          .map((consult: any) => ({
            id: consult.id,
            etudiantId: consult.etudiantId,
            psychologueId: consult.psychologueId,
            status: consult.status?.toUpperCase() || "PENDING",
            type: consult.type?.toUpperCase() || "EN_LIGNE",
            startTime: consult.startTime,
            endTime: consult.endTime,
            roomId: consult.roomId ?? consult.rendezVousId,
            createdAt: consult.createdAt || new Date().toISOString(),
            updatedAt: consult.updatedAt || new Date().toISOString(),
            rendezVousId: consult.rendezVous?.id || consult.rendezVousId,
            psychologue: {
              utilisateur: {
                id:
                  consult.psychologue?.utilisateur?.id || consult.psychologueId,
                nom:
                  consult.psychologue?.utilisateur?.nom ||
                  consult.psychologue?.nom ||
                  "Inconnu",
                prenom:
                  consult.psychologue?.utilisateur?.prenom ||
                  consult.psychologue?.prenom ||
                  "Inconnu",
                email: consult.psychologue?.utilisateur?.email || "",
                civilite: consult.psychologue?.utilisateur?.civilite || "M",
              },
            },
            rendezVous: {
              id: consult.rendezVous?.id || consult.rendezVousId,
              date: consult.rendezVous?.date || consult.startTime,
              heure_debut:
                consult.rendezVous?.heure_debut ||
                new Date(consult.startTime).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              heure_fin:
                consult.rendezVous?.heure_fin ||
                new Date(consult.endTime).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              type: consult.rendezVous?.type || consult.type,
              statut:
                consult.rendezVous?.statut?.toUpperCase() || consult.status,
            },
          }))
          .filter(
            (consult) =>
              consult.etudiantId > 0 && new Date(consult.startTime).getTime()
          );

        setConsultations(validConsultations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [params.userId]);

  useEffect(() => {
    const checkEvaluation = async () => {
      if (activeConsultation) {
        try {
          const response = await fetch(
            `/api/evaluations?consultationId=${activeConsultation.id}`
          );
          const evaluations = await response.json();
          setHasEvaluated(evaluations.length > 0);
        } catch (err) {
          console.error("Erreur lors de la vérification de l'évaluation:", err);
        }
      }
    };

    checkEvaluation();
  }, [activeConsultation]);

  const canStartConsultation = (consult: Consultation): boolean => {
    const now = new Date();
    const startTime = new Date(consult.startTime);
    const endTime = new Date(consult.endTime);
    const bufferMs = 5 * 60 * 1000;
    return (
      consult.status === "CONFIRMED" &&
      consult.type === "EN_LIGNE" &&
      now >= new Date(startTime.getTime() - bufferMs) &&
      now <= endTime
    );
  };

  const getTimeUntilConsultation = (consult: Consultation) => {
    const now = new Date();
    const startTime = new Date(consult.startTime);
    const endTime = new Date(consult.endTime);

    if (now > endTime) return "Terminé";
    if (now >= startTime) return "Maintenant";
    const diffMs = startTime.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs > 24) {
      return `Dans ${Math.floor(diffHrs / 24)} jour(s)`;
    } else if (diffHrs > 0) {
      return `Dans ${diffHrs}h${diffMins}m`;
    } else {
      return `Dans ${diffMins} min`;
    }
  };

  const sortConsultations = () => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    const pastConsultations = consultations.filter(
      (consult) =>
        new Date(consult.endTime) < now ||
        ["COMPLETED", "CANCELLED"].includes(consult.status)
    );

    const todayConsultations = consultations.filter(
      (consult) =>
        new Date(consult.startTime).toDateString() === today.toDateString() &&
        new Date(consult.endTime) >= now &&
        ["CONFIRMED", "IN_PROGRESS", "PENDING"].includes(consult.status)
    );

    const futureConsultations = consultations.filter(
      (consult) =>
        new Date(consult.startTime) > today &&
        ["CONFIRMED", "PENDING"].includes(consult.status)
    );

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

  const handleStartConsultation = (consult: Consultation) => {
    setActiveConsultation(consult);
  };

  const handleEndConsultation = () => {
    if (activeConsultation && !hasEvaluated) {
      setShowEvaluation(true);
    } else {
      setActiveConsultation(null);
    }
  };

  const handleEvaluationSubmit = async () => {
    if (!activeConsultation) return;

    try {
      const response = await fetch("/api/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: activeConsultation.id,
          etudiantId: activeConsultation.etudiantId,
          ...evaluation,
        }),
      });

      if (!response.ok)
        throw new Error("Échec de l'enregistrement de l'évaluation");

      setHasEvaluated(true);
      setShowEvaluation(false);
      setActiveConsultation(null);
      setEvaluation({
        satisfaction: 0,
        empathie: 0,
        ecoute: 0,
        comprehension: 0,
        recommandation: 0,
        commentaires: "",
      });
    } catch (error) {
      setError("Erreur lors de l'enregistrement de l'évaluation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-t-4 border-green-600 border-solid rounded-full animate-spin"></div>
          <p className="text-xl font-medium text-gray-700">
            Chargement des consultations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
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
                setLoading(true);
                window.location.reload();
              }}
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { pastConsultations, todayConsultations, futureConsultations } =
    sortConsultations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Card className="shadow-lg border-0 overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Mes Consultations
              </CardTitle>
              <p className="text-green-100 mt-2 opacity-90">
                Suivez et gérez vos rendez-vous psychologiques
              </p>
            </div>
            <Button
              onClick={() => router.push("/rendez-vous")}
              className="bg-white text-green-700 hover:bg-green-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Prendre rendez-vous
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!activeConsultation ? (
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b px-6">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-green-50"
                >
                  Aujourd'hui{" "}
                  {todayConsultations.length > 0 && (
                    <Badge className="ml-2 bg-green-600">
                      {todayConsultations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-green-50"
                >
                  À venir{" "}
                  {futureConsultations.length > 0 && (
                    <Badge className="ml-2 bg-green-600">
                      {futureConsultations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-green-50"
                >
                  Historique{" "}
                  {pastConsultations.length > 0 && (
                    <Badge className="ml-2 bg-green-600">
                      {pastConsultations.length}
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
                      Votre journée est libre.
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
                              : "bg-emerald-500"
                          }`}
                        ></div>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 mr-3 border">
                                <AvatarFallback className="bg-green-100 text-green-800 font-semibold">
                                  {consult.psychologue.utilisateur.prenom.charAt(
                                    0
                                  )}
                                  {consult.psychologue.utilisateur.nom.charAt(
                                    0
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {consult.psychologue.utilisateur.civilite}{" "}
                                  {consult.psychologue.utilisateur.prenom}{" "}
                                  {consult.psychologue.utilisateur.nom}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Psychologue
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`${
                                canStartConsultation(consult)
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-200"
                              }`}
                            >
                              {canStartConsultation(consult) ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>{" "}
                                  En cours
                                </>
                              ) : consult.status === "PENDING" ? (
                                "En attente"
                              ) : (
                                "Confirmé"
                              )}
                            </Badge>
                          </div>

                          <div className="space-y-3 text-sm text-gray-600 mt-4">
                            <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="font-medium">
                                {formatTime(consult.startTime)} -{" "}
                                {formatTime(consult.endTime)}
                              </span>
                              <Badge
                                variant="outline"
                                className="ml-auto"
                                style={{
                                  backgroundColor:
                                    getTimeUntilConsultation(consult) ===
                                    "Terminé"
                                      ? "#e5e7eb"
                                      : getTimeUntilConsultation(consult) ===
                                        "Maintenant"
                                      ? "#d1fae5"
                                      : "#d1f5f5",
                                  color:
                                    getTimeUntilConsultation(consult) ===
                                    "Terminé"
                                      ? "#6b7280"
                                      : getTimeUntilConsultation(consult) ===
                                        "Maintenant"
                                      ? "#065f46"
                                      : "#065f46",
                                }}
                              >
                                {getTimeUntilConsultation(consult)}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 p-2">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="capitalize">
                                {consult.type === "EN_LIGNE"
                                  ? "Consultation vidéo"
                                  : "Rendez-vous en personne"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-6">
                            {consult.type === "EN_LIGNE" ? (
                              canStartConsultation(consult) ? (
                                <Button
                                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleStartConsultation(consult)
                                  }
                                >
                                  <Video className="h-4 w-4" />
                                  Rejoindre maintenant
                                </Button>
                              ) : (
                                <Button
                                  className="w-full gap-2 bg-gray-200 text-gray-600 cursor-not-allowed"
                                  disabled
                                >
                                  <Clock className="h-4 w-4" />
                                  {getTimeUntilConsultation(consult) ===
                                  "Terminé"
                                    ? "Terminé"
                                    : "Pas encore disponible"}
                                </Button>
                              )
                            ) : (
                              <Button
                                className="w-full gap-2 bg-gray-200 text-gray-600 cursor-not-allowed"
                                disabled
                              >
                                <User className="h-4 w-4" />
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
                      Prenez un rendez-vous pour commencer.
                    </p>
                    <Button
                      className="mt-4 bg-green-600 hover:bg-green-700"
                      onClick={() => router.push("/rendez-vous")}
                    >
                      Planifier un rendez-vous
                    </Button>
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
                          <Calendar className="h-5 w-5 text-green-600 mr-2" />
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
                                      <Avatar className="h-10 w-10 mr-3 bg-green-100">
                                        <AvatarFallback className="text-green-800 font-semibold">
                                          {consult.psychologue.utilisateur.prenom.charAt(
                                            0
                                          )}
                                          {consult.psychologue.utilisateur.nom.charAt(
                                            0
                                          )}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h3 className="font-medium text-gray-900">
                                          {
                                            consult.psychologue.utilisateur
                                              .civilite
                                          }{" "}
                                          {
                                            consult.psychologue.utilisateur
                                              .prenom
                                          }{" "}
                                          {consult.psychologue.utilisateur.nom}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                          Psychologue
                                        </p>
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      {consult.status === "PENDING"
                                        ? "En attente"
                                        : "Confirmé"}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 text-green-600 mr-2" />
                                      <span>
                                        {formatTime(consult.startTime)} -{" "}
                                        {formatTime(consult.endTime)}
                                      </span>
                                    </div>

                                    <div className="flex items-center">
                                      {consult.type === "EN_LIGNE" ? (
                                        <Video className="h-4 w-4 text-green-600 mr-2" />
                                      ) : (
                                        <User className="h-4 w-4 text-green-600 mr-2" />
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

                {pastConsultations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                    <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">
                      Aucun historique de consultation
                    </p>
                    <p className="text-gray-500 mt-2">
                      Vos consultations terminées apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastConsultations.map((consult) => (
                      <Card
                        key={consult.id}
                        className="border border-gray-100 shadow-sm"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10 bg-gray-100">
                                <AvatarFallback className="text-gray-800 font-semibold">
                                  {consult.psychologue.utilisateur.prenom.charAt(
                                    0
                                  )}
                                  {consult.psychologue.utilisateur.nom.charAt(
                                    0
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {consult.psychologue.utilisateur.civilite}{" "}
                                  {consult.psychologue.utilisateur.prenom}{" "}
                                  {consult.psychologue.utilisateur.nom}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(consult.startTime)} •{" "}
                                  {formatTime(consult.startTime)}
                                </div>
                              </div>
                            </div>

                            <Badge className="bg-gray-100 text-gray-800">
                              {consult.status === "CANCELLED"
                                ? "Annulée"
                                : "Terminée"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleEndConsultation}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-medium ml-4">
                    Consultation avec{" "}
                    {activeConsultation?.psychologue.utilisateur.civilite}{" "}
                    {activeConsultation?.psychologue.utilisateur.prenom}{" "}
                    {activeConsultation?.psychologue.utilisateur.nom}
                  </h2>
                </div>
              </div>

              <VideoCall
                roomId={
                  activeConsultation?.roomId ?? activeConsultation?.rendezVousId
                }
                userId={parseInt(params.userId as string)}
                userRole="student"
                etudiantId={activeConsultation?.etudiantId}
                psychologueId={activeConsultation?.psychologueId}
                onEndCall={handleEndConsultation}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Évaluer la consultation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { label: "Satisfaction générale", key: "satisfaction" },
              { label: "Empathie", key: "empathie" },
              { label: "Écoute", key: "ecoute" },
              { label: "Compréhension", key: "comprehension" },
              { label: "Recommandation", key: "recommandation" },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center gap-4">
                <Label className="w-32">{label}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEvaluation((prev) => ({
                          ...prev,
                          [key]: value,
                        }))
                      }
                    >
                      <Star
                        className={`h-5 w-5 ${
                          (evaluation[
                            key as keyof Omit<typeof evaluation, "commentaires">
                          ] as number) >= value
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <div className="grid gap-2">
              <Label>Commentaires</Label>
              <Textarea
                value={evaluation.commentaires}
                onChange={(e) =>
                  setEvaluation((prev) => ({
                    ...prev,
                    commentaires: e.target.value,
                  }))
                }
                placeholder="Vos commentaires sur la consultation..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEvaluation(false);
                setActiveConsultation(null);
              }}
            >
              Ignorer
            </Button>
            <Button
              onClick={handleEvaluationSubmit}
              disabled={
                !evaluation.satisfaction ||
                !evaluation.empathie ||
                !evaluation.ecoute ||
                !evaluation.comprehension ||
                !evaluation.recommandation
              }
            >
              Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultationPage;
