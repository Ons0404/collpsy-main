"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Clock,
  Plus,
  X,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Calendar } from "./ui/calender";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Disponibilite {
  id: number;
  date: Date;
  heure_debut: string;
  heure_fin: string;
  type: "PRESENTIEL" | "EN_LIGNE";
  est_disponible: boolean;
}

interface CalendrierDisponibiliteProps {
  id_psychologue: number;
}

export default function CalendrierDisponibilite({
  id_psychologue,
}: CalendrierDisponibiliteProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [heureDebut, setHeureDebut] = useState("09:00");
  const [heureFin, setHeureFin] = useState("10:00");
  const [typeConsultation, setTypeConsultation] = useState<
    "PRESENTIEL" | "EN_LIGNE"
  >("PRESENTIEL");

  useEffect(() => {
    const fetchDisponibilites = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Utilisateur non authentifié");

        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const formatDate = (date: Date) => date.toISOString().split("T")[0];
        const apiUrl = `http://localhost:3001/api/users/${userId}/disponibilites?startDate=${formatDate(
          startDate
        )}&endDate=${formatDate(endDate)}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              "Erreur lors de la récupération des disponibilités"
          );
        }

        const data = await response.json();
        const formattedData = data.map((item: any) => ({
          ...item,
          date: new Date(item.date),
        }));
        setDisponibilites(formattedData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDisponibilites();
  }, []);

  const handleAddDisponibilite = async () => {
    try {
      // Validation: Check if the selected date is in the past
      if (!date) throw new Error("Veuillez sélectionner une date");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setError("Impossible d'ajouter une disponibilité pour une date passée");
        toast.error(
          "Impossible d'ajouter une disponibilité pour une date passée"
        );
        return;
      }

      // Validation: Check if start time is before end time
      if (heureDebut >= heureFin) {
        setError("L'heure de début doit être avant l'heure de fin");
        toast.error("L'heure de début doit être avant l'heure de fin");
        return;
      }

      // Validation: Check for overlapping time slots on the same date
      const existingDisponibilite = disponibilites.find((dispo) => {
        const dispoDate = new Date(dispo.date);
        dispoDate.setHours(0, 0, 0, 0);
        const isSameDate = dispoDate.getTime() === selectedDate.getTime();

        if (!isSameDate) return false;

        const newStart = heureDebut;
        const newEnd = heureFin;
        const existingStart = dispo.heure_debut;
        const existingEnd = dispo.heure_fin;

        // Check for overlap: newStart < existingEnd AND newEnd > existingStart
        return newStart < existingEnd && newEnd > existingStart;
      });

      if (existingDisponibilite) {
        setError(
          "Une disponibilité existe déjà à ce créneau horaire pour cette date"
        );
        toast.error(
          "Une disponibilité existe déjà à ce créneau horaire pour cette date"
        );
        return;
      }

      setLoading(true);
      setError("");
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Utilisateur non authentifié");

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const nouvelleDisponibilite = {
        date: formattedDate,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        type: typeConsultation,
        est_disponible: true,
      };

      const response = await fetch(
        `http://localhost:3001/api/users/${userId}/disponibilites`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nouvelleDisponibilite),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setError("Ce créneau horaire chevauche une disponibilité existante");
          toast.error(
            "Ce créneau horaire chevauche une disponibilité existante"
          );
          return;
        }
        throw new Error(
          errorData.error || "Erreur lors de l'ajout de la disponibilité"
        );
      }

      const data = await response.json();
      setDisponibilites([
        ...disponibilites,
        { ...data, date: new Date(data.date) },
      ]);
      setOpenDialog(false);
      toast.success("Disponibilité ajoutée avec succès");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur inconnue est survenue";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDisponibilite = async (id: number) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Utilisateur non authentifié");

      const response = await fetch(
        `http://localhost:3001/api/users/${userId}/disponibilites?disponibiliteId=${id}`,
        { method: "DELETE" }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la suppression de la disponibilité");

      setDisponibilites(disponibilites.filter((dispo) => dispo.id !== id));
      toast.success("Disponibilité supprimée avec succès");
    } catch (err) {
      setError("Impossible de supprimer la disponibilité");
      toast.error("Impossible de supprimer la disponibilité");
    } finally {
      setLoading(false);
    }
  };

  const getDisponibilitesParDate = (date: Date) => {
    return disponibilites.filter(
      (dispo) =>
        dispo.date.getDate() === date.getDate() &&
        dispo.date.getMonth() === date.getMonth() &&
        dispo.date.getFullYear() === date.getFullYear()
    );
  };

  const hasDisponibilites = (date: Date) => {
    return disponibilites.some(
      (dispo) =>
        dispo.date.getDate() === date.getDate() &&
        dispo.date.getMonth() === date.getMonth() &&
        dispo.date.getFullYear() === date.getFullYear()
    );
  };

  const formatHeure = (heure: string) => heure;

  return (
    <Card className="col-span-2 border border-green-200 shadow-md bg-white">
      <CardHeader className="border-b border-green-100 bg-green-50 pb-4">
        <CardTitle className="text-xl font-bold text-green-800 flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
            <span>Calendrier de disponibilité</span>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un créneau
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-green-200 shadow-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader className="border-b border-green-100 pb-3">
                <DialogTitle className="text-green-800 text-xl">
                  Ajouter une disponibilité
                </DialogTitle>
                <DialogDescription className="text-green-600">
                  Définissez votre plage horaire de disponibilité pour{" "}
                  <span className="font-medium">
                    {date?.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="border border-green-200 rounded-lg p-1 shadow-inner bg-green-50">
                    <Calendar
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      disabled={(date: Date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      modifiers={{
                        hasDisponibilite: (date: Date) =>
                          hasDisponibilites(date),
                      }}
                      modifiersStyles={{
                        hasDisponibilite: {
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          fontWeight: "bold",
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      value={heureDebut}
                      onChange={(e) => setHeureDebut(e.target.value)}
                      className="w-full p-2 border border-green-200 rounded focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      value={heureFin}
                      onChange={(e) => setHeureFin(e.target.value)}
                      className="w-full p-2 border border-green-200 rounded focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">
                    Type de consultation
                  </label>
                  <select
                    value={typeConsultation}
                    onChange={(e) =>
                      setTypeConsultation(
                        e.target.value as "PRESENTIEL" | "EN_LIGNE"
                      )
                    }
                    className="w-full p-2 border border-green-200 rounded focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none transition-all"
                  >
                    <option value="PRESENTIEL">Présentiel</option>
                    <option value="EN_LIGNE">En ligne</option>
                  </select>
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm mb-2 p-2 bg-red-50 rounded border border-red-100 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  {error}
                </div>
              )}
              <DialogFooter className="border-t border-green-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => setOpenDialog(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  disabled={loading}
                  onClick={handleAddDisponibilite}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">
                        <Clock size={16} />
                      </span>
                      Chargement...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Ajouter
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-green-50 p-4 rounded-lg border border-green-100 shadow-inner">
            <h3 className="text-sm font-medium text-green-700 mb-3 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Sélectionner une date
            </h3>
            <Calendar
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              disabled={(date: Date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              modifiers={{
                hasDisponibilite: (date) => hasDisponibilites(date),
              }}
              modifiersStyles={{
                hasDisponibilite: {
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  fontWeight: "bold",
                },
              }}
            />
          </div>
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-green-800 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
              Disponibilités pour le{" "}
              <span className="text-green-700 ml-1 font-bold">
                {date?.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </h3>

            {loading ? (
              <div className="p-8 text-center flex flex-col items-center justify-center bg-green-50 rounded-lg border border-green-100">
                <Clock className="animate-spin h-8 w-8 text-green-600 mb-2" />
                <span className="text-green-700 font-medium">
                  Chargement des disponibilités...
                </span>
              </div>
            ) : getDisponibilitesParDate(date || new Date()).length > 0 ? (
              <div className="space-y-3">
                {getDisponibilitesParDate(date || new Date()).map((dispo) => (
                  <div
                    key={dispo.id}
                    className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">
                        {formatHeure(dispo.heure_debut)} -{" "}
                        {formatHeure(dispo.heure_fin)}
                      </span>
                      <Badge
                        className={`ml-3 ${
                          dispo.type === "PRESENTIEL"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        {dispo.type === "PRESENTIEL"
                          ? "Présentiel"
                          : "En ligne"}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 text-sm p-2 border-red-100"
                      onClick={() => handleDeleteDisponibilite(dispo.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-green-50 rounded-lg border border-dashed border-green-200">
                <div className="flex flex-col items-center">
                  <CalendarIcon className="h-12 w-12 text-green-400 mb-3" />
                  <p className="text-green-700 mb-3">
                    Aucune disponibilité n'est définie pour cette date
                  </p>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    onClick={() => setOpenDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ajouter une disponibilité
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
