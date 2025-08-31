"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import {
  Star,
  Calendar,
  MessageSquare,
  Heart,
  Ear,
  Brain,
  ThumbsUp,
  User,
  Clock,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import Progress from "../../../../../components/ui/progress";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";

interface Psychologue {
  id_psychologue: number;
}

interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "PSYCHOLOGUE" | "ETUDIANT";
  civilite: "M" | "Mme";
  avatar?: string | null;
  psychologue?: Psychologue;
}

interface Evaluation {
  id: string;
  consultationId: number;
  etudiantId: number;
  satisfaction: number;
  empathie?: number;
  ecoute?: number;
  comprehension?: number;
  recommandation?: number;
  commentaires?: string;
  createdAt: string;
  updatedAt: string;
  etudiant: { prenom: string; nom: string };
  consultation: { startTime: string };
}

interface Consultation {
  id: number;
  psychologueId: number;
  startTime: string;
}

const NoEvaluationsMessage = () => (
  <div className="text-center py-8">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
      <AlertCircle className="h-8 w-8 text-green-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900">
      Aucune évaluation disponible
    </h3>
    <p className="text-gray-600 mt-2">
      Aucune évaluation disponible pour le moment.
    </p>
  </div>
);

export default function EvaluationsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    averageSatisfaction: 0,
    totalEvaluations: 0,
    averageEmpathie: 0,
    averageEcoute: 0,
    averageComprehension: 0,
    averageRecommandation: 0,
  });
  const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(
    null
  );
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

  useEffect(() => {
    if (userData?.psychologue?.id_psychologue) {
      const fetchEvaluationsForPsychologue = async () => {
        try {
          const psychologueId = userData.psychologue?.id_psychologue;

          // Fetch consultations using the correct endpoint
          const consultationsResponse = await fetch(
            `/api/consultations/psychologue/${psychologueId}`
          );

          if (!consultationsResponse.ok) {
            const errorData = await consultationsResponse.json();
            if (consultationsResponse.status === 404) {
              setEvaluations([]); // No consultations found, show empty state
              return;
            }
            throw new Error(
              errorData.error || "Erreur lors du chargement des consultations"
            );
          }

          const consultations: Consultation[] =
            await consultationsResponse.json();

          // Fetch evaluations for each consultation
          const evaluationsPromises = consultations.map(
            async (consultation) => {
              try {
                const evalResponse = await fetch(
                  `/api/evaluation/${consultation.id}`
                );
                if (evalResponse.ok) {
                  return await evalResponse.json();
                }
                return null; // Skip if no evaluation exists
              } catch (err) {
                console.warn(
                  `Échec de récupération de l'évaluation pour la consultation ${consultation.id}`
                );
                return null;
              }
            }
          );

          const evaluationsResults = await Promise.all(evaluationsPromises);
          const fetchedEvaluations = evaluationsResults.filter(Boolean);

          setEvaluations(fetchedEvaluations);
          calculateStats(fetchedEvaluations);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Erreur inconnue lors des évaluations"
          );
        }
      };

      fetchEvaluationsForPsychologue();
    }
  }, [userData]);

  const calculateStats = (evaluations: Evaluation[]) => {
    if (evaluations.length === 0) return;

    const sum = (arr: (number | undefined)[]) =>
      arr.reduce((acc: number, val) => acc + (val || 0), 0);
    const avg = (arr: (number | undefined)[]) => {
      const filtered = arr.filter((val): val is number => val !== undefined);
      return filtered.length > 0 ? sum(filtered) / filtered.length : 0;
    };
    setStats({
      averageSatisfaction: avg(evaluations.map((e) => e.satisfaction)),
      totalEvaluations: evaluations.length,
      averageEmpathie: avg(evaluations.map((e) => e.empathie)),
      averageEcoute: avg(evaluations.map((e) => e.ecoute)),
      averageComprehension: avg(evaluations.map((e) => e.comprehension)),
      averageRecommandation: avg(evaluations.map((e) => e.recommandation)),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRatingColor = (rating: number | undefined) => {
    if (!rating) return "bg-gray-200";
    if (rating >= 4.5) return "bg-green-600";
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-green-400";
    if (rating >= 2) return "bg-yellow-400";
    return "bg-red-400";
  };

  const toggleExpand = (id: string) => {
    if (expandedEvaluation === id) {
      setExpandedEvaluation(null);
    } else {
      setExpandedEvaluation(id);
    }
  };

  if (loading)
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );

    if (error)
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="border border-red-600">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              Erreur: {error}
            </AlertDescription>
          </Alert>
        </div>
      );

  if (!userData) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="bg-green-50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-green-800">
                  Tableau de bord des évaluations
                </CardTitle>
                <CardDescription className="text-green-700">
                  Consultez et analysez les retours laissés par vos patients
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
                <div>
                  <div className="text-3xl font-bold text-green-800">
                    {stats.averageSatisfaction.toFixed(1)}
                  </div>
                  <div className="text-xs text-green-600">Note moyenne</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.totalEvaluations > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-green-800">
                    Résumé des évaluations
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        <span>Empathie</span>
                      </span>
                      <span className="font-medium">
                        {stats.averageEmpathie.toFixed(1)}/5
                      </span>
                    </div>
                    <Progress
                      value={stats.averageEmpathie * 20}
                      className="h-2"
                    />
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Ear className="h-4 w-4 text-green-600" />
                        <span>Écoute</span>
                      </span>
                      <span className="font-medium">
                        {stats.averageEcoute.toFixed(1)}/5
                      </span>
                    </div>
                    <Progress
                      value={stats.averageEcoute * 20}
                      className="h-2"
                    />
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-green-600" />
                        <span>Compréhension</span>
                      </span>
                      <span className="font-medium">
                        {stats.averageComprehension.toFixed(1)}/5
                      </span>
                    </div>
                    <Progress
                      value={stats.averageComprehension * 20}
                      className="h-2"
                    />
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span>Recommandation</span>
                      </span>
                      <span className="font-medium">
                        {stats.averageRecommandation.toFixed(1)}/5
                      </span>
                    </div>
                    <Progress
                      value={stats.averageRecommandation * 20}
                      className="h-2"
                    />
                  </div>
                </div>
                <div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">
                      Statistiques générales
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-sm text-green-600">
                          Total évaluations
                        </div>
                        <div className="text-2xl font-bold text-green-800">
                          {stats.totalEvaluations}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-sm text-green-600">
                          Note la plus fréquente
                        </div>
                        <div className="text-2xl font-bold text-green-800">
                          {evaluations.length > 0
                            ? Math.round(
                                evaluations
                                  .map((e) => e.satisfaction)
                                  .sort(
                                    (a, b) =>
                                      evaluations.filter(
                                        (e) => e.satisfaction === a
                                      ).length -
                                      evaluations.filter(
                                        (e) => e.satisfaction === b
                                      ).length
                                  )
                                  .pop() || 0
                              )
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NoEvaluationsMessage />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-xl text-green-800">
              Détail des évaluations
            </CardTitle>
            <CardDescription className="text-green-700">
              {evaluations.length} évaluation
              {evaluations.length !== 1 ? "s" : ""} reçue
              {evaluations.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {evaluations.length === 0 ? (
              <NoEvaluationsMessage />
            ) : (
              <div className="space-y-4">
                {evaluations.map((evaluation) => (
                  <Card
                    key={evaluation.id}
                    className={`border border-gray-200 hover:border-green-300 transition-all ${
                      expandedEvaluation === evaluation.id ? "shadow-md" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      <div
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleExpand(evaluation.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 text-green-800 p-2 rounded-full">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800">
                              {evaluation.etudiant?.prenom || "Inconnu"}{" "}
                              {evaluation.etudiant?.nom || "Inconnu"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatDate(evaluation.consultation.startTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <div className="flex items-center gap-1">
                              <Star
                                className="h-3 w-3 text-yellow-500"
                                fill="currentColor"
                              />
                              <span>{evaluation.satisfaction}/5</span>
                            </div>
                          </Badge>
                          {expandedEvaluation === evaluation.id ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                      {expandedEvaluation === evaluation.id && (
                        <div className="border-t border-gray-100 bg-green-50 p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            <div className="flex flex-col items-center bg-white p-2 rounded">
                              <span className="text-xs text-green-600">
                                Empathie
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold">
                                  {evaluation.empathie || "N/A"}
                                </span>
                                <Star
                                  className="h-3 w-3 text-yellow-500"
                                  fill="currentColor"
                                />
                              </div>
                              <div className="w-full mt-1">
                                <div
                                  className={`h-1 rounded-full ${getRatingColor(
                                    evaluation.empathie
                                  )}`}
                                  style={{
                                    width: `${
                                      ((evaluation.empathie || 0) / 5) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center bg-white p-2 rounded">
                              <span className="text-xs text-green-600">
                                Écoute
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold">
                                  {evaluation.ecoute || "N/A"}
                                </span>
                                <Star
                                  className="h-3 w-3 text-yellow-500"
                                  fill="currentColor"
                                />
                              </div>
                              <div className="w-full mt-1">
                                <div
                                  className={`h-1 rounded-full ${getRatingColor(
                                    evaluation.ecoute
                                  )}`}
                                  style={{
                                    width: `${
                                      ((evaluation.ecoute || 0) / 5) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center bg-white p-2 rounded">
                              <span className="text-xs text-green-600">
                                Compréhension
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold">
                                  {evaluation.comprehension || "N/A"}
                                </span>
                                <Star
                                  className="h-3 w-3 text-yellow-500"
                                  fill="currentColor"
                                />
                              </div>
                              <div className="w-full mt-1">
                                <div
                                  className={`h-1 rounded-full ${getRatingColor(
                                    evaluation.comprehension
                                  )}`}
                                  style={{
                                    width: `${
                                      ((evaluation.comprehension || 0) / 5) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center bg-white p-2 rounded">
                              <span className="text-xs text-green-600">
                                Recommandation
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="font-bold">
                                  {evaluation.recommandation || "N/A"}
                                </span>
                                <Star
                                  className="h-3 w-3 text-yellow-500"
                                  fill="currentColor"
                                />
                              </div>
                              <div className="w-full mt-1">
                                <div
                                  className={`h-1 rounded-full ${getRatingColor(
                                    evaluation.recommandation
                                  )}`}
                                  style={{
                                    width: `${
                                      ((evaluation.recommandation || 0) / 5) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          {evaluation.commentaires && (
                            <div className="bg-white p-3 rounded border border-green-100 mt-2">
                              <div className="flex items-center gap-2 mb-1 text-green-700">
                                <MessageSquare className="h-4 w-4" />
                                <span className="font-medium">
                                  Commentaires
                                </span>
                              </div>
                              <p className="text-gray-700">
                                {evaluation.commentaires}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-green-50 text-sm text-green-700 justify-center py-3 border-t border-green-100">
            Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
