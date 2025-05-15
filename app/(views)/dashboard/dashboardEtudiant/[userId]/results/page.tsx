"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Award,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  FileText,
} from "lucide-react";

interface Reponse {
  questionId: string;
  optionId: string | null;
  texteLibre: string | null;
  question: { texte: string; type: string };
  option: { texte: string; valeur: number } | null;
}

interface ResultatTest {
  id: string;
  testId: string;
  etudiantId: number;
  score: number;
  interpretation: string;
  datePassation: string;
  test: {
    titre: string;
    description: string | null;
    categorie: string;
    interpretation: string | null;
  };
  reponses: Reponse[];
}

interface Rapport {
  id: string;
  titre: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const psychologueId = searchParams.get("psychologueId") || "1"; // Par défaut, utiliser psychologueId=1

  const [results, setResults] = useState<ResultatTest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [selectedRapport, setSelectedRapport] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedResponses, setExpandedResponses] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    console.log(
      "Rendering ResultsPage with userId:",
      userId,
      "and psychologueId:",
      psychologueId
    );
    const fetchData = async () => {
      if (!userId || isNaN(Number(userId))) {
        setError("ID d'étudiant invalide ou manquant");
        setLoading(false);
        return;
      }

      try {
        // Fetch test results for the student
        const resultsResponse = await fetch(
          `/api/test-results?userId=${userId}&psychologueId=${psychologueId}`
        );
        if (!resultsResponse.ok) {
          const errorData = await resultsResponse.json();
          throw new Error(
            errorData.error || "Échec de la récupération des résultats"
          );
        }
        const resultsData = await resultsResponse.json();
        console.log("Results fetched:", resultsData);
        setResults(resultsData);

        // Fetch available rapports for this student
        const rapportsResponse = await fetch(
          `/api/etudiants/${userId}/rapports`
        );
        if (!rapportsResponse.ok) {
          const errorData = await rapportsResponse.json();
          throw new Error(
            errorData.error || "Échec de la récupération des rapports"
          );
        }
        const rapportsData = await rapportsResponse.json();
        setRapports(rapportsData);
        if (rapportsData.length > 0) {
          setSelectedRapport(rapportsData[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors de la récupération"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, psychologueId]);

  const handleAddToRapport = async (resultId: string) => {
    if (!selectedRapport) {
      toast.error("Veuillez sélectionner un rapport", {
        style: {
          background: "#fefcbf",
          color: "#d97706",
          border: "1px solid #d97706",
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/rapports/add-resultat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rapportId: selectedRapport,
          resultatId: resultId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de l'ajout au rapport");
      }

      toast.success("Résultat ajouté au rapport avec succès", {
        style: {
          background: "#c6f6d5",
          color: "#276749",
          border: "1px solid #276749",
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout au rapport",
        {
          style: {
            background: "#fed7d7",
            color: "#dc2626",
            border: "1px solid #dc2626",
          },
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRapport = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/etudiants/${userId}/rapports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre: `Rapport psychologique - ${new Date().toLocaleDateString()}`,
          description:
            "Rapport automatiquement créé à partir des résultats de tests psychologiques.",
          psychologueId: parseInt(psychologueId),
          etudiantId: parseInt(userId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la création du rapport");
      }

      const newRapport = await response.json();
      setRapports([...rapports, newRapport]);
      setSelectedRapport(newRapport.id);
      toast.success("Nouveau rapport créé avec succès", {
        style: {
          background: "#c6f6d5",
          color: "#276749",
          border: "1px solid #276749",
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création du rapport",
        {
          style: {
            background: "#fed7d7",
            color: "#dc2626",
            border: "1px solid #dc2626",
          },
        }
      );
    }
  };

  const toggleResponses = (resultId: string) => {
    setExpandedResponses((prev) => ({
      ...prev,
      [resultId]: !prev[resultId],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center">
            <Info className="h-5 w-5 mr-2" /> Erreur
          </h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() =>
              router.push(`/dashboard/dashboardEtudiant/${userId}/tests`)
            }
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            Retour aux tests
          </button>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-yellow-600 mb-2 flex items-center">
            <Info className="h-5 w-5 mr-2" /> Aucun résultat
          </h2>
          <p className="text-yellow-500 mb-4">
            Aucun résultat trouvé pour cet étudiant.
          </p>
          <button
            onClick={() =>
              router.push(`/dashboard/dashboardEtudiant/${userId}/tests`)
            }
            className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
          >
            Retour aux tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Award className="h-8 w-8 text-green-400 mr-2" />
            Vos résultats
          </h1>
          <button
            onClick={() =>
              router.push(`/dashboard/dashboardEtudiant/${userId}/tests`)
            }
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à mes tests
          </button>
        </div>

        {/* Rapport Selection Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FileText className="h-5 w-5 text-green-400 mr-2" />
            Ajouter les résultats à un rapport
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label
                htmlFor="rapport"
                className="block text-sm font-medium text-gray-600 mb-1chelles cliniques (ex. dépression, paranoïa) montrent des scores en T (moyenne 50, écart-type 10). Un score T supérieur à 65 sur une échelle peut indiquer des symptômes cliniques significatifs."
              >
                Sélectionner un rapport
              </label>
              <select
                id="rapport"
                value={selectedRapport}
                onChange={(e) => setSelectedRapport(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
              >
                <option value="" disabled>
                  Choisir un rapport
                </option>
                {rapports.map((rapport) => (
                  <option key={rapport.id} value={rapport.id}>
                    {rapport.titre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreateRapport}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              >
                Créer un nouveau rapport
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100"
          >
            {/* Test Title and Action */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Résultats du test {result.test.titre}
              </h2>
              <button
                onClick={() => handleAddToRapport(result.id)}
                disabled={isSaving || !selectedRapport}
                className={`px-4 py-2 rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSaving || !selectedRapport
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 focus:ring-green-400"
                }`}
              >
                {isSaving ? "Ajout en cours..." : "Ajouter au rapport"}
              </button>
            </div>

            {/* Score and Date */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="relative flex-shrink-0">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-green-400"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${(result.score / 100) * 251.2} 251.2`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dy=".3em"
                    className="text-2xl font-bold text-gray-800"
                  >
                    {result.score}
                  </text>
                </svg>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-10 text-sm text-gray-600">
                  Score obtenu
                </span>
              </div>
              <div className="flex flex-col space-y-2">
                <p className="text-gray-600 flex items-center">
                  <Clock className="h-5 w-5 text-green-400 mr-2" />
                  Test passé le{" "}
                  {new Date(result.datePassation).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-600">
                  Catégorie: {result.test.categorie}
                </p>
              </div>
            </div>

            {/* Interprétation générale (depuis la base de données) */}
            {result.test.interpretation && (
              <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                  <Info className="h-5 w-5 text-green-400 mr-2" />À propos de ce
                  test
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {result.test.interpretation}
                </p>
              </div>
            )}

            {/* Interprétation spécifique au résultat */}
            {result.interpretation && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                  <Award className="h-5 w-5 text-green-400 mr-2" />
                  Interprétation de votre résultat
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {result.interpretation}
                </p>
              </div>
            )}

            {/* Réponses */}
            <div className="mb-4">
              <button
                onClick={() => toggleResponses(result.id)}
                className="flex items-center text-green-500 hover:text-green-600 transition-colors focus:outline-none"
              >
                <h3 className="text-lg font-semibold mr-2">Réponses</h3>
                {expandedResponses[result.id] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedResponses[result.id] && (
                <ul className="mt-4 space-y-3">
                  {result.reponses.map((reponse, index) => (
                    <li key={index} className="text-gray-600">
                      <strong className="text-gray-800">
                        {reponse.question.texte}
                      </strong>
                      : {reponse.option?.texte || reponse.texteLibre || "N/A"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() =>
              router.push(`/dashboard/dashboardEtudiant/${userId}/tests`)
            }
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Retour aux tests
          </button>
          {selectedRapport && (
            <button
              onClick={() =>
                router.push(
                  `/dashboard/dashboardEtudiant/${userId}/rapports/${selectedRapport}`
                )
              }
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            >
              Voir le rapport
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
