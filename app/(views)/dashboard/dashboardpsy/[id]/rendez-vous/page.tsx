"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../../../components/ui/avatar";
import Progress from "../../../../../components/ui/progress";
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  BarChart3,
  Search,
  Filter,
  Calendar as CalendarIcon,
  ArrowRight,
  ArrowLeft, // Added ArrowLeft icon for back button
} from "lucide-react";

interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "PSYCHOLOGUE" | "ETUDIANT";
  civilite: "M" | "Mme";
  avatar?: string | null;
  psychologue?: { id_psychologue: number };
}

interface RendezVous {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  statut: string;
  notes: string | null;
  psychologue: {
    id_psychologue: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
}
type SectionKey = "enAttente" | "aVenir" | "historique" | "annules";
type ExpandedSections = Record<SectionKey, boolean>;

interface AppointmentCardProps {
  rdv: RendezVous;
  showActions?: boolean;
}

interface AppointmentTableRowProps {
  rdv: RendezVous;
  showActions?: boolean;
}

interface ApiRendezVous {
  id: number;
  id_psychologue?: number;
  id_utilisateur?: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  statut: string;
  createdAt: string;
  updatedAt: string;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
}

interface SectionHeaderProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
}

interface EmptyStateProps {
  message: string;
}

export default function RendezVousPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    enAttente: true,
    aVenir: true,
    historique: false,
    annules: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [activeView, setActiveView] = useState<"cards" | "table">("cards");
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Utilisateur non authentifié.");
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération.");
        const data = await response.json();
        setUserData(data.user || data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  // Function to navigate back to main dashboard
  const handleBackToDashboard = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/dashboard/dashboardpsy/${userId}`);
    } else {
      router.push("/auth/login");
    }
  };

  // Fetch rendez-vous
  // Update your RendezVous interface to match the actual API response
  interface RendezVous {
    id: number;
    date: string;
    heure_debut: string;
    heure_fin: string;
    type: string;
    statut: string;
    notes: string | null;
    psychologue: {
      id_psychologue: number;
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
    };
    utilisateur: {
      id: number;
      nom: string;
      prenom: string;
      email: string;
      telephone?: string;
    };
  }

  // Update the fetchRendezVous function
  const fetchRendezVous = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Utilisateur non authentifié.");
      const response = await fetch(`/api/rendezvous/psychologue/${userId}`);
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des rendez-vous");

      const data = await response.json();
      console.log("Raw API response:", data);

      // Handle both array and object responses
      const dataArray = Array.isArray(data) ? data : data.data || [];

      // Map the API response to your frontend structure
      const validRendezVous = dataArray.map((rdv: any) => ({
        id: rdv.id,
        date: rdv.date,
        heure_debut: rdv.heure_debut,
        heure_fin: rdv.heure_fin,
        type: rdv.type,
        statut: rdv.statut,
        notes: rdv.notes || null,
        psychologue: {
          id_psychologue: rdv.psychologue?.id_psychologue || rdv.id_psychologue,
          nom: rdv.psychologue?.nom || "",
          prenom: rdv.psychologue?.prenom || "",
          email: rdv.psychologue?.email || "",
          telephone: rdv.psychologue?.telephone || "",
        },
        utilisateur: {
          id: rdv.utilisateur?.id || 0,
          nom: rdv.utilisateur?.nom || "",
          prenom: rdv.utilisateur?.prenom || "",
          email: rdv.utilisateur?.email || "",
          telephone: rdv.utilisateur?.telephone || "",
        },
      }));

      setRendezVous(validRendezVous);
      console.log("Processed rendezVous:", validRendezVous);
    } catch (err) {
      console.error("Error fetching rendez-vous:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (userData?.psychologue?.id_psychologue) {
      fetchRendezVous();
    }
  }, [userData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isPastDate = (dateString: string) => {
    const today = new Date();
    const rdvDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    rdvDate.setHours(0, 0, 0, 0);
    return rdvDate < today;
  };

 const handleUpdateStatut = async (id: number, statut: string) => {
   try {
     // Update rendez-vous status
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

     // Update local state
     setRendezVous((prev) =>
       prev.map((rdv) =>
         rdv.id === id
           ? { ...rdv, statut, updatedAt: new Date().toISOString() }
           : rdv
       )
     );

     // Find the rendezvous to access user and appointment details
     const rdv = rendezVous.find((r) => r.id === id);
     if (!rdv) throw new Error("Rendez-vous non trouvé");

     if (statut === "confirmé") {
       // Existing logic for confirmed status
       if (!rdv.utilisateur.id) {
         throw new Error(
           "Impossible de créer la consultation : ID utilisateur manquant."
         );
       }
       if (!rdv.psychologue.id_psychologue) {
         throw new Error(
           "Impossible de créer la consultation : ID psychologue manquant."
         );
       }

       const datePart = new Date(rdv.date).toISOString().split("T")[0];
       const startTime = new Date(`${datePart}T${rdv.heure_debut}`);
       const endTime = new Date(`${datePart}T${rdv.heure_fin}`);

       if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
         throw new Error("Format de date ou d'heure invalide");
       }

       let etudiantId;
       try {
         const etudiantResponse = await fetch(
           `/api/etudiants/by-utilisateur/${rdv.utilisateur.id}`
         );
         if (!etudiantResponse.ok) {
           const errorText = await etudiantResponse.text();
           throw new Error(
             `Étudiant non trouvé pour l'utilisateur ID ${rdv.utilisateur.id}`
           );
         }
         const etudiantData = await etudiantResponse.json();
         etudiantId = etudiantData.id_etudiant;
       } catch (studentError) {
         throw new Error(
           "Impossible de créer la consultation : étudiant non trouvé."
         );
       }

       const consultationData = {
         etudiantId,
         psychologueId: rdv.psychologue.id_psychologue,
         rendezVousId: rdv.id,
         status: "CONFIRMED",
         type:
           rdv.type.toUpperCase() === "EN_LIGNE" ? "EN_LIGNE" : "PRESENTIEL",
         startTime: startTime.toISOString(),
         endTime: endTime.toISOString(),
         notes: rdv.notes,
         summary: null,
         roomId: `consultation-${rdv.id}`,
       };

       // Check if consultation exists
       const checkResponse = await fetch(`/api/consultations/${rdv.id}`);
       let consultationExists = false;
       let existingConsultationId = null;

       if (checkResponse.ok) {
         const consultations = await checkResponse.json();
         if (
           consultations.success &&
           Array.isArray(consultations.data) &&
           consultations.data.length > 0
         ) {
           consultationExists = true;
           existingConsultationId = consultations.data[0].id;
         }
       }

       let consultationResponse;
       if (consultationExists && existingConsultationId) {
         consultationResponse = await fetch(`/api/consultations/${rdv.id}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(consultationData),
         });
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

       // Create notification for confirmed appointment
       const confirmedNotificationMessage = `Votre rendez-vous du ${formatDate(
         rdv.date
       )} à ${rdv.heure_debut} a été confirmé.`;
       const confirmedNotificationResponse = await fetch("/api/notifications", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           userId: rdv.utilisateur.id,
           message: confirmedNotificationMessage,
         }),
       });

       if (!confirmedNotificationResponse.ok) {
         const errorData = await confirmedNotificationResponse.json();
         throw new Error(
           errorData.error || "Erreur lors de la création de la notification"
         );
       }

       // Display success notification for confirmation
       const notificationElement = document.createElement("div");
       notificationElement.className =
         "fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-lg shadow-lg z-50 animate-slideIn";
       notificationElement.innerHTML = result.emailSent
         ? "✅ Rendez-vous confirmé, consultation enregistrée, notification envoyée et email envoyé."
         : "✅ Rendez-vous confirmé, consultation enregistrée et notification envoyée.";
       document.body.appendChild(notificationElement);

       setTimeout(() => {
         notificationElement.classList.add("animate-slideOut");
         setTimeout(() => {
           document.body.removeChild(notificationElement);
         }, 500);
       }, 5000);
     } else if (statut === "rejeté") {
       // Create notification for rejected appointment
       const rejectedNotificationMessage = `Votre rendez-vous du ${formatDate(
         rdv.date
       )} à ${rdv.heure_debut} a été refusé par le psychologue.`;
       const rejectedNotificationResponse = await fetch("/api/notifications", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           userId: rdv.utilisateur.id,
           message: rejectedNotificationMessage,
         }),
       });

       if (!rejectedNotificationResponse.ok) {
         const errorData = await rejectedNotificationResponse.json();
         throw new Error(
           errorData.error || "Erreur lors de la création de la notification"
         );
       }

       // Display success notification for rejection
       const notificationElement = document.createElement("div");
       notificationElement.className =
         "fixed top-4 right-4 bg-red-100 text-red-800 p-4 rounded-lg shadow-lg z-50 animate-slideIn";
       notificationElement.innerHTML =
         "❌ Rendez-vous annulé et notification envoyée.";
       document.body.appendChild(notificationElement);

       setTimeout(() => {
         notificationElement.classList.add("animate-slideOut");
         setTimeout(() => {
           document.body.removeChild(notificationElement);
         }, 500);
       }, 5000);
     }
   } catch (err) {
     console.error("Erreur dans handleUpdateStatut:", err);
     const notificationElement = document.createElement("div");
     notificationElement.className =
       "fixed top-4 right-4 bg-red-100 text-red-800 p-4 rounded-lg shadow-lg z-50 animate-slideIn";
     notificationElement.innerHTML = `⚠️ Erreur: ${
       err instanceof Error ? err.message : "Erreur inconnue"
     }`;
     document.body.appendChild(notificationElement);

     setTimeout(() => {
       notificationElement.classList.add("animate-slideOut");
       setTimeout(() => {
         document.body.removeChild(notificationElement);
       }, 500);
     }, 5000);
   }
 };
  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filterRendezVous = (rdv: RendezVous) => {
    const matchesSearch =
      searchTerm === "" ||
      `${rdv.utilisateur?.prenom} ${rdv.utilisateur?.nom}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter === "" || rdv.date.includes(dateFilter);

    return matchesSearch && matchesDate;
  };

  const rendezVousEnAttente = rendezVous
    .filter((rdv) => rdv.statut === "en attente")
    .filter(filterRendezVous);

  const rendezVousAVenir = rendezVous
    .filter((rdv) => rdv.statut === "confirmé" && !isPastDate(rdv.date))
    .filter(filterRendezVous);

  const rendezVousHistorique = rendezVous
    .filter((rdv) => rdv.statut === "confirmé" && isPastDate(rdv.date))
    .filter(filterRendezVous);

  const rendezVousAnnules = rendezVous
    .filter((rdv) => rdv.statut === "rejeté")
    .filter(filterRendezVous);

  const totalRdv = rendezVous.length;
  const confirmedRdv = rendezVous.filter(
    (rdv) => rdv.statut === "confirmé"
  ).length;
  const pendingRdv = rendezVousEnAttente.length;
  const cancelledRdv = rendezVousAnnules.length;
  const confirmationRate = totalRdv > 0 ? (confirmedRdv / totalRdv) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmé":
        return (
          <Badge className="bg-green-100 text-green-800 border-0 flex items-center">
            <Check className="h-3 w-3 mr-1" /> Confirmé
          </Badge>
        );
      case "en attente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-0 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" /> En attente
          </Badge>
        );
      case "rejeté":
        return (
          <Badge className="bg-red-100 text-red-800 border-0 flex items-center">
            <X className="h-3 w-3 mr-1" /> Annulé
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-0">{status}</Badge>
        );
    }
  };

  const getInitials = (prenom?: string, nom?: string) => {
    return `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();
  };

  const AppointmentCard: React.FC<AppointmentCardProps> = ({
    rdv,
    showActions = false,
  }) => (
    <Card
      key={rdv.id}
      className="hover:shadow-md transition-all duration-300 border border-green-100 overflow-hidden group"
    >
      <div className="h-2 bg-gradient-to-r from-green-400 to-teal-500"></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="bg-green-100 text-green-800">
              <AvatarFallback>
                {getInitials(rdv.utilisateur?.prenom, rdv.utilisateur?.nom)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">
                {rdv.utilisateur?.prenom} {rdv.utilisateur?.nom}
              </h3>
              <p className="text-gray-500 text-sm">{rdv.utilisateur?.email}</p>
            </div>
          </div>
          {getStatusBadge(rdv.statut)}
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 rounded-full p-2">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium">{formatDate(rdv.date)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-50 rounded-full p-2">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <span>
              {rdv.heure_debut} - {rdv.heure_fin}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-50 rounded-full p-2">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <span className="capitalize">
              {rdv.type === "PRESENTIEL" ? (
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                  Consultation présentielle
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                  Consultation en ligne
                </span>
              )}
            </span>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-3 mt-6">
            <Button
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm transition-all"
              onClick={() => handleUpdateStatut(rdv.id, "confirmé")}
            >
              <Check className="h-4 w-4 mr-2" />
              Accepter
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-500 border-red-200 hover:bg-red-50 transition-all"
              onClick={() => handleUpdateStatut(rdv.id, "rejeté")}
            >
              <X className="h-4 w-4 mr-2" />
              Refuser
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AppointmentTableRow: React.FC<AppointmentTableRowProps> = ({
    rdv,
    showActions = false,
  }) => (
    <tr className="hover:bg-green-50 transition-colors border-b border-green-100">
      <td className="py-4 px-4 flex items-center gap-3">
        <Avatar className="h-8 w-8 bg-green-100 text-green-800">
          <AvatarFallback>
            {getInitials(rdv.utilisateur?.prenom, rdv.utilisateur?.nom)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-gray-900">
            {rdv.utilisateur?.prenom} {rdv.utilisateur?.nom}
          </div>
          <div className="text-gray-500 text-sm">{rdv.utilisateur?.email}</div>
        </div>
      </td>
      <td className="py-4 px-6">{formatDate(rdv.date)}</td>
      <td className="py-4 px-6">
        {rdv.heure_debut} - {rdv.heure_fin}
      </td>
      <td className="py-4 px-6">
        <span className="capitalize">
          {rdv.type === "EN_LIGNE" ? (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
              En ligne
            </span>
          ) : (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
              Présentiel
            </span>
          )}
        </span>
      </td>
      <td className="py-4 px-6">{getStatusBadge(rdv.statut)}</td>
      {showActions && (
        <td className="py-4 px-6">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleUpdateStatut(rdv.id, "confirmé")}
            >
              <Check className="h-3 w-3 mr-1" /> Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => handleUpdateStatut(rdv.id, "rejeté")}
            >
              <X className="h-3 w-3 mr-1" /> Refuser
            </Button>
          </div>
        </td>
      )}
    </tr>
  );

  const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    count,
    isExpanded,
    onToggle,
  }) => (
    <div
      className="flex items-center justify-between cursor-pointer p-4 hover:bg-green-50 rounded-lg transition-colors duration-300"
      onClick={onToggle}
    >
      <CardTitle className="flex items-center gap-3">
        <span className="text-lg font-semibold text-green-800">{title}</span>
        <Badge
          variant="secondary"
          className="px-2 py-1 bg-green-100 text-green-800 border-0"
        >
          {count}
        </Badge>
      </CardTitle>
      {isExpanded ? (
        <ChevronUp className="h-5 w-5 text-green-600" />
      ) : (
        <ChevronDown className="h-5 w-5 text-green-600" />
      )}
    </div>
  );

  const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-8 bg-green-50 rounded-lg">
      <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
        <CalendarIcon className="h-8 w-8 text-green-400" />
      </div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="flex flex-col items-center p-8 rounded-lg bg-white shadow-md">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-green-800">Chargement...</p>
          <p className="text-sm text-gray-500">Veuillez patienter</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="bg-red-50 p-6 rounded-lg text-red-600 border border-red-200 shadow-sm max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
          </div>
          <p>{error}</p>
          <Button
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );

  if (!userData) return null;

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          className="mb-4 flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 transition-colors"
          onClick={handleBackToDashboard}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Button>

        <Card className="border border-green-200 shadow-sm bg-white mb-8 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-teal-500"></div>
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 bg-opacity-70 border-b border-green-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-green-800">
                  Gestion des rendez-vous
                </CardTitle>
                <p className="text-green-600 mt-1">
                  Consultez et gérez vos rendez-vous avec vos patients
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  className={`border-green-200 ${
                    activeView === "cards" ? "bg-green-100 text-green-800" : ""
                  }`}
                  onClick={() => setActiveView("cards")}
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="7"
                      height="7"
                      rx="1"
                      className="fill-current"
                    />
                    <rect
                      x="14"
                      y="3"
                      width="7"
                      height="7"
                      rx="1"
                      className="fill-current"
                    />
                    <rect
                      x="3"
                      y="14"
                      width="7"
                      height="7"
                      rx="1"
                      className="fill-current"
                    />
                    <rect
                      x="14"
                      y="14"
                      width="7"
                      height="7"
                      rx="1"
                      className="fill-current"
                    />
                  </svg>
                  Cartes
                </Button>
                <Button
                  variant="outline"
                  className={`border-green-200 ${
                    activeView === "table" ? "bg-green-100 text-green-800" : ""
                  }`}
                  onClick={() => setActiveView("table")}
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 4H21V8H3V4Z" className="fill-current" />
                    <path d="M3 10H21V14H3V10Z" className="fill-current" />
                    <path d="M3 16H21V20H3V16Z" className="fill-current" />
                  </svg>
                  Tableau
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="border border-green-100 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total RDV
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {totalRdv}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-green-100 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Confirmés
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {confirmedRdv}
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-green-100 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      En attente
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {pendingRdv}
                    </h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-green-100 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Taux de confirmation
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {confirmationRate.toFixed(1)}%
                    </h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </CardContent>
                <CardFooter className="px-4 pb-4 pt-0">
                  <Progress
                    value={confirmationRate}
                    className="h-2 bg-gray-100"
                  />
                </CardFooter>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative flex-grow md:max-w-xs">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-all"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>

            <div className="space-y-8">
              <section className="bg-white rounded-lg overflow-hidden border border-green-100 shadow-sm">
                <SectionHeader
                  title="En attente"
                  count={rendezVousEnAttente.length}
                  isExpanded={expandedSections.enAttente}
                  onToggle={() => toggleSection("enAttente")}
                />
                {expandedSections.enAttente && (
                  <div className="p-4">
                    {rendezVousEnAttente.length === 0 ? (
                      <EmptyState message="Aucun rendez-vous en attente" />
                    ) : activeView === "cards" ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {rendezVousEnAttente.map((rdv) => (
                          <AppointmentCard
                            key={rdv.id}
                            rdv={rdv}
                            showActions={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-green-50 text-left text-green-800">
                            <tr>
                              <th className="py-3 px-4">Patient</th>
                              <th className="py-3 px-6">Date</th>
                              <th className="py-3 px-6">Heure</th>
                              <th className="py-3 px-6">Type</th>
                              <th className="py-3 px-6">Statut</th>
                              <th className="py-3 px-6">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rendezVousEnAttente.map((rdv) => (
                              <AppointmentTableRow
                                key={rdv.id}
                                rdv={rdv}
                                showActions={true}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-lg overflow-hidden border border-green-100 shadow-sm">
                <SectionHeader
                  title="À venir"
                  count={rendezVousAVenir.length}
                  isExpanded={expandedSections.aVenir}
                  onToggle={() => toggleSection("aVenir")}
                />
                {expandedSections.aVenir && (
                  <div className="p-4">
                    {rendezVousAVenir.length === 0 ? (
                      <EmptyState message="Aucun rendez-vous à venir" />
                    ) : activeView === "cards" ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {rendezVousAVenir.map((rdv) => (
                          <AppointmentCard key={rdv.id} rdv={rdv} />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-green-50 text-left text-green-800">
                            <tr>
                              <th className="py-3 px-4">Patient</th>
                              <th className="py-3 px-6">Date</th>
                              <th className="py-3 px-6">Heure</th>
                              <th className="py-3 px-6">Type</th>
                              <th className="py-3 px-6">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rendezVousAVenir.map((rdv) => (
                              <AppointmentTableRow key={rdv.id} rdv={rdv} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-lg overflow-hidden border border-green-100 shadow-sm">
                <SectionHeader
                  title="Historique"
                  count={rendezVousHistorique.length}
                  isExpanded={expandedSections.historique}
                  onToggle={() => toggleSection("historique")}
                />
                {expandedSections.historique && (
                  <div className="p-4">
                    {rendezVousHistorique.length === 0 ? (
                      <EmptyState message="Aucun rendez-vous dans l'historique" />
                    ) : activeView === "cards" ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {rendezVousHistorique.map((rdv) => (
                          <AppointmentCard key={rdv.id} rdv={rdv} />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-green-50 text-left text-green-800">
                            <tr>
                              <th className="py-3 px-4">Patient</th>
                              <th className="py-3 px-6">Date</th>
                              <th className="py-3 px-6">Heure</th>
                              <th className="py-3 px-6">Type</th>
                              <th className="py-3 px-6">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rendezVousHistorique.map((rdv) => (
                              <AppointmentTableRow key={rdv.id} rdv={rdv} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-lg overflow-hidden border border-green-100 shadow-sm">
                <SectionHeader
                  title="Annulés"
                  count={rendezVousAnnules.length}
                  isExpanded={expandedSections.annules}
                  onToggle={() => toggleSection("annules")}
                />
                {expandedSections.annules && (
                  <div className="p-4">
                    {rendezVousAnnules.length === 0 ? (
                      <EmptyState message="Aucun rendez-vous annulé" />
                    ) : activeView === "cards" ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {rendezVousAnnules.map((rdv) => (
                          <AppointmentCard key={rdv.id} rdv={rdv} />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-green-50 text-left text-green-800">
                            <tr>
                              <th className="py-3 px-4">Patient</th>
                              <th className="py-3 px-6">Date</th>
                              <th className="py-3 px-6">Heure</th>
                              <th className="py-3 px-6">Type</th>
                              <th className="py-3 px-6">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rendezVousAnnules.map((rdv) => (
                              <AppointmentTableRow key={rdv.id} rdv={rdv} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
