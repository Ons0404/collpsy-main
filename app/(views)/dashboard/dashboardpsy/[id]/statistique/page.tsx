"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import {
  BarChart2,
  Users,
  Calendar,
  Star,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  PieChart,
  ListChecks,
  UserPlus,
  Repeat,
  ThumbsUp,
  MessageSquare,
  Brain,
  FileText,
  BarChart,
  Heart,
  Target,
  Award,
  Activity,
  HelpCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  BarChart as RechartBarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Interfaces pour les données statistiques
interface TotalConsultations {
  totalConsultations: number;
}
interface DureeMoyenne {
  dureeMoyenneMinutes: number;
}
interface RepartitionTypes {
  types: { type: string; nombre: number }[];
}
interface RepartitionStatuts {
  statuts: { statut: string; nombre: number }[];
}
interface NouveauxPatients {
  nouveauxPatients: number;
}
interface ConsultationsMoyennesPatient {
  consultationsMoyennesParPatient: number;
}
interface ComptesRendezVous {
  total: number;
  confirmes: number;
  annules: number;
  enAttente: number;
}
interface TauxAnnulation {
  tauxAnnulation: number;
}
interface SatisfactionMoyenne {
  satisfactionMoyenne: number;
}
interface DetailsMoyensEvaluation {
  empathieMoyenne: number;
  ecouteMoyenne: number;
  comprehensionMoyenne: number;
}
interface TotalEvaluations {
  totalEvaluations: number;
}
interface TotalReclamations {
  totalReclamationsConcernees: number;
}

// Interfaces pour les composants
interface TrendData {
  period: number;
  value: number;
}

interface Tendances {
  consultations: TrendData[];
  patients: TrendData[];
  satisfaction: TrendData[];
  duree: TrendData[];
}

interface StatCardProps {
  title: string;
  value: number | string | undefined;
  icon: React.ReactNode;
  unit?: string;
  description?: string;
  isLoading: boolean;
  color?: string;
  trend?: number | null;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

interface ChartData {
  period?: number;
  name?: string;
  value: number;
}

interface StatCardWithChartProps {
  title: string;
  value: number | string | undefined;
  icon: React.ReactNode;
  unit?: string;
  isLoading: boolean;
  color?: string;
  data: ChartData[];
  chartType?: "line" | "bar" | "pie";
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

// Données de tendance fictives pour démonstration
const generateTrendData = (
  currentVal: number,
  periods: number
): TrendData[] => {
  const result: TrendData[] = [];
  let base = Math.max(
    0,
    currentVal - Math.floor(Math.random() * (currentVal * 0.3))
  );

  for (let i = 0; i < periods; i++) {
    const fluctuation = Math.random() * 0.15 * base;
    const direction = Math.random() > 0.5 ? 1 : -1;

    base = Math.max(0, base + direction * fluctuation);

    const value = i === periods - 1 ? currentVal : Math.round(base);

    result.push({
      period: i,
      value: value,
    });
  }

  return result;
};

// Couleurs pour les graphiques
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

type Periode = "semaine" | "mois" | "annee" | "tout";

const StatCard = ({
  title,
  value,
  icon,
  unit = "",
  description,
  isLoading,
  color = "#4CAF50",
  trend = null,
  onClick,
}: StatCardProps) => (
  <Card
    className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
      onClick ? "cursor-pointer" : ""
    }`}
    {...(onClick ? { onClick } : {})}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </CardTitle>
      <div
        className="rounded-full p-2"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
      ) : (
        <div className="flex flex-col">
          <div className="text-2xl font-bold" style={{ color }}>
            {value ?? "N/A"} {unit}
          </div>
          {trend !== null && (
            <div className="flex items-center mt-1">
              {trend > 0 ? (
                <TrendingUp size={16} className="text-green-500 mr-1" />
              ) : (
                <TrendingDown size={16} className="text-red-500 mr-1" />
              )}
              <span
                className={`text-xs ${
                  trend > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {Math.abs(trend)}% {trend > 0 ? "augmentation" : "diminution"}
              </span>
            </div>
          )}
        </div>
      )}
      {description && !isLoading && (
        <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
          {description}
        </p>
      )}
    </CardContent>
  </Card>
);

const StatCardWithChart = ({
  title,
  value,
  icon,
  unit = "",
  isLoading,
  color = "#4CAF50",
  data,
  chartType = "line",
  onClick,
}: StatCardWithChartProps) => (
  <Card
    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
    {...(onClick ? { onClick } : {})}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </CardTitle>
      <div
        className="rounded-full p-2"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
      ) : (
        <div className="flex flex-col">
          <div className="text-2xl font-bold mb-2" style={{ color }}>
            {value ?? "N/A"} {unit}
          </div>
          <div className="h-32 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="period" tick={false} />
                  <YAxis hide />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : chartType === "bar" ? (
                <RechartBarChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.2}
                    vertical={false}
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                </RechartBarChart>
              ) : (
                <RechartPieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </RechartPieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function StatistiquesPsychologuePage() {
  const params = useParams();
  const psychologueId = params.id as string;
  const [periode, setPeriode] = useState<Periode>("mois");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("apercu");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // États pour chaque statistique
  const [totalConsultations, setTotalConsultations] =
    useState<TotalConsultations | null>(null);
  const [dureeMoyenne, setDureeMoyenne] = useState<DureeMoyenne | null>(null);
  const [repartitionTypes, setRepartitionTypes] =
    useState<RepartitionTypes | null>(null);
  const [repartitionStatuts, setRepartitionStatuts] =
    useState<RepartitionStatuts | null>(null);
  const [nouveauxPatients, setNouveauxPatients] =
    useState<NouveauxPatients | null>(null);
  const [consultationsMoyennes, setConsultationsMoyennes] =
    useState<ConsultationsMoyennesPatient | null>(null);
  const [comptesRdv, setComptesRdv] = useState<ComptesRendezVous | null>(null);
  const [tauxAnnulation, setTauxAnnulation] = useState<TauxAnnulation | null>(
    null
  );
  const [satisfactionMoyenne, setSatisfactionMoyenne] =
    useState<SatisfactionMoyenne | null>(null);
  const [detailsEvaluations, setDetailsEvaluations] =
    useState<DetailsMoyensEvaluation | null>(null);
  const [totalEvaluations, setTotalEvaluations] =
    useState<TotalEvaluations | null>(null);
  const [totalReclamations, setTotalReclamations] =
    useState<TotalReclamations | null>(null);

  // Données tendancielles générées
  const [tendances, setTendances] = useState<Tendances>({
    consultations: [],
    patients: [],
    satisfaction: [],
    duree: [],
  });

  const fetchDataForPeriode = useCallback(
    async (currentPeriode: Periode) => {
      if (!psychologueId) return;
      setLoading(true);
      setError(null);

      const fetchStat = async (
        endpoint: string,
        setter: (data: any) => void
      ) => {
        try {
          const res = await fetch(
            `/api/psychologists/${psychologueId}/statistiques/${endpoint}?periode=${currentPeriode}`,
            { cache: "no-store" } // Prevent caching to ensure fresh data
          );
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.details ||
                errorData.error ||
                `Erreur HTTP ${res.status} pour ${endpoint}`
            );
          }
          const data = await res.json();
          setter(data);
        } catch (e: any) {
          console.error(`Erreur pour ${endpoint}:`, e);
          setError((prevError) =>
            prevError
              ? `${prevError}\n${endpoint}: ${e.message}`
              : `${endpoint}: ${e.message}`
          );
          setter(null);
        }
      };

      await Promise.allSettled([
        fetchStat("consultations/total", setTotalConsultations),
        fetchStat("consultations/duree-moyenne", setDureeMoyenne),
        fetchStat("consultations/repartition-types", setRepartitionTypes),
        fetchStat("consultations/repartition-statuts", setRepartitionStatuts),
        fetchStat("patients/nouveaux", setNouveauxPatients),
        fetchStat("patients/consultations-moyennes", setConsultationsMoyennes),
        fetchStat("rendezvous/comptes", setComptesRdv),
        fetchStat("rendezvous/taux-annulation", setTauxAnnulation),
        fetchStat("evaluations/satisfaction-moyenne", setSatisfactionMoyenne),
        fetchStat("evaluations/details-moyens", setDetailsEvaluations),
        fetchStat("evaluations/total", setTotalEvaluations),
        fetchStat("reclamations/total-concernees", setTotalReclamations),
      ]);

      setLoading(false);
    },
    [psychologueId]
  );

  useEffect(() => {
    fetchDataForPeriode(periode);
  }, [periode, fetchDataForPeriode]);

  useEffect(() => {
    if (
      !loading &&
      totalConsultations &&
      dureeMoyenne &&
      satisfactionMoyenne &&
      nouveauxPatients
    ) {
      setTendances({
        consultations: generateTrendData(
          totalConsultations.totalConsultations,
          10
        ),
        patients: generateTrendData(nouveauxPatients.nouveauxPatients, 10),
        satisfaction: generateTrendData(
          Math.round(satisfactionMoyenne.satisfactionMoyenne * 10),
          10
        ).map((item) => ({
          ...item,
          value: item.value / 10,
        })),
        duree: generateTrendData(dureeMoyenne.dureeMoyenneMinutes, 10),
      });
    }
  }, [
    loading,
    totalConsultations,
    dureeMoyenne,
    satisfactionMoyenne,
    nouveauxPatients,
  ]);

  const handlePeriodeChange = (newPeriode: Periode) => {
    setPeriode(newPeriode);
  };

  const preparePieData = (
    data: { [key: string]: any }[],
    keyField: string,
    valueField: string
  ): ChartData[] => {
    return (
      data?.map((item) => ({
        name: item[keyField],
        value: item[valueField],
      })) || []
    );
  };

  const typesConsultationsData = preparePieData(
    repartitionTypes?.types || [],
    "type",
    "nombre"
  );

  const statutsConsultationsData = preparePieData(
    repartitionStatuts?.statuts || [],
    "statut",
    "nombre"
  );

  const evaluationsRadarData = detailsEvaluations
    ? [
        {
          subject: "Empathie",
          A: detailsEvaluations.empathieMoyenne,
          fullMark: 5,
        },
        {
          subject: "Écoute",
          A: detailsEvaluations.ecouteMoyenne,
          fullMark: 5,
        },
        {
          subject: "Compréhension",
          A: detailsEvaluations.comprehensionMoyenne,
          fullMark: 5,
        },
      ]
    : [];

  const rendezVousData = comptesRdv
    ? [
        { name: "Confirmés", value: comptesRdv.confirmes },
        { name: "Annulés", value: comptesRdv.annules },
        { name: "En attente", value: comptesRdv.enAttente },
      ]
    : [];

  if (!psychologueId) {
    return (
      <div className="p-4 text-red-500">ID du psychologue non trouvé.</div>
    );
  }

  const renderSelectedCardDetail = () => {
    switch (selectedCard) {
      case "consultations":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="mr-2 text-blue-500" />
              Détail des Consultations
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">
                  Évolution des consultations
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendances.consultations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        label={{
                          value: "Période",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Nombre",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Consultations"
                        stroke="#0088FE"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Répartition par type</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={typesConsultationsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {typesConsultationsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">
                  Évolution de la durée moyenne
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendances.duree}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        label={{
                          value: "Période",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Minutes",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Durée (min)"
                        stroke="#00C49F"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Répartition par statut</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart data={statutsConsultationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Nombre" fill="#8884d8" />
                    </RechartBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setSelectedCard(null)}
                variant="outline"
                className="text-blue-500 border-blue-500 hover:bg-blue-50"
              >
                Retour à l'aperçu
              </Button>
            </div>
          </div>
        );

      case "evaluations":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Star className="mr-2 text-yellow-500" />
              Détail des Évaluations
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">
                  Évolution de la satisfaction
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendances.satisfaction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        label={{
                          value: "Période",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                        label={{
                          value: "Note",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Satisfaction"
                        stroke="#FFBB28"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Analyse des compétences</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={evaluationsRadarData}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} />
                      <Radar
                        name="Compétences"
                        dataKey="A"
                        stroke="#FFBB28"
                        fill="#FFBB28"
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                <HelpCircle size={16} className="mr-1" />
                Conseils d'amélioration
              </h4>
              <ul className="list-disc ml-5 text-sm text-yellow-700 dark:text-yellow-300">
                <li>
                  Votre note d'empathie est{" "}
                  {detailsEvaluations?.empathieMoyenne ?? 0}/5.{" "}
                  {detailsEvaluations?.empathieMoyenne &&
                  detailsEvaluations.empathieMoyenne < 4
                    ? "Essayez de montrer plus d'empathie envers vos patients."
                    : "Excellent niveau d'empathie !"}
                </li>
                <li>
                  Votre note d'écoute est{" "}
                  {detailsEvaluations?.ecouteMoyenne ?? 0}/5.{" "}
                  {detailsEvaluations?.ecouteMoyenne &&
                  detailsEvaluations.ecouteMoyenne < 4
                    ? "Considérez des techniques d'écoute active."
                    : "Votre écoute est très appréciée !"}
                </li>
                <li>
                  Votre note de compréhension est{" "}
                  {detailsEvaluations?.comprehensionMoyenne ?? 0}/5.{" "}
                  {detailsEvaluations?.comprehensionMoyenne &&
                  detailsEvaluations.comprehensionMoyenne < 4
                    ? "Reformulez plus souvent pour vérifier votre compréhension."
                    : "Les patients estiment que vous comprenez bien leurs situations !"}
                </li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setSelectedCard(null)}
                variant="outline"
                className="text-yellow-500 border-yellow-500 hover:bg-yellow-50"
              >
                Retour à l'aperçu
              </Button>
            </div>
          </div>
        );

      case "rendezVous":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Calendar className="mr-2 text-teal-500" />
              Détail des Rendez-vous
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">
                  Répartition des rendez-vous
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={rendezVousData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        <Cell fill="#4CAF50" />
                        <Cell fill="#F44336" />
                        <Cell fill="#FFC107" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Analyse des annulations</h4>
                <div className="h-64 flex flex-col justify-center">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-red-500">
                      {tauxAnnulation
                        ? `${tauxAnnulation.tauxAnnulation.toFixed(0)}%`
                        : "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Taux d'annulation
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-4">
                    <div
                      className="bg-red-500 rounded-full h-4"
                      style={{
                        width: `${
                          tauxAnnulation ? tauxAnnulation.tauxAnnulation : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {tauxAnnulation && tauxAnnulation.tauxAnnulation > 20
                      ? "Taux d'annulation élevé. Considérez d'envoyer des rappels ou de revoir votre politique d'annulation."
                      : "Bon taux de présence. Continuez ainsi !"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-teal-800 dark:text-teal-200 mb-2 flex items-center">
                <Target size={16} className="mr-1" />
                Recommandations
              </h4>
              <ul className="list-disc ml-5 text-sm text-teal-700 dark:text-teal-300">
                <li>
                  Envoyez des rappels 24h avant les rendez-vous pour réduire les
                  annulations
                </li>
                <li>
                  Proposez des plages horaires flexibles pour accommoder
                  différents emplois du temps
                </li>
                <li>Expliquez l'importance de la régularité des séances</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setSelectedCard(null)}
                variant="outline"
                className="text-teal-500 border-teal-500 hover:bg-teal-50"
              >
                Retour à l'aperçu
              </Button>
            </div>
          </div>
        );

      case "patients":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Users className="mr-2 text-purple-500" />
              Détail des Patients
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">
                  Évolution des nouveaux patients
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendances.patients}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        label={{
                          value: "Période",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Nombre",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Nouveaux patients"
                        stroke="#9C27B0"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  Consultations par patient
                </h4>
                <div className="h-64 flex flex-col justify-center">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-purple-500">
                      {consultationsMoyennes
                        ? consultationsMoyennes.consultationsMoyennesParPatient.toFixed(
                            1
                          )
                        : "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Séances moyennes par patient
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>1</span>
                    <span>10+</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-4">
                    <div
                      className="bg-purple-500 rounded-full h-4"
                      style={{
                        width: `${
                          consultationsMoyennes
                            ? Math.min(
                                consultationsMoyennes.consultationsMoyennesParPatient *
                                  10,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {consultationsMoyennes &&
                    consultationsMoyennes.consultationsMoyennesParPatient < 3
                      ? "Fidélisation faible. Améliorez le suivi des patients."
                      : "Bonne fidélisation. Vos patients vous font confiance sur la durée."}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                <Brain size={16} className="mr-1" />
                Analyse comportementale
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                {nouveauxPatients && nouveauxPatients.nouveauxPatients > 10
                  ? "Votre cabinet attire régulièrement de nouveaux patients. Votre réputation se développe."
                  : "Le flux de nouveaux patients est modéré. Envisagez des actions pour améliorer votre visibilité."}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {consultationsMoyennes &&
                consultationsMoyennes.consultationsMoyennesParPatient > 5
                  ? "Vos patients reviennent régulièrement, indiquant une bonne relation thérapeutique."
                  : "Le nombre moyen de consultations suggère des thérapies courtes ou des abandons précoces."}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setSelectedCard(null)}
                variant="outline"
                className="text-purple-500 border-purple-500 hover:bg-purple-50"
              >
                Retour à l'aperçu
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedCard) {
    return (
      <div className="container mx-auto px-4 py-6">
        {renderSelectedCardDetail()}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">
          Statistiques du Psychologue
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={periode === "semaine" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodeChange("semaine")}
          >
            Cette semaine
          </Button>
          <Button
            variant={periode === "mois" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodeChange("mois")}
          >
            Ce mois
          </Button>
          <Button
            variant={periode === "annee" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodeChange("annee")}
          >
            Cette année
          </Button>
          <Button
            variant={periode === "tout" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodeChange("tout")}
          >
            Tout
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="mr-2 mt-0.5" />
            <div>
              <h3 className="font-bold">
                Erreur lors du chargement des données
              </h3>
              <p className="text-sm whitespace-pre-line">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="apercu">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCardWithChart
              title="Consultations totales"
              value={totalConsultations?.totalConsultations}
              icon={<FileText size={16} className="text-blue-500" />}
              isLoading={loading}
              color="#0088FE"
              data={tendances.consultations}
              chartType="line"
              onClick={() => setSelectedCard("consultations")}
            />
            <StatCardWithChart
              title="Nouveaux patients"
              value={nouveauxPatients?.nouveauxPatients}
              icon={<Users size={16} className="text-purple-500" />}
              isLoading={loading}
              color="#9C27B0"
              data={tendances.patients}
              chartType="line"
              onClick={() => setSelectedCard("patients")}
            />
            <StatCardWithChart
              title="Satisfaction moyenne"
              value={satisfactionMoyenne?.satisfactionMoyenne.toFixed(1)}
              unit="/5"
              icon={<Star size={16} className="text-yellow-500" />}
              isLoading={loading}
              color="#FFBB28"
              data={tendances.satisfaction}
              chartType="line"
              onClick={() => setSelectedCard("evaluations")}
            />
            <StatCardWithChart
              title="Rendez-vous"
              value={comptesRdv?.total}
              icon={<Calendar size={16} className="text-teal-500" />}
              isLoading={loading}
              color="#00C49F"
              data={rendezVousData}
              chartType="pie"
              onClick={() => setSelectedCard("rendezVous")}
            />
            <StatCard
              title="Durée moyenne de consultation"
              value={dureeMoyenne?.dureeMoyenneMinutes}
              unit="min"
              icon={<Clock size={16} className="text-indigo-500" />}
              isLoading={loading}
              color="#673AB7"
              trend={dureeMoyenne ? 5 : null}
            />
            <StatCard
              title="Taux d'annulation"
              value={
                tauxAnnulation
                  ? `${tauxAnnulation.tauxAnnulation.toFixed(0)}`
                  : "N/A"
              }
              unit="%"
              icon={<AlertTriangle size={16} className="text-red-500" />}
              isLoading={loading}
              color="#F44336"
              trend={tauxAnnulation ? -2 : null}
            />
            <StatCard
              title="Consultations par patient"
              value={consultationsMoyennes?.consultationsMoyennesParPatient.toFixed(
                1
              )}
              icon={<Repeat size={16} className="text-green-500" />}
              isLoading={loading}
              color="#4CAF50"
              trend={consultationsMoyennes ? 8 : null}
            />
            <StatCard
              title="Réclamations"
              value={totalReclamations?.totalReclamationsConcernees}
              icon={<MessageSquare size={16} className="text-amber-500" />}
              isLoading={loading}
              color="#FF9800"
              trend={totalReclamations ? -10 : null}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity size={18} className="mr-2 text-blue-500" />
                  Évolution des consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="h-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendances.consultations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        label={{
                          value: "Période",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Nombre",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Consultations"
                        stroke="#0088FE"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart size={18} className="mr-2 text-purple-500" />
                  Types de consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="h-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={typesConsultationsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {typesConsultationsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ListChecks size={18} className="mr-2 text-teal-500" />
                  Statuts des consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="h-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart data={statutsConsultationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Nombre" fill="#00C49F" />
                    </RechartBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus size={18} className="mr-2 text-indigo-500" />
                  Nouveaux patients
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="h-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendances.patients}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        label={{
                          value: "Période",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        label={{
                          value: "Nombre",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Nouveaux patients"
                        stroke="#673AB7"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star size={18} className="mr-2 text-yellow-500" />
                  Évolution de la satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="h-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendances.satisfaction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        label={{
                          value: "Période",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                        label={{
                          value: "Note",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Satisfaction"
                        stroke="#FFBB28"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award size={18} className="mr-2 text-red-500" />
                  Analyse des compétences
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="h-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      data={evaluationsRadarData}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} />
                      <Radar
                        name="Compétences"
                        dataKey="A"
                        stroke="#F44336"
                        fill="#F44336"
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                Évaluation basée sur {totalEvaluations?.totalEvaluations || 0}{" "}
                avis
              </CardFooter>
            </Card>

            <Card className="shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart size={18} className="mr-2 text-green-500" />
                  Conseils pour améliorer la satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <ThumbsUp className="h-8 w-8 text-green-500 mb-2" />
                    <h4 className="font-semibold mb-2">Points forts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {detailsEvaluations
                        ? `Votre ${
                            detailsEvaluations.empathieMoyenne >=
                              detailsEvaluations.ecouteMoyenne &&
                            detailsEvaluations.empathieMoyenne >=
                              detailsEvaluations.comprehensionMoyenne
                              ? "empathie"
                              : detailsEvaluations.ecouteMoyenne >=
                                detailsEvaluations.comprehensionMoyenne
                              ? "écoute"
                              : "compréhension"
                          } est particulièrement appréciée par vos patients.`
                        : "Données insuffisantes pour l'analyse."}
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <BarChart2 className="h-8 w-8 text-yellow-500 mb-2" />
                    <h4 className="font-semibold mb-2">Points à améliorer</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {detailsEvaluations
                        ? `Votre ${
                            detailsEvaluations.empathieMoyenne <=
                              detailsEvaluations.ecouteMoyenne &&
                            detailsEvaluations.empathieMoyenne <=
                              detailsEvaluations.comprehensionMoyenne
                              ? "empathie"
                              : detailsEvaluations.ecouteMoyenne <=
                                detailsEvaluations.comprehensionMoyenne
                              ? "écoute"
                              : "compréhension"
                          } pourrait être travaillée pour plus d'impact.`
                        : "Données insuffisantes pour l'analyse."}
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                    <h4 className="font-semibold mb-2">Tendance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {satisfactionMoyenne
                        ? `Votre satisfaction moyenne de ${satisfactionMoyenne.satisfactionMoyenne.toFixed(
                            1
                          )}/5 est ${
                            satisfactionMoyenne.satisfactionMoyenne >= 4.5
                              ? "excellente"
                              : satisfactionMoyenne.satisfactionMoyenne >= 4.0
                              ? "très bonne"
                              : satisfactionMoyenne.satisfactionMoyenne >= 3.5
                              ? "bonne"
                              : satisfactionMoyenne.satisfactionMoyenne >= 3.0
                              ? "moyenne"
                              : "à améliorer"
                          }.`
                        : "Données insuffisantes pour l'analyse."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
