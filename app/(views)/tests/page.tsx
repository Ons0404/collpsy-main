"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TestPsychologique,
  CategorieTest,
} from "../../(mvc)/types/test-psychologique";
import {
  Book,
  Clock,
  Heart,
  Brain,
  Layers,
  Star,
  Archive,
  Timer,
  HeartPulse,
  Frown,
  BrainCircuit,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Focus,
  Smile,
  Zap,
  Gauge,
  Target,
  UserCheck,
  Sparkles,
  Scale,
  MoveHorizontal,
  Leaf,
  Coffee,
  Flame,
  Compass,
  SquareEqual,
  Award,
  Home,
  ChevronLeft,
} from "lucide-react";

// Configuration des catégories (gardé pour le filtrage)
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

// Mapping des tests spécifiques à des icônes personnalisées
const TEST_ICON_MAPPING: Record<string, React.ElementType> = {
  // Exemples pour ANXIETE
  "Test d'anxiété de Beck": HeartPulse,
  "Échelle d'anxiété de Hamilton": Gauge,
  "Test d'anxiété sociale": UserCheck,

  // Exemples pour DEPRESSION
  "Inventaire de dépression de Beck": Frown,
  "Échelle de dépression de Hamilton": Scale,
  "Test de dépression majeure": Layers,

  // Exemples pour STRESS
  "Échelle de stress perçu": Timer,
  "Test de burnout professionnel": Flame,
  "Évaluation du stress post-traumatique": Zap,

  // Exemples pour PERSONNALITE
  "Test MBTI": BrainCircuit,
  "Big Five Personality Test": Sparkles,
  "Évaluation des traits de personnalité": Target,

  // Exemples pour ORIENTATION_PROFESSIONNELLE
  "Test d'orientation professionnelle": Briefcase,
  "Évaluation des compétences professionnelles": GraduationCap,
  "Test de compatibilité de carrière": Compass,

  // Exemples pour APPRENTISSAGE
  "Test de style d'apprentissage": Book,
  "Évaluation des compétences cognitives": Brain,
  "Test de mémoire de travail": Lightbulb,

  // Exemples pour TDAH
  "Test de TDAH pour adultes": Focus,
  "Évaluation de l'attention": MoveHorizontal,
  "Test d'hyperactivité": SquareEqual,

  // Exemples pour BIEN_ETRE
  "Test de bien-être psychologique": Smile,
  "Évaluation de la satisfaction de vie": Leaf,
  "Test d'équilibre émotionnel": Coffee,
  "Échelle de résilience": Award,
};

// Fonction pour obtenir l'icône appropriée pour un test spécifique
const getTestIcon = (test: TestPsychologique): React.ElementType => {
  // Si le test a une icône spécifique, l'utiliser
  if (test.titre in TEST_ICON_MAPPING) {
    return TEST_ICON_MAPPING[test.titre];
  }

  // Sinon, utiliser l'icône de la catégorie par défaut
  return CATEGORY_CONFIG[test.categorie].icon;
};

export default function TestsList() {
  const [tests, setTests] = useState<TestPsychologique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    CategorieTest | "TOUS"
  >("TOUS");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch("/api/tests");
        if (!response.ok) throw new Error("Échec du chargement des tests");
        const data = await response.json();
        setTests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const filteredTests =
    selectedCategory === "TOUS"
      ? tests
      : tests.filter((test) => test.categorie === selectedCategory);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Bouton de retour */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-md transition-all hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Tests Psychologiques
          </h1>
          <div className="flex w-full max-w-xs items-center space-x-3">
            <label
              htmlFor="category-filter"
              className="sr-only text-sm font-medium text-gray-700"
            >
              Filtrer par catégorie
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as CategorieTest | "TOUS")
              }
              className="w-full rounded-lg border-gray-300 bg-white px-4 py-2 text-sm shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="TOUS">Toutes les catégories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="text-gray-500">
              Aucun test disponible{" "}
              {selectedCategory !== "TOUS" &&
                `dans la catégorie "${CATEGORY_CONFIG[selectedCategory].label}"`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map((test) => {
              const categoryConfig = CATEGORY_CONFIG[test.categorie];
              const TestIcon = getTestIcon(test);

              return (
                <Link href="/auth/login" key={test.id} className="group">
                  <div className="relative h-full transform rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="absolute -top-4 left-4 z-10">
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryConfig.color}`}
                      >
                        <TestIcon className="mr-2 h-4 w-4" />
                        {categoryConfig.label}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-3 flex items-center">
                        <TestIcon className="mr-3 h-6 w-6 text-gray-500" />
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                          {test.titre}
                        </h2>
                      </div>

                      {test.description && (
                        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
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
