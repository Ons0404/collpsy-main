"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  CheckCircle,
  MapPin,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Clock,
  Mail,
  MessageSquare,
  Star,
  X,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

enum TypeConsultation {
  PRESENTIEL = "PRESENTIEL",
  EN_LIGNE = "EN_LIGNE",
  LES_DEUX = "LES_DEUX",
}

interface CalendarDay {
  date: Date;
  hasAvailability: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
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
  consultationMode: TypeConsultation | "";
  email: string;
  requestTitle: string;
  phone?: string;
};

type FormErrors = {
  consultationMode: string;
  email: string;
  phone?: string;
};

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

type PsychologistDetail = {
  id: number;
  name: string;
  avatar: string | null;
  verified: boolean;
  establishmentName: string;
  address: string;
  consultationType: string;
};

type AvailabilityResponse = {
  psychologist: PsychologistDetail;
  availabilities: Availability[];
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

export default function RendezVousPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    consultationMode: "",
    email: "",
    requestTitle: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    consultationMode: "",
    email: "",
    phone: "",
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
  const [activeTab, setActiveTab] = useState<TypeConsultation>(
    TypeConsultation.EN_LIGNE
  );
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Fonctions de rendu
  const renderLoading = () => (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0d9488]"></div>
        <div className="text-lg font-medium text-gray-700">
          Chargement des psychologues...
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md w-full">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHeroSection = () => (
    <div className="bg-gradient-to-r from-[#0d9488] to-[#0891b2] text-white py-16 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">
          Prenez Soin de Votre Santé Mentale
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Une plateforme dédiée aux étudiants, offrant un accompagnement
          psychologique personnalisé, accessible et confidentiel.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center bg-white/10 px-6 py-3 rounded-full">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Consultations individuelles</span>
          </div>
          <div className="flex items-center bg-white/10 px-6 py-3 rounded-full">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Tests psychologiques adaptés</span>
          </div>
          <div className="flex items-center bg-white/10 px-6 py-3 rounded-full">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Soutien en ligne 24/7</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-[#0d9488] px-8 py-3 rounded-lg font-medium hover:bg-[#ccfbf1] transition-colors flex items-center">
            Nos Tests <ChevronRight className="ml-2 h-5 w-5" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#0d9488] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#0f766e] transition-colors flex items-center"
          >
            Prendre rendez-vous maintenant{" "}
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPsychologistCard = (psychologist: Psychologist) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="md:flex">
        <div className="md:w-1/4 p-6 flex flex-col items-center bg-[#f8fafc]">
          <div className="relative mb-4">
            {psychologist.avatar ? (
              <img
                src={`data:image/jpeg;base64,${psychologist.avatar}`}
                alt={psychologist.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-sm"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ccfbf1] to-[#99f6e4] flex items-center justify-center border-4 border-white shadow-sm">
                <UserCheck className="text-[#0d9488] h-12 w-12" />
              </div>
            )}
            {psychologist.verified && (
              <div className="absolute bottom-0 right-0 bg-[#0d9488] rounded-full p-1">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              {psychologist.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {psychologist.experience} ans d'expérience
            </p>
          </div>
        </div>
        <div className="md:w-2/4 p-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Spécialités
            </h4>
            <div className="flex flex-wrap gap-2">
              {(psychologist.specialties || []).map((specialty, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-[#ccfbf1] text-[#0d9488] rounded-full text-xs font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Description
            </h4>
            <p className="text-gray-600 text-sm line-clamp-3">
              {psychologist.description}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>{psychologist.address}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{psychologist.price}</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/4 p-6 bg-[#f8fafc] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Types de consultation
            </h4>
            <div className="space-y-2">
              {(psychologist.sessionTypes || []).map((type, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-600"
                >
                  {type === "EN_LIGNE" ? (
                    <MessageSquare className="h-4 w-4 mr-2 text-[#0d9488]" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2 text-[#0d9488]" />
                  )}
                  <span>
                    {type === "EN_LIGNE"
                      ? "En ligne"
                      : type === "PRESENTIEL"
                      ? "En présentiel"
                      : "Les deux"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => handleSelectPsychologist(psychologist.id)}
            className="w-full mt-4 bg-gradient-to-r from-[#0d9488] to-[#0891b2] hover:from-[#0f766e] hover:to-[#0e7490] text-white py-2 px-4 rounded-lg shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Prendre rendez-vous
          </button>
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
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePreviousWeek}
            className="flex items-center justify-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">Semaine précédente</span>
          </button>
          <h3 className="text-lg font-semibold text-gray-800 text-center">
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
            className="flex items-center justify-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="mr-2 text-sm font-medium">Semaine suivante</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {loadingAvailabilities ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0d9488]"></div>
          </div>
        ) : dates.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Aucune disponibilité pour cette période
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Veuillez essayer une autre semaine ou contacter le psychologue
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {dates.map((dateStr) => {
              const date = new Date(dateStr);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isToday = date.toDateString() === today.toDateString();

              return (
                <div
                  key={dateStr}
                  className={`border rounded-lg p-3 ${
                    isToday
                      ? "border-[#0d9488] bg-[#ccfbf1]"
                      : "border-gray-200"
                  }`}
                >
                  <div
                    className={`text-center font-medium mb-2 ${
                      isToday ? "text-[#0d9488]" : "text-gray-700"
                    }`}
                  >
                    <div className="text-sm uppercase">
                      {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                    </div>
                    <div className="text-lg">
                      {date.toLocaleDateString("fr-FR", { day: "numeric" })}
                    </div>
                    <div className="text-xs">
                      {date.toLocaleDateString("fr-FR", { month: "short" })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {groupedByDate[dateStr].map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectAvailability(slot)}
                        className={`block w-full text-center py-2 px-2 rounded-md text-sm transition-all ${
                          selectedAvailability?.id === slot.id
                            ? "bg-[#0d9488] text-white shadow-md"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        {slot.heure_debut.substring(0, 5)} -{" "}
                        {slot.heure_fin.substring(0, 5)}
                        <div
                          className={`text-xs mt-1 ${
                            selectedAvailability?.id === slot.id
                              ? "text-[#ccfbf1]"
                              : "text-gray-500"
                          }`}
                        >
                          {slot.type === TypeConsultation.LES_DEUX
                            ? "En ligne ou présentiel"
                            : slot.type === TypeConsultation.EN_LIGNE
                            ? "En ligne"
                            : "En présentiel"}
                        </div>
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

  const renderAppointmentForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-[#ccfbf1] p-2 rounded-lg mr-4">
              <CalendarIcon className="text-[#0d9488] h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Prendre un rendez-vous
              </h2>
              <p className="text-sm text-gray-500">
                Sélectionnez un créneau et complétez vos informations
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {bookingMessage && (
          <div
            className={`p-4 rounded-md mb-6 ${
              bookingSuccess
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center">
              {bookingSuccess ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <X className="h-5 w-5 mr-2 text-red-500" />
              )}
              <span>{bookingMessage}</span>
            </div>
          </div>
        )}

        {/* Afficher les rendez-vous existants */}
        {userAppointments.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Rendez-vous existants
                </h3>
                <div className="mt-2 space-y-2">
                  {userAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="text-sm text-yellow-700"
                    >
                      <p>
                        <span className="font-medium">
                          {new Date(appointment.date).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            }
                          )}
                        </span>{" "}
                        à {appointment.heure_debut.substring(0, 5)} -{" "}
                        {appointment.heure_fin.substring(0, 5)}
                      </p>
                      <p className="text-xs">
                        {appointment.psychologist?.name ||
                          "Psychologue inconnu"}{" "}
                        - {appointment.type}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-yellow-700">
                  Vous ne pouvez pas prendre un nouveau rendez-vous avec le même
                  psychologue ou dans les 3 jours suivant un rendez-vous
                  existant.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Psychologue
              </label>
              <select
                value={selectedPsychologistId || ""}
                onChange={(e) => {
                  setSelectedPsychologistId(Number(e.target.value));
                  setSelectedAvailability(null);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] transition-all"
                required
              >
                <option value="">Sélectionnez un psychologue</option>
                {psychologists.map((psy) => (
                  <option key={psy.id} value={psy.id}>
                    {psy.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de consultation
              </label>
              <div className="mt-1">
                {selectedAvailability ? (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800">
                      {selectedAvailability.type === TypeConsultation.EN_LIGNE
                        ? "Consultation en ligne"
                        : selectedAvailability.type ===
                          TypeConsultation.PRESENTIEL
                        ? "Consultation en présentiel"
                        : "Consultation en ligne ou en présentiel"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Sélectionnez un créneau pour voir le type de consultation
                  </p>
                )}
              </div>
            </div>
          </div>

          {selectedPsychologistId && renderAvailabilityCalendar()}

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Vos informations
            </h3>

            {selectedAvailability && (
              <div className="mb-6 p-4 bg-[#ccfbf1] border border-[#0d9488] rounded-lg">
                <h4 className="font-medium text-[#0d9488] mb-2">
                  Rendez-vous sélectionné
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-[#0d9488]">
                      {new Date(selectedDate).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Horaire</p>
                    <p className="font-medium text-[#0d9488]">
                      {selectedStartTime.substring(0, 5)} -{" "}
                      {selectedEndTime.substring(0, 5)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Adresse email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] transition-all"
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] transition-all"
                  placeholder="06 12 34 56 78"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label
                htmlFor="requestTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Motif de consultation (optionnel)
              </label>
              <textarea
                id="requestTitle"
                name="requestTitle"
                value={formData.requestTitle}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] transition-all"
                placeholder="Décrivez brièvement votre demande..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedAvailability}
              className={`px-6 py-3 rounded-lg text-white transition-colors ${
                selectedAvailability
                  ? "bg-[#0d9488] hover:bg-[#0f766e] shadow-md"
                  : "bg-[#99f6e4] cursor-not-allowed"
              }`}
            >
              Confirmer le rendez-vous
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Logique du composant
  useEffect(() => {
    fetchPsychologists();
  }, []);

  useEffect(() => {
    if (selectedPsychologistId) {
      fetchAvailabilities();
    }
  }, [selectedPsychologistId, startDate, endDate]);

  useEffect(() => {
    if (selectedAvailability) {
      setSelectedDate(selectedAvailability.fullDate);
      setSelectedStartTime(selectedAvailability.heure_debut);
      setSelectedEndTime(selectedAvailability.heure_fin);
      setFormData((prevData) => ({
        ...prevData,
        consultationMode: selectedAvailability.type,
      }));
    }
  }, [selectedAvailability]);

  useEffect(() => {
    if (formData.email && showForm) {
      checkUserAppointments();
    }
  }, [formData.email, showForm]);

  const fetchPsychologists = async () => {
    try {
      const response = await fetch("/api/psychologists");
      if (!response.ok) {
        throw new Error("Failed to fetch psychologists");
      }
      const data = await response.json();
      setPsychologists(data);
    } catch (error) {
      setError("Failed to fetch psychologists. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilities = async () => {
    if (!selectedPsychologistId) return;

    setLoadingAvailabilities(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${selectedPsychologistId}/disponibilites?startDate=${startDate}&endDate=${endDate}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            "Erreur serveur lors de la récupération des disponibilités"
        );
      }

      const data = await response.json();
      const availableSlots = data.filter(
        (availability: any) => availability.est_disponible
      );

      const mappedAvailabilities = availableSlots.map((availability: any) => {
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
    } catch (error) {
      console.error("Error fetching availabilities:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors du chargement des disponibilités"
      );
    } finally {
      setLoadingAvailabilities(false);
    }
  };

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

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateFormWithData = (data: FormData) => {
    let isValid = true;
    const newErrors = { consultationMode: "", email: "", phone: "" };

    if (!data.consultationMode) {
      newErrors.consultationMode =
        "Veuillez sélectionner un mode de consultation.";
      isValid = false;
    }

    if (!data.email) {
      newErrors.email = "L'email est obligatoire.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Veuillez entrer un email valide.";
      isValid = false;
    }

    if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
      newErrors.phone = "Veuillez entrer un numéro valide (10 chiffres).";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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

    setFormData((prevData) => ({
      ...prevData,
      consultationMode: availability.type,
    }));
  };

const checkUserAppointments = async () => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    setUserAppointments([]);
    setUserId(null);
    setBookingMessage("Veuillez entrer un email valide.");
    setBookingSuccess(false);
    return;
  }

  try {
    const userResponse = await fetch(
      `/api/users?email=${encodeURIComponent(formData.email)}`
    );
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        setUserAppointments([]);
        setUserId(null);
        setBookingMessage("Aucun compte trouvé avec cet email.");
        setBookingSuccess(false);
        return;
      }
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }

    const userData = await userResponse.json();
    setUserId(userData.id);

    const appointmentsResponse = await fetch(
      `/api/rendezvous/etudiant/${userData.id}`
    );
    if (!appointmentsResponse.ok) {
      throw new Error("Erreur lors de la récupération des rendez-vous");
    }

    const appointments = await appointmentsResponse.json();
    setUserAppointments(appointments);
    if (appointments.length === 0) {
      setBookingMessage("Aucun rendez-vous existant trouvé.");
    }
  } catch (error) {
    console.error("Error checking user appointments:", error);
    setUserAppointments([]);
    setBookingMessage(
      "Une erreur est survenue lors de la vérification des rendez-vous."
    );
    setBookingSuccess(false);
  }
};

  const checkAppointmentConstraints = (): {
    valid: boolean;
    message: string;
  } => {
    if (!selectedAvailability || !selectedDate || !userId) {
      return { valid: false, message: "Données de rendez-vous incomplètes" };
    }

    const selectedAppointmentDate = new Date(selectedDate);
    const now = new Date();

    // 1. Vérifier si l'utilisateur a déjà un rendez-vous avec ce psychologue
    const existingWithSamePsychologist = userAppointments.some(
      (appointment) =>
        appointment.id_psychologue === selectedPsychologistId &&
        appointment.statut !== "annulé"
    );

    if (existingWithSamePsychologist) {
      return {
        valid: false,
        message:
          "Vous avez déjà un rendez-vous actif avec ce psychologue. Annulez-le avant d'en prendre un nouveau.",
      };
    }

    // 2. Vérifier le délai de 3 jours entre les rendez-vous
    const activeAppointments = userAppointments.filter(
      (appointment) => appointment.statut !== "annulé"
    );

    if (activeAppointments.length > 0) {
      const lastAppointment = activeAppointments.sort((a, b) =>
        new Date(a.date) > new Date(b.date) ? -1 : 1
      )[0];

      const lastAppointmentDate = new Date(lastAppointment.date);
      const timeDiff =
        selectedAppointmentDate.getTime() - lastAppointmentDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      if (daysDiff < 3) {
        const remainingDays = Math.ceil(3 - daysDiff);
        return {
          valid: false,
          message: `Vous devez attendre ${remainingDays} jour(s) après votre dernier rendez-vous avant d'en prendre un nouveau.`,
        };
      }
    }

    return { valid: true, message: "" };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAvailability) {
      alert("Veuillez sélectionner une disponibilité");
      return;
    }

    const updatedFormData = {
      ...formData,
      consultationMode: selectedAvailability.type,
    };

    if (validateFormWithData(updatedFormData)) {
      setFormData(updatedFormData);
      handleTakeAppointment();
    }
  };

  const handleTakeAppointment = async () => {
    try {
      if (!selectedAvailability) {
        throw new Error("Veuillez sélectionner une disponibilité");
      }
      if (!selectedDate) {
        throw new Error("La date du rendez-vous est invalide");
      }
      if (!selectedPsychologistId) {
        throw new Error("Veuillez sélectionner un psychologue");
      }
      if (!formData.email) {
        throw new Error("L'email est requis pour prendre un rendez-vous");
      }

      // Vérifier les contraintes
      const constraints = checkAppointmentConstraints();
      if (!constraints.valid) {
        setBookingSuccess(false);
        setBookingMessage(constraints.message);
        return;
      }

      // Créer le rendez-vous
      const appointmentData = {
        id_psychologue: selectedPsychologistId,
        id_utilisateur: userId,
        date: selectedDate,
        heure_debut: selectedAvailability.heure_debut,
        heure_fin: selectedAvailability.heure_fin,
        type: selectedAvailability.type,
        statut: "en attente",
        notes: formData.requestTitle || null,
      };

      const appointmentResponse = await fetch(
        "http://localhost:3001/api/rendezvous",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appointmentData),
        }
      );

      const appointmentDataResponse = await appointmentResponse.json();
      if (!appointmentResponse.ok) {
        throw new Error(
          appointmentDataResponse.error || "Échec de la création du rendez-vous"
        );
      }

      setBookingSuccess(true);
      setBookingMessage(
        appointmentDataResponse.message || "Rendez-vous pris avec succès !"
      );

      // Mettre à jour la liste des rendez-vous
      await checkUserAppointments();

      setTimeout(() => {
        setShowForm(false);
        resetForm();
      }, 3000);
    } catch (error) {
      console.error("Error in handleTakeAppointment:", error);
      setBookingSuccess(false);
      setBookingMessage(
        `Erreur: ${
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue"
        }`
      );
    }
  };

  const resetForm = () => {
    setFormData({
      consultationMode: "",
      email: "",
      requestTitle: "",
      phone: "",
    });
    setSelectedPsychologistId(null);
    setSelectedDate("");
    setSelectedStartTime("");
    setSelectedEndTime("");
    setSelectedAvailability(null);
    setBookingSuccess(false);
    setBookingMessage("");
    setUserAppointments([]);
    setUserId(null);
  };

  const filteredPsychologists = psychologists.filter((psychologist) => {
    const name = psychologist.name || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      !selectedSpecialty ||
      psychologist.specialties.some((s) =>
        s.toLowerCase().includes(selectedSpecialty.toLowerCase())
      );
    return matchesSearch && matchesSpecialty;
  });

  const specialties = Array.from(
    new Set(psychologists.flatMap((p) => p.specialties))
  );

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {renderHeroSection()}

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher un psychologue
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nom du psychologue"
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spécialité
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488]"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="">Toutes les spécialités</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-3 rounded-lg shadow-md transition-colors">
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Nos psychologues disponibles
          </h2>
          <p className="text-gray-600">
            {filteredPsychologists.length} professionnels trouvés
          </p>
        </div>

        <div className="space-y-6">
          {filteredPsychologists.length > 0 ? (
            filteredPsychologists.map((psychologist) =>
              renderPsychologistCard(psychologist)
            )
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <UserCheck className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Aucun psychologue trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>

      {showForm && renderAppointmentForm()}
    </div>
  );
}
