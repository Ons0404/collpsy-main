"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Calendar,
  Award,
  FileText,
  Brain,
  Info,
  Clock,
  ArrowLeft,
} from "lucide-react";

interface ResultatTest {
  id: string;
  testId: string;
  score: number;
  interpretation?: string;
  datePassation: string;
}

interface Rapport {
  id: string;
  etudiantId: number;
  psychologueId: number;
  titre: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  resultatTests: ResultatTest[];
}

export default function ResultPage({
  params,
}: {
  params: { userId: string; rapportId: string };
}) {
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ResultatTest | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const fetchRapport = async () => {
      try {
        if (!params.userId || !params.rapportId) {
          throw new Error("Paramètres manquants pour accéder à vos résultats");
        }

        const userIdNum = parseInt(params.userId);
        if (isNaN(userIdNum)) {
          throw new Error("Identifiant invalide");
        }

        const response = await fetch(
          `/api/rapports/${params.userId}/${params.rapportId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Erreur lors de la récupération de vos résultats"
          );
        }

        if (data.resultatTests && data.resultatTests.length > 0) {
          data.resultatTests.sort(
            (a: ResultatTest, b: ResultatTest) =>
              new Date(b.datePassation).getTime() -
              new Date(a.datePassation).getTime()
          );
          setSelectedResult(data.resultatTests[0]);
        }

        setRapport(data);
      } catch (error) {
        console.error("Erreur:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erreur inconnue";
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#ffe6e6",
            color: "#ff0000",
            border: "1px solid #ff0000",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRapport();
  }, [params.userId, params.rapportId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 rounded-lg bg-white shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
            <h2 className="text-xl font-medium text-gray-700">
              Chargement de vos résultats...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !rapport) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">!</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4 text-red-600 text-center">
                Résultats non disponibles
              </h1>
              <p className="mb-6 text-gray-600 text-center">
                {error || "Les résultats demandés sont introuvables."}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/dashboardEtudiant/${params.userId}/tests`
                    )
                  }
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Retour à mes tests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Obtenir la date du test pour l'affichage
  const testDate = selectedResult
    ? formatDate(selectedResult.datePassation)
    : formatDate(rapport.createdAt);

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Bouton retour */}
          <div className="mb-6">
            <button
              onClick={() =>
                router.push(
                  `/dashboard/dashboardEtudiant/${params.userId}/tests`
                )
              }
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Retour à mes tests
            </button>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-6 overflow-hidden">
            <div className="px-6 py-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
                <Brain className="w-8 h-8 mr-3" />
                {rapport.titre}
              </h1>
              <p className="text-lg text-blue-100">Résultats du {testDate}</p>
            </div>
          </div>

          {/* Test Selection */}
          {rapport.resultatTests.length > 1 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-5">
              <label className="block text-gray-700 font-medium mb-2">
                Historique de mes résultats:
              </label>
              <div className="relative">
                <select
                  value={selectedResult?.id || ""}
                  onChange={(e) => {
                    const selected = rapport.resultatTests.find(
                      (result) => result.id === e.target.value
                    );
                    setSelectedResult(selected || null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {rapport.resultatTests.map((result) => (
                    <option key={result.id} value={result.id}>
                      Test du {formatDate(result.datePassation)} - Score:{" "}
                      {result.score}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Résultat principal */}
          {selectedResult && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="p-2 bg-blue-500 text-white text-center font-medium">
                VOS RÉSULTATS
              </div>

              {/* Score section */}
              <div className="px-6 py-8 flex flex-col items-center border-b border-gray-100">
                <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-blue-500 flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-blue-700">
                    {selectedResult.score}
                  </span>
                </div>
                <h2 className="text-xl font-medium text-gray-700 mb-2">
                  Score obtenu
                </h2>
                <p className="text-sm text-gray-500">
                  Test passé le {formatDate(selectedResult.datePassation)}
                </p>
              </div>

              {/* Interpretation section */}
              <div className="px-6 py-6">
                <div className="flex items-start mb-4">
                  <Info className="w-6 h-6 mr-2 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Interprétation des résultats
                    </h3>
                    <p className="text-gray-700 mt-2">
                      {selectedResult.interpretation ||
                        "Aucune interprétation disponible pour ce test. Veuillez consulter votre psychologue pour plus d'informations."}
                    </p>
                  </div>
                </div>

                {rapport.description && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-md font-medium text-gray-800 mb-2">
                      Notes complémentaires
                    </h3>
                    <p className="text-gray-700">{rapport.description}</p>
                  </div>
                )}
              </div>

              {/* Bouton d'action */}
              <div className="px-6 py-4 bg-gray-50 flex justify-center">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/dashboardEtudiant/${params.userId}/prendre-rendez-vous`
                    )
                  }
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-md"
                >
                  Prendre rendez-vous pour discuter des résultats
                </button>
              </div>
            </div>
          )}

          {!selectedResult && (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-600">
                Aucun résultat de test disponible.
              </p>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center text-gray-500 text-sm mt-6">
            <p>
              Pour toute question concernant vos résultats, n'hésitez pas à
              contacter votre psychologue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
