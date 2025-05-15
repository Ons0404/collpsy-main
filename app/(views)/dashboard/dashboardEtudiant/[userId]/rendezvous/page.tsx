"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CalendarIcon,
  CheckCircle,
  MapPin,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Clock,
  X,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  Calendar,
  User,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
// Importation du composant PsychologueStatistics
import PsychologueStatistics from "../../../../../components/psychologue-static";

enum TypeConsultation {
  PRESENTIEL = "PRESENTIEL",
  EN_LIGNE = "EN_LIGNE",
  LES_DEUX = "LES_DEUX",
}

type Psychologist = {
  id: number;
  name: string;
  avatar?: string;
  specialties: string[];
  description: string;
  address: string;
  price: string;
  sessionTypes: string[];
  rating: number;
  experience: number;
  verified: boolean;
};

type FormData = {
  requestTitle: string;
};

interface AvailabilityResponse {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  est_disponible: boolean;
}

type Availability = {
  id: number;
  day: string;
  date: number;
  month: string;
  fullDate: string;
  heure_debut: string;
  heure_fin: string;
  type: TypeConsultation;
};

type Appointment = {
  id: number;
  id_psychologue: number;
  id_utilisateur: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: TypeConsultation;
  statut: string;
  notes: string | null;
  psychologist?: {
    name: string;
  };
};

export default function RendezVousPage({
  params,
}: {
  params: { userId: string };
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    requestTitle: "",
  });
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<
    number | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
  const [selectedAvailability, setSelectedAvailability] =
    useState<Availability | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // State for toggling history section
  const userId = parseInt(params.userId);
  const router = useRouter();

  const normalizeDateTime = (date: string, time: string) => {
    return `${date}T${time.padStart(5, "0")}`;
  };

  const renderBackButton = () => (
    <div className="container mx-auto px-6 pt-6">
      <button
        onClick={() => router.push(`/dashboard/dashboardEtudiant/${userId}`)}
        className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
        title="Retour au tableau de bord"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
    </div>
  );

  const fetchPsychologists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/psychologists");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch psychologists: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const psychologistsData = result.data || [];

      const processedData = psychologistsData.map((psychologist: any) => {
        let avatarBase64: string | undefined;
        if (psychologist.avatar) {
          if (psychologist.avatar.type === "Buffer") {
            avatarBase64 = Buffer.from(psychologist.avatar.data).toString(
              "base64"
            );
          } else if (typeof psychologist.avatar === "string") {
            avatarBase64 = psychologist.avatar.replace(
              /^data:image\/[a-z]+;base64,/,
              ""
            );
          } else {
            avatarBase64 = undefined;
          }
        } else {
          avatarBase64 = undefined;
        }

        return {
          id: psychologist.id || 0,
          name: psychologist.name || "Nom inconnu",
          avatar: avatarBase64,
          specialties: Array.isArray(psychologist.specialties)
            ? psychologist.specialties
            : psychologist.specialties
            ? [psychologist.specialties]
            : ["Généraliste"],
          description:
            psychologist.description || "Aucune description disponible",
          address: psychologist.address || "Adresse non spécifiée",
          price: psychologist.price || "Prix non spécifié",
          sessionTypes: Array.isArray(psychologist.sessionTypes)
            ? psychologist.sessionTypes
            : psychologist.sessionTypes
            ? [psychologist.sessionTypes]
            : ["EN_LIGNE"],
          rating:
            typeof psychologist.rating === "number" ? psychologist.rating : 5,
          experience:
            typeof psychologist.experience === "number"
              ? psychologist.experience
              : 1,
          verified:
            psychologist.verified !== undefined ? psychologist.verified : true,
        };
      });

      setPsychologists(processedData);
    } catch (err) {
      setError("Failed to fetch psychologists. Please try again later.");
      setPsychologists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailabilities = useCallback(async () => {
    if (!selectedPsychologistId) return;

    setLoadingAvailabilities(true);
    try {
      const response = await fetch(
        `/api/users/${selectedPsychologistId}/disponibilites?startDate=${startDate}&endDate=${endDate}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            "Erreur serveur lors de la récupération des disponibilités"
        );
      }

      const data: AvailabilityResponse[] = await response.json();
      const availableSlots = data.filter(
        (availability) => availability.est_disponible
      );

      const mappedAvailabilities = availableSlots.map((availability) => {
        const date = new Date(availability.date);
        return {
          id: availability.id,
          day: date.toLocaleDateString("fr-FR", { weekday: "short" }),
          date: date.getDate(),
          month: date.toLocaleDateString("fr-FR", { month: "short" }),
          fullDate: availability.date,
          heure_debut: availability.heure_debut,
          heure_fin: availability.heure_fin,
          type:
            availability.type === "EN_LIGNE"
              ? TypeConsultation.EN_LIGNE
              : availability.type === "PRESENTIEL"
              ? TypeConsultation.PRESENTIEL
              : TypeConsultation.LES_DEUX,
        };
      });

      setAvailabilities(mappedAvailabilities);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue lors du chargement des disponibilités"
      );
    } finally {
      setLoadingAvailabilities(false);
    }
  }, [selectedPsychologistId, startDate, endDate]);

  const checkUserAppointments = useCallback(async () => {
    try {
      const appointmentsResponse = await fetch(
        `/api/rendezvous/etudiant/${userId}`
      );
      if (!appointmentsResponse.ok) {
        throw new Error("Erreur lors de la récupération des rendez-vous");
      }

      const responseData = await appointmentsResponse.json();
      console.log("Appointments fetched:", responseData);

      const appointments = Array.isArray(responseData)
        ? responseData
        : responseData.data && Array.isArray(responseData.data)
        ? responseData.data
        : responseData
        ? [responseData]
        : [];

      const mappedAppointments: Appointment[] = appointments.map(
        (appt: any) => ({
          id: appt.id,
          id_psychologue: appt.id_psychologue,
          id_utilisateur: appt.id_utilisateur,
          date: new Date(appt.date).toISOString().split("T")[0],
          heure_debut: appt.heure_debut,
          heure_fin: appt.heure_fin,
          type: appt.type as TypeConsultation,
          statut: appt.statut,
          notes: appt.notes || null,
          psychologist: appt.psychologue
            ? { name: appt.psychologue.nom || "Unknown" }
            : undefined,
        })
      );

      console.log("Mapped appointments:", mappedAppointments);
      setUserAppointments(mappedAppointments);
    } catch (err) {
      console.error("Error in checkUserAppointments:", err);
      setUserAppointments([]);
      setBookingMessage(
        "Une erreur est survenue lors de la vérification des rendez-vous."
      );
      setBookingSuccess(false);
    }
  }, [userId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPsychologists();
        await checkUserAppointments();
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    loadData();
  }, [fetchPsychologists, checkUserAppointments]);

  useEffect(() => {
    if (selectedPsychologistId) {
      fetchAvailabilities();
    }
  }, [selectedPsychologistId, startDate, endDate, fetchAvailabilities]);

  useEffect(() => {
    if (selectedAvailability) {
      setSelectedDate(selectedAvailability.fullDate);
      setSelectedStartTime(selectedAvailability.heure_debut);
      setSelectedEndTime(selectedAvailability.heure_fin);
    }
  }, [selectedAvailability]);

  const handlePreviousWeek = () => {
    const start = new Date(startDate);
    start.setDate(start.getDate() - 7);
    const end = new Date(endDate);
    end.setDate(end.getDate() - 7);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const handleNextWeek = () => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + 7);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 7);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectPsychologist = (id: number) => {
    setSelectedPsychologistId(id);
    setShowForm(true);
    setSelectedAvailability(null);
    setSelectedDate("");
    setSelectedStartTime("");
    setSelectedEndTime("");
    setBookingSuccess(false);
    setBookingMessage("");
  };

  const handleSelectAvailability = (availability: Availability) => {
    const formattedDate = new Date(availability.fullDate)
      .toISOString()
      .split("T")[0];
    setSelectedAvailability(availability);
    setSelectedDate(formattedDate);
    setSelectedStartTime(availability.heure_debut);
    setSelectedEndTime(availability.heure_fin);
  };

  const checkAppointmentConstraints = (): {
    valid: boolean;
    message: string;
  } => {
    if (!selectedAvailability || !selectedDate || !selectedPsychologistId) {
      return { valid: false, message: "Données de rendez-vous incomplètes" };
    }

    const selectedDateTime = normalizeDateTime(
      selectedDate,
      selectedAvailability.heure_debut
    );

    // Check for overlapping appointments with the same psychologist
    const overlappingAppointment = userAppointments.some((appointment) => {
      const appointmentDateTime = normalizeDateTime(
        appointment.date,
        appointment.heure_debut
      );
      return (
        appointment.id_psychologue === selectedPsychologistId &&
        appointment.statut !== "annulé" &&
        appointmentDateTime === selectedDateTime
      );
    });

    if (overlappingAppointment) {
      return {
        valid: false,
        message:
          "Vous avez déjà un rendez-vous à ce créneau avec ce psychologue.",
      };
    }

    // Check if there is any confirmed appointment
    const hasConfirmedAppointment = userAppointments.some(
      (appointment) => appointment.statut === "confirmé"
    );

    if (hasConfirmedAppointment) {
      return {
        valid: false,
        message:
          "Vous avez déjà un rendez-vous confirmé. Vous devez attendre qu'il soit terminé ou annulé avant de prendre un nouveau rendez-vous.",
      };
    }

    return { valid: true, message: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAvailability || isSubmitting) {
      alert(
        isSubmitting
          ? "Une soumission est déjà en cours"
          : "Veuillez sélectionner une disponibilité"
      );
      return;
    }

    setIsSubmitting(true);
    const constraints = checkAppointmentConstraints();
    if (!constraints.valid) {
      setBookingSuccess(false);
      setBookingMessage(constraints.message);
      setIsSubmitting(false);
      return;
    }

    await handleTakeAppointment();
    setIsSubmitting(false);
  };

  const handleTakeAppointment = async () => {
    try {
      if (!selectedAvailability || !selectedPsychologistId) {
        throw new Error(
          "Veuillez sélectionner une disponibilité et un psychologue"
        );
      }

      const appointmentData = {
        id_psychologue: selectedPsychologistId,
        id_utilisateur: userId,
        date: selectedDate,
        heure_debut: selectedAvailability.heure_debut,
        heure_fin: selectedAvailability.heure_fin,
        type: selectedAvailability.type,
        statut: "en attente", // Explicitly set to "en attente"
        notes: formData.requestTitle || null,
      };

      const response = await fetch("/api/rendezvous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Échec de la création du rendez-vous"
        );
      }

      setBookingSuccess(true);
      setBookingMessage("Rendez-vous pris avec succès !");
      await checkUserAppointments();

      setTimeout(() => {
        setShowForm(false);
        resetForm();
      }, 3000);
    } catch (err) {
      setBookingSuccess(false);
      setBookingMessage(
        `Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`
      );
    }
  };

  const resetForm = () => {
    setFormData({ requestTitle: "" });
    setSelectedPsychologistId(null);
    setSelectedDate("");
    setSelectedStartTime("");
    setSelectedEndTime("");
    setSelectedAvailability(null);
    setBookingSuccess(false);
    setBookingMessage("");
  };

  const renderLoading = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-600"></div>
        <div className="text-lg font-medium text-gray-700">Chargement...</div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border-l-4 border-red-400 p-6 max-w-md w-full rounded-md shadow-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-800 mb-1">Erreur</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHeroSection = () => (
    <div
      className="relative bg-cover bg-center h-80"
      style={{ backgroundImage: "url('/imagerendezvousEtu.png')" }}
    >
      <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center">
        <div className="text-center text-white max-w-3xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Prenez Soin de Votre Santé Mentale
          </h1>
          <p className="text-xl md:text-2xl">
            Accompagnement psychologique personnalisé pour étudiants
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 mr-2 text-teal-300" />
              <span className="text-sm md:text-base">
                Professionnels qualifiés
              </span>
            </div>
            <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <Calendar className="h-5 w-5 mr-2 text-teal-300" />
              <span className="text-sm md:text-base">
                Disponibilités flexibles
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPsychologistCard = (psychologist: Psychologist) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 relative">
            {psychologist.avatar ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={`data:image/jpeg;base64,${psychologist.avatar}`}
                  alt={psychologist.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-avatar.jpg";
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <User className="text-gray-500 h-10 w-10" />
              </div>
            )}
            {psychologist.verified && (
              <div className="absolute top-0 right-0 bg-teal-600 text-white p-1 rounded-full">
                <CheckCircle className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                {psychologist.name}
              </h3>
              <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                <p className="text-sm text-gray-600 font-medium">
                  {psychologist.experience}{" "}
                  {psychologist.experience > 1 ? "ans" : "an"} d'expérience
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {psychologist.specialties
                  .slice(0, 3)
                  .map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                {psychologist.specialties.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    +{psychologist.specialties.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {psychologist.sessionTypes.includes("EN_LIGNE") && (
                  <span className="flex items-center px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm border border-gray-200">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    En ligne
                  </span>
                )}
                {psychologist.sessionTypes.includes("PRESENTIEL") && (
                  <span className="flex items-center px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm border border-gray-200">
                    <MapPin className="h-4 w-4 mr-1" />
                    En présentiel
                  </span>
                )}
                {psychologist.sessionTypes.includes("LES_DEUX") && (
                  <span className="flex items-center px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm border border-gray-200">
                    <div className="flex">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <MapPin className="h-4 w-4 mr-1" />
                    </div>
                    Les deux
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => handleSelectPsychologist(psychologist.id)}
              className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <CalendarIcon className="h-5 w-5" />
              <span>Prendre rendez-vous</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAvailabilityCalendar = () => {
    const groupedByDate = availabilities.reduce((acc, availability) => {
      const dateKey = availability.fullDate;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(availability);
      return acc;
    }, {} as Record<string, Availability[]>);

    const dates = Object.keys(groupedByDate).sort();

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
          <button
            onClick={handlePreviousWeek}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors bg-gray-50 py-2 px-4 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Semaine précédente
          </button>
          <h3 className="text-md font-semibold text-gray-800">
            {new Date(startDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}{" "}
            -{" "}
            {new Date(endDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={handleNextWeek}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors bg-gray-50 py-2 px-4 rounded-md hover:bg-gray-100"
          >
            Semaine suivante
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {loadingAvailabilities ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : dates.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-700 font-medium">
              Aucune disponibilité pour cette période
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Essayez de sélectionner une autre semaine
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {dates.map((dateStr) => {
              const date = new Date(dateStr);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isToday = date.toDateString() === today.toDateString();

              return (
                <div
                  key={dateStr}
                  className={`border rounded-lg overflow-hidden shadow-sm ${
                    isToday ? "border-teal-400" : "border-gray-100"
                  }`}
                >
                  <div
                    className={`text-center p-3 font-medium ${
                      -isToday
                        ? "bg-teal-50 text-teal-800"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="text-sm uppercase font-bold">
                      {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                    </div>
                    <div className="text-xl mt-1">
                      {date.toLocaleDateString("fr-FR", { day: "numeric" })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {date.toLocaleDateString("fr-FR", { month: "short" })}
                    </div>
                  </div>
                  <div className="p-2 space-y-2 bg-white">
                    {groupedByDate[dateStr].map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectAvailability(slot)}
                        className={`flex items-center justify-center w-full py-2 rounded-md text-sm transition-all ${
                          selectedAvailability?.id === slot.id
                            ? "bg-teal-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.heure_debut.slice(0, 5)}
                        {slot.type === TypeConsultation.EN_LIGNE ? (
                          <MessageSquare className="h-3 w-3 ml-2" />
                        ) : slot.type === TypeConsultation.PRESENTIEL ? (
                          <MapPin className="h-3 w-3 ml-2" />
                        ) : (
                          <div className="flex ml-2">
                            <MessageSquare className="h-3 w-3" />
                            <MapPin className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderBookingForm = () => {
    const psychologist = psychologists.find(
      (p) => p.id === selectedPsychologistId
    );

    if (!psychologist) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800">
                Prise de rendez-vous
              </h3>
              <p className="text-sm text-gray-500">Avec {psychologist.name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {bookingMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              bookingSuccess
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {bookingSuccess ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              {bookingMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4">
              Sélectionnez une date et un horaire
            </h4>
            {renderAvailabilityCalendar()}
          </div>

          {selectedAvailability && (
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
              <h4 className="font-medium text-teal-800 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-teal-600" />
                Créneau sélectionné
              </h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-teal-600 mr-2" />
                  <span className="text-gray-700">
                    {new Date(selectedAvailability.fullDate).toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-teal-600 mr-2" />
                  <span className="text-gray-700">
                    {selectedAvailability.heure_debut.slice(0, 5)} -{" "}
                    {selectedAvailability.heure_fin.slice(0, 5)}
                  </span>
                </div>
                <div className="flex items-center">
                  {selectedAvailability.type === TypeConsultation.EN_LIGNE ? (
                    <>
                      <MessageSquare className="h-5 w-5 text-teal-600 mr-2" />
                      <span className="text-gray-700">En ligne</span>
                    </>
                  ) : selectedAvailability.type ===
                    TypeConsultation.PRESENTIEL ? (
                    <>
                      <MapPin className="h-5 w-5 text-teal-600 mr-2" />
                      <span className="text-gray-700">En présentiel</span>
                    </>
                  ) : (
                    <>
                      <div className="flex mr-2">
                        <MessageSquare className="h-5 w-5 text-teal-600" />
                        <MapPin className="h-5 w-5 text-teal-600" />
                      </div>
                      <span className="text-gray-700">
                        En ligne ou présentiel
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="requestTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Motif de votre rendez-vous (optionnel)
            </label>
            <input
              type="text"
              id="requestTitle"
              name="requestTitle"
              value={formData.requestTitle}
              onChange={handleInputChange}
              placeholder="Ex: Anxiété, stress, problèmes d'adaptation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!selectedAvailability || isSubmitting}
              className={`flex items-center py-2 px-6 rounded-lg font-medium ${
                selectedAvailability && !isSubmitting
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Traitement...
                </div>
              ) : (
                <>
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Confirmer le rendez-vous
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const dateObject = new Date(appointment.date);
    const formattedDate = dateObject.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const isUpcoming =
      dateObject >= new Date() ||
      (dateObject.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) &&
        appointment.heure_debut > new Date().toTimeString().slice(0, 5));

    // Fonction pour définir le style en fonction du statut
    const getStatusStyle = (status: string) => {
      switch (status.toLowerCase()) {
        case "confirmé":
          return "bg-green-50 text-green-800 border-green-200";
        case "en attente":
          return "bg-yellow-50 text-yellow-800 border-yellow-200";
        case "annulé":
          return "bg-red-50 text-red-800 border-red-200";
        case "terminé":
          return "bg-gray-50 text-gray-800 border-gray-200";
        default:
          return "bg-blue-50 text-blue-800 border-blue-200";
      }
    };

    const statusStyle = getStatusStyle(appointment.statut);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {appointment.psychologist
                  ? appointment.psychologist.name
                  : "Psychologue"}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {appointment.heure_debut.slice(0, 5)} -{" "}
                  {appointment.heure_fin.slice(0, 5)}
                </span>
              </div>
              <div className="flex items-center">
                {appointment.type === TypeConsultation.EN_LIGNE ? (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-600">En ligne</span>
                  </>
                ) : appointment.type === TypeConsultation.PRESENTIEL ? (
                  <>
                    <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-600">En présentiel</span>
                  </>
                ) : (
                  <>
                    <div className="flex mr-2">
                      <MessageSquare className="h-4 w-4 text-gray-600" />
                      <MapPin className="h-4 w-4 text-gray-600 ml-1" />
                    </div>
                    <span className="text-gray-600">
                      En ligne ou présentiel
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 md:mt-0">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle} inline-flex items-center`}
              >
                <span className="mr-1">Statut:</span> {appointment.statut}
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-start">
                <Info className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                <div className="text-gray-700 text-sm">
                  <span className="font-medium">Motif:</span>{" "}
                  {appointment.notes}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAppointmentsSection = () => {
    const upcomingAppointments = userAppointments.filter(
      (appointment) =>
        appointment.statut.toLowerCase() !== "annulé" &&
        appointment.statut.toLowerCase() !== "terminé" &&
        new Date(appointment.date) >= new Date(new Date().setHours(0, 0, 0, 0))
    );

    const pastAppointments = userAppointments.filter(
      (appointment) =>
        appointment.statut.toLowerCase() === "annulé" ||
        appointment.statut.toLowerCase() === "terminé" ||
        new Date(appointment.date) < new Date(new Date().setHours(0, 0, 0, 0))
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Mes rendez-vous
        </h2>

        {upcomingAppointments.length === 0 && pastAppointments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-700 font-medium">
              Vous n'avez pas de rendez-vous
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Prenez rendez-vous avec un psychologue pour commencer
            </p>
          </div>
        ) : (
          <>
            {upcomingAppointments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Rendez-vous à venir
                </h3>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id}>
                      {renderAppointmentCard(appointment)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastAppointments.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center text-gray-700 font-medium hover:text-gray-900 mb-3"
                >
                  <span>Historique des rendez-vous</span>
                  {showHistory ? (
                    <ChevronUp className="h-5 w-5 ml-1" />
                  ) : (
                    <ChevronDown className="h-5 w-5 ml-1" />
                  )}
                </button>

                {showHistory && (
                  <div className="space-y-4 mt-3">
                    {pastAppointments.map((appointment) => (
                      <div key={appointment.id}>
                        {renderAppointmentCard(appointment)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="min-h-screen bg-gray-50">
      {renderBackButton()}
      {renderHeroSection()}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {showForm ? (
            renderBookingForm()
          ) : (
            <>
              {/* Statistics Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Info className="mr-2 h-6 w-6 text-teal-600" />
                  Statistiques des psychologues
                </h2>
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <PsychologueStatistics />
                </div>
              </div>

              {/* Psychologists List */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <UserCheck className="mr-2 h-6 w-6 text-teal-600" />
                  Nos psychologues
                </h2>

                <div className="space-y-6">
                  {psychologists.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-100">
                      <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-700 font-medium">
                        Aucun psychologue disponible pour le moment
                      </p>
                      <p className="text-gray-600 text-sm mt-2">
                        Veuillez réessayer ultérieurement
                      </p>
                    </div>
                  ) : (
                    psychologists.map((psychologist) => (
                      <div key={psychologist.id}>
                        {renderPsychologistCard(psychologist)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {userAppointments.length > 0 && (
                <div>{renderAppointmentsSection()}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
