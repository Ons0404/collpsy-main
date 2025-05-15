"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../components/ui/card";
import CalendrierDisponibilite from "../../../../../components/CalendrierDisponibilite";
import {
  CalendarIcon,
  Clock,
  InfoIcon,
  AlertCircle,
  ArrowLeft,
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

export default function DisponibilitesPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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

  const handleRetourDashboard = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/dashboard/dashboardpsy/${userId}`);
    } else {
      router.push("/auth/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-slate-700 flex items-center p-4 bg-white rounded-lg shadow">
          <div className="animate-spin mr-3">
            <Clock size={22} className="text-blue-600" />
          </div>
          <span className="font-medium">Chargement en cours...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex items-start space-x-3 text-slate-800 p-5 bg-white rounded-lg shadow-md border-l-4 border-red-500">
          <AlertCircle
            size={24}
            className="text-red-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <h3 className="font-semibold mb-1">Erreur de connexion</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <button
            onClick={handleRetourDashboard}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Gestion des disponibilités
          </h1>
          <div className="flex items-center mt-2 text-slate-500">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>
              {userData.civilite} {userData.prenom} {userData.nom}
            </span>
          </div>
        </div>

        <Card className="shadow-md border border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 bg-white pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-800">
                  Planning de consultation
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">
                  Gérez vos créneaux disponibles pour les rendez-vous
                </CardDescription>
              </div>
              <div className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-sm font-medium">
                Psychologue
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start space-x-3">
                <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800">Instructions</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Sélectionnez les créneaux horaires en cliquant dessus pour
                    les marquer comme disponibles ou indisponibles. Vos
                    modifications sont enregistrées automatiquement.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1">
              <CalendrierDisponibilite
                id_psychologue={userData.psychologue?.id_psychologue || 0}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Pour toute assistance, contactez le support technique</p>
        </div>
      </div>
    </div>
  );
}
