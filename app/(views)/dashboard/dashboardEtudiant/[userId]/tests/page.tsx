"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  TestPsychologique,
  CategorieTest,
} from "../../../../../(mvc)/types/test-psychologique";
import {
  Book,
  Clock,
  Heart,
  Brain,
  Layers,
  Star,
  Archive,
  Timer,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORY_CONFIG: Record<
  CategorieTest,
  { icon: React.ElementType; label: string; color: string }
> = {
  [CategorieTest.ANXIETE]: {
    icon: Heart,
    label: "Anxiété & Stress",
    color: "bg-rose-100 text-rose-800",
  },
  [CategorieTest.DEPRESSION]: {
    icon: Layers,
    label: "Dépression",
    color: "bg-blue-100 text-blue-800",
  },
  [CategorieTest.STRESS]: {
    icon: Timer,
    label: "Stress",
    color: "bg-yellow-100 text-yellow-800",
  },
  [CategorieTest.PERSONNALITE]: {
    icon: Brain,
    label: "Personnalité",
    color: "bg-green-100 text-green-800",
  },
  [CategorieTest.ORIENTATION_PROFESSIONNELLE]: {
    icon: Archive,
    label: "Carrière",
    color: "bg-indigo-100 text-indigo-800",
  },
  [CategorieTest.APPRENTISSAGE]: {
    icon: Book,
    label: "Apprentissage",
    color: "bg-purple-100 text-purple-800",
  },
  [CategorieTest.TDAH]: {
    icon: Clock,
    label: "TDAH",
    color: "bg-orange-100 text-orange-800",
  },
  [CategorieTest.BIEN_ETRE]: {
    icon: Star,
    label: "Bien-être",
    color: "bg-teal-100 text-teal-800",
  },
};

interface Rapport {
  id: string;
  etudiantId: number;
  psychologueId: number;
  titre: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  resultatTests: {
    id: string;
    testId: string;
    score: number;
    interpretation?: string;
    datePassation: string;
  }[];
}

export default function TestsList() {
  const params = useParams();
  const router = useRouter();
  const [tests, setTests] = useState<TestPsychologique[]>([]);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    CategorieTest | "TOUS"
  >("TOUS");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tests
        const testsResponse = await fetch("/api/tests");
        if (!testsResponse.ok) throw new Error("Échec du chargement des tests");
        const testsData = await testsResponse.json();
        // Debug: Log test categories to verify API data
        console.log(
          "Tests fetched:",
          testsData.map((t: TestPsychologique) => ({
            titre: t.titre,
            categorie: t.categorie,
          }))
        );
        setTests(testsData);

        // Fetch rapports
        const rapportsResponse = await fetch(
          `/api/etudiants/${params.userId}/rapports`
        );
        if (!rapportsResponse.ok)
          throw new Error("Échec du chargement des rapports");
        const rapportsData = await rapportsResponse.json();
        setRapports(rapportsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.userId]);

  const handleViewResults = () => {
    if (rapports.length === 0) {
      toast.error("Aucun résultat disponible pour le moment.", {
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
      return;
    }

    const latestRapport = rapports.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
    router.push(
      `/dashboard/dashboardEtudiant/${params.userId}/results/${latestRapport.id}`
    );
  };

  const handleBack = () => {
    router.push(`/dashboard/dashboardEtudiant/${params.userId}`);
  };

  const filteredTests =
    selectedCategory === "TOUS"
      ? tests
      : tests.filter((test) => test.categorie === selectedCategory);

  if (!params || typeof params !== "object" || !("userId" in params)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-red-600">Erreur</h2>
            <p className="mt-2 text-sm text-gray-600">
              Paramètre userId manquant
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Structure d'URL requise:
              /dashboard/dashboardEtudiant/[userId]/tests
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-blue-600 border-gray-200"></div>
          <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 text-sm text-gray-600">
            Chargement...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-red-600">Erreur</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Retour au tableau de bord</span>
        </button>

        {/* Header */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Tests Psychologiques
          </h1>
          <div className="flex w-full max-w-md items-center space-x-3">
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as CategorieTest | "TOUS")
              }
              className="w-full rounded-lg border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="TOUS">Toutes les catégories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleViewResults}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                rapports.length > 0
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={rapports.length === 0}
            >
              Voir les résultats
            </button>
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <p className="text-gray-500 text-lg">
              Aucun test disponible{" "}
              {selectedCategory !== "TOUS" &&
                `dans la catégorie "${
                  CATEGORY_CONFIG[selectedCategory]?.label || "Inconnue"
                }"`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map((test) => {
              // Ensure category exists in CATEGORY_CONFIG, fallback if not found
              const categoryConfig = CATEGORY_CONFIG[test.categorie] || {
                icon: Star,
                label: "Inconnue",
                color: "bg-gray-100 text-gray-800",
              };
              const CategoryIcon = categoryConfig.icon;

              // Debug: Log category for each test to verify rendering
              console.log(
                `Rendering test: ${test.titre}, Category: ${test.categorie}, Config:`,
                categoryConfig
              );

              return (
                <Link
                  href={`/dashboard/dashboardEtudiant/${params.userId}/tests/${test.id}`}
                  key={test.id}
                  className="group"
                >
                  <div className="relative h-full transform rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100">
                    <div className="absolute -top-3 left-4 z-10">
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryConfig.color}`}
                      >
                        <CategoryIcon className="mr-2 h-4 w-4" />
                        {categoryConfig.label}
                      </div>
                    </div>
                    <div className="mt-6">
                      <h2 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {test.titre}
                      </h2>
                      {test.description && (
                        <p className="mb-4 line-clamp-3 text-sm text-gray-600 leading-relaxed">
                          {test.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{test.dureeEstimee} min</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Layers className="h-4 w-4" />
                          <span>{test.questions.length} questions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
