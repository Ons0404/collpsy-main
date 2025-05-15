import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  AlertCircle,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Users,
} from "lucide-react";

// Import type definitions
import {
  PsychologistRating,
  RegionStats,
  ResponseTimeStats,
  Psychologist,
  PsychologistCriteria,
} from "./psychologue-static-types";

// Nouvelle palette de couleurs professionnelle
const COLORS = {
  satisfaction: "#2E7D32", // Vert foncé - Satisfaction
  empathie: "#0288D1", // Bleu vif - Empathie
  ecoute: "#7B1FA2", // Violet profond - Écoute
  comprehension: "#F57C00", // Orange foncé - Compréhension
  recommandation: "#D32F2F", // Rouge foncé - Recommandation
  regions: [
    "#1976D2", // Bleu principal
    "#FF8F00", // Orange vif
    "#388E3C", // Vert moyen
    "#D81B60", // Rose foncé
    "#512DA8", // Violet
    "#455A64", // Gris-bleu
    "#FBC02D", // Jaune moutarde
    "#616161", // Gris foncé
  ],
  primary: "#1565C0", // Bleu professionnel
  secondary: "#26A69A", // Cyan-vert
  accent: "#FFB300", // Jaune ambre
  neutral: "#607D8B", // Gris-bleu neutre
  success: "#4CAF50", // Vert succès
  warning: "#FF9800", // Orange avertissement
  error: "#D32F2F", // Rouge erreur
  info: "#0288D1", // Bleu info
};

// Formatage des nombres
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fr-FR").format(num);
};

const formatDecimal = (num: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num);
};

// Couleur selon la note
const getRatingColor = (value: number): string => {
  if (value >= 4.5) return COLORS.success;
  if (value >= 4.0) return COLORS.accent;
  if (value >= 3.5) return COLORS.info;
  if (value >= 3.0) return COLORS.warning;
  return COLORS.error;
};

// Tooltip personnalisée
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {formatDecimal(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Validation des données
const validateData = <T,>(data: any[], type: string): T[] => {
  if (!Array.isArray(data)) {
    console.error(`Invalid ${type} data: not an array`);
    return [];
  }
  return data.filter((item) => {
    if (!item) return false;
    switch (type) {
      case "psychologists":
        return item.id && item.name;
      case "ratings":
        return (
          item.id &&
          item.name &&
          typeof item.overallRating === "number" &&
          item.criteria &&
          Object.values(item.criteria).every((val) => typeof val === "number")
        );
      case "regionStats":
        return (
          item.region &&
          typeof item.psychologistCount === "number" &&
          typeof item.averageRating === "number" &&
          typeof item.averageResponseTime === "number" &&
          typeof item.consultationCount === "number"
        );
      case "responseTimeStats":
        return item.period && typeof item.averageTime === "number";
      default:
        return true;
    }
  });
};

export default function PsychologueStatistics() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [psychologistStats, setPsychologistStats] = useState<any[]>([]);
  const [responseTimeStats, setResponseTimeStats] = useState<
    ResponseTimeStats[]
  >([]);
  const [ratings, setRatings] = useState<PsychologistRating[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<"all" | "top" | "recent">("all");

  // Fonction de récupération des données
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        psychologistsData,
        statsData,
        responseTimeData,
        ratingsData,
        regionData,
      ] = await Promise.all([
        fetch("/api/psychologists").then((res) => res.json()),
        fetch("/api/stats/psychologue").then((res) => res.json()),
        fetch("/api/stats/responses-time").then((res) => res.json()),
        fetch("/api/stats/ratings").then((res) => res.json()),
        fetch("/api/stats/regions").then((res) => res.json()),
      ]);

      // Validation des données
      setPsychologists(
        validateData<Psychologist>(psychologistsData, "psychologists")
      );
      setPsychologistStats(validateData(statsData, "psychologistStats"));
      setResponseTimeStats(
        validateData<ResponseTimeStats>(responseTimeData, "responseTimeStats")
      );
      setRatings(validateData<PsychologistRating>(ratingsData, "ratings"));
      setRegionStats(validateData<RegionStats>(regionData, "regionStats"));

      setLastUpdated(new Date());
    } catch (err) {
      setError(
        "Erreur lors de la récupération des données. Veuillez réessayer."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculs pour les graphiques
  const averageRating = ratings.length
    ? ratings.reduce((sum, psych) => sum + psych.overallRating, 0) /
      ratings.length
    : 0;

  const averageResponseTime = regionStats.length
    ? regionStats.reduce((sum, region) => sum + region.averageResponseTime, 0) /
      regionStats.length
    : 0;

  const totalConsultations = regionStats.reduce(
    (sum, region) => sum + region.consultationCount,
    0
  );

  const regionDistributionData = [...regionStats]
    .sort((a, b) => b.psychologistCount - a.psychologistCount)
    .slice(0, 6)
    .map((region) => ({
      name: region.region,
      value: region.psychologistCount,
    }));

  const ratingsByCriteriaData = ratings.length
    ? [
        {
          name: "Satisfaction",
          value:
            ratings.reduce(
              (sum, psych) => sum + psych.criteria.satisfaction,
              0
            ) / ratings.length,
          fill: COLORS.satisfaction,
        },
        {
          name: "Empathie",
          value:
            ratings.reduce((sum, psych) => sum + psych.criteria.empathie, 0) /
            ratings.length,
          fill: COLORS.empathie,
        },
        {
          name: "Écoute",
          value:
            ratings.reduce((sum, psych) => sum + psych.criteria.ecoute, 0) /
            ratings.length,
          fill: COLORS.ecoute,
        },
        {
          name: "Compréhension",
          value:
            ratings.reduce(
              (sum, psych) => sum + psych.criteria.comprehension,
              0
            ) / ratings.length,
          fill: COLORS.comprehension,
        },
        {
          name: "Recommandation",
          value:
            ratings.reduce(
              (sum, psych) => sum + psych.criteria.recommandation,
              0
            ) / ratings.length,
          fill: COLORS.recommandation,
        },
      ]
    : [];

  const getFilteredRatings = () => {
    if (filterType === "all") return ratings;
    if (filterType === "top")
      return [...ratings]
        .sort((a, b) => b.overallRating - a.overallRating)
        .slice(0, 10);
    if (filterType === "recent") return [...ratings].slice(0, 10);
    return ratings;
  };

  const filteredRatings = getFilteredRatings();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-red-50 border border-red-300 rounded-lg p-8 max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={28} />
            <h2 className="text-2xl font-semibold text-red-800">Erreur</h2>
          </div>
          <p className="text-red-700 mb-6">{error}</p>
          <Button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              
            </h1>
            <p className="text-gray-600 mt-2">
              Dernière mise à jour:{" "}
              {lastUpdated?.toLocaleString("fr-FR") || "N		"}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={fetchData}
              className="border-gray-300"
            >
              <RefreshCw className="mr-2 h-5 w-5" /> Actualiser
            </Button>
            <Button variant="outline" className="border-gray-300">
              <Download className="mr-2 h-5 w-5" /> Exporter
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Psychologues Enregistrés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="text-primary mr-3" size={30} />
                <div className="text-3xl font-bold text-gray-900">
                  {formatNumber(psychologists.length)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <p className="text-xs text-gray-500">
                Professionnels disponibles
              </p>
            </CardFooter>
          </Card>

          <Card
            className="border-l-4 shadow-lg hover:shadow-xl transition-all"
            style={{ borderLeftColor: getRatingColor(averageRating) }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Note Moyenne Globale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div
                  className="flex items-center justify-center rounded-full w-8 h-8 mr-3"
                  style={{ backgroundColor: getRatingColor(averageRating) }}
                >
                  <span className="text-white text-sm font-bold">★</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatDecimal(averageRating)}{" "}
                  <span className="text-xl text-gray-500">/5</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <p className="text-xs text-gray-500">
                Basée sur{" "}
                {formatNumber(
                  ratings.reduce((sum, r) => sum + r.evaluationCount, 0)
                )}{" "}
                évaluations
              </p>
            </CardFooter>
          </Card>

          <Card
            className="border-l-4 shadow-lg hover:shadow-xl transition-all"
            style={{ borderLeftColor: COLORS.accent }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Régions Couvertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex items-center justify-center rounded-full w-8 h-8 bg-accent mr-3">
                  <span className="text-white text-sm font-bold">FR</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {regionStats.length}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <p className="text-xs text-gray-500">Couverture nationale</p>
            </CardFooter>
          </Card>

          <Card
            className="border-l-4 shadow-lg hover:shadow-xl transition-all"
            style={{ borderLeftColor: COLORS.info }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Temps de Réponse Moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="text-info mr-3" size={30} />
                <div className="text-3xl font-bold text-gray-900">
                  {formatDecimal(averageResponseTime)}{" "}
                  <span className="text-xl text-gray-500">h</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <p className="text-xs text-gray-500">
                Temps moyen de première réponse
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Répartition par Région
              </CardTitle>
              <CardDescription>
                Concentration des psychologues par région
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {regionDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS.regions[index % COLORS.regions.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                Les {regionDistributionData.length} régions avec le plus grand
                nombre de psychologues
              </p>
            </CardFooter>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Évaluations par Critère
              </CardTitle>
              <CardDescription>
                Performance moyenne sur les critères d'évaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ratingsByCriteriaData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {ratingsByCriteriaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                Notes moyennes sur une échelle de 0 à 5
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Temps de réponse */}
        <div className="mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Évolution du Temps de Réponse
                  </CardTitle>
                  <CardDescription>
                    Temps de réponse moyen au fil du temps (en heures)
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Filter className="h-5 w-5 mr-2" /> Filtrer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={responseTimeStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averageTime"
                    name="Temps moyen (h)"
                    stroke={COLORS.primary}
                    activeDot={{ r: 10 }}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                Temps moyen entre le premier message et la réponse du
                psychologue
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Tableau des évaluations */}
        <div className="mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Évaluations des Psychologues
                  </CardTitle>
                  <CardDescription>
                    Détails des évaluations par professionnel
                  </CardDescription>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant={filterType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("all")}
                  >
                    Tous
                  </Button>
                  <Button
                    variant={filterType === "top" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("top")}
                  >
                    Top 10
                  </Button>
                  <Button
                    variant={filterType === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("recent")}
                  >
                    Récents
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-4">Nom</th>
                      <th className="px-6 py-4">Note Globale</th>
                      <th className="px-6 py-4">Satisfaction</th>
                      <th className="px-6 py-4">Empathie</th>
                      <th className="px-6 py-4">Écoute</th>
                      <th className="px-6 py-4">Compréhension</th>
                      <th className="px-6 py-4">Recommandation</th>
                      <th className="px-6 py-4">Nb. Évaluations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRatings.map((psychologist) => (
                      <tr
                        key={psychologist.id}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium">
                          {psychologist.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className="w-5 h-5 rounded-full mr-2"
                              style={{
                                backgroundColor: getRatingColor(
                                  psychologist.overallRating
                                ),
                              }}
                            ></div>
                            {formatDecimal(psychologist.overallRating)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {formatDecimal(psychologist.criteria.satisfaction)}
                        </td>
                        <td className="px-6 py-4">
                          {formatDecimal(psychologist.criteria.empathie)}
                        </td>
                        <td className="px-6 py-4">
                          {formatDecimal(psychologist.criteria.ecoute)}
                        </td>
                        <td className="px-6 py-4">
                          {formatDecimal(psychologist.criteria.comprehension)}
                        </td>
                        <td className="px-6 py-4">
                          {formatDecimal(psychologist.criteria.recommandation)}
                        </td>
                        <td className="px-6 py-4">
                          {formatNumber(psychologist.evaluationCount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <p className="text-xs text-gray-500">
                  Affichage de {filteredRatings.length} psychologues sur{" "}
                  {ratings.length}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Précédent
                  </Button>
                  <Button variant="outline" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Suivant
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Statistiques par région */}
        <div className="mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Statistiques par Région
              </CardTitle>
              <CardDescription>
                Comparaison détaillée des indicateurs par région
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-4">Région</th>
                      <th className="px-6 py-4">Nb. Psychologues</th>
                      <th className="px-6 py-4">Note Moyenne</th>
                      <th className="px-6 py-4">Temps de Réponse (h)</th>
                      <th className="px-6 py-4">Nb. Consultations</th>
                      <th className="px-6 py-4">% Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionStats.map((region) => (
                      <tr
                        key={region.region}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium">
                          {region.region}
                        </td>
                        <td className="px-6 py-4">
                          {formatNumber(region.psychologistCount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className="w-5 h-5 rounded-full mr-2"
                              style={{
                                backgroundColor: getRatingColor(
                                  region.averageRating
                                ),
                              }}
                            ></div>
                            {formatDecimal(region.averageRating)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {formatDecimal(region.averageResponseTime)}
                        </td>
                        <td className="px-6 py-4">
                          {formatNumber(region.consultationCount)}
                        </td>
                        <td className="px-6 py-4">
                          {totalConsultations > 0
                            ? `${(
                                (region.consultationCount /
                                  totalConsultations) *
                                100
                              ).toFixed(1)}%`
                            : "0%"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                Total de {formatNumber(totalConsultations)} consultations
                réalisées sur l'ensemble des régions
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm py-6">
          <p>
            Tableau de bord développé pour le suivi des psychologues - © 2025
            Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
