"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  Activity,
  AlertCircle,
  BarChart2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";

// Interface for Satisfaction Data
interface SatisfactionData {
  averageSatisfaction: number | string;
  totalEvaluations: number;
  satisfactionDistribution?: { [key: string]: number };
  lastUpdated?: string;
  trends?: {
    previous: number;
    change: number;
  };
}

interface SatisfactionRateGaugeProps {
  darkMode: boolean;
  apiEndpoint?: string; // Optional custom API endpoint
  refreshInterval?: number; // Auto-refresh interval in milliseconds
  exportable?: boolean; // Allow data export
}

const SatisfactionRateGauge: React.FC<SatisfactionRateGaugeProps> = ({
  darkMode,
  apiEndpoint = "/api/auth/admin/dashboard/satisfactionRate",
  refreshInterval = 300000, // 5 minutes default
  exportable = true,
}) => {
  const [satisfactionData, setSatisfactionData] =
    useState<SatisfactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  // Fetch data from API
  const fetchSatisfactionData = useCallback(
    async (showRefreshIndicator = true) => {
      if (showRefreshIndicator) setIsRefreshing(true);
      try {
        // Actual fetch with dynamic endpoint
        const response = await fetch(apiEndpoint);

        // Handle response errors
        if (!response.ok) {
          // Attempt to parse error message if available
          try {
            const errorData = await response.json();
            throw new Error(
              errorData.error ||
                `Erreur lors du chargement: ${response.status} ${response.statusText}`
            );
          } catch (parseError) {
            throw new Error(
              `Erreur lors du chargement: ${response.status} ${response.statusText}`
            );
          }
        }

        // Parse and validate the data
        const data = await response.json();

        // Data validation - check if we have the minimum required fields
        if (!("averageSatisfaction" in data && "totalEvaluations" in data)) {
          throw new Error("Format de données incorrect reçu de l'API");
        }

        // Add timestamp for when data was fetched
        const enrichedData = {
          ...data,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        };

        setSatisfactionData(enrichedData);
        setLastFetchTime(new Date());
        setError(null);
      } catch (err: any) {
        console.error("Error fetching satisfaction data:", err);
        setError(
          err.message ||
            "Une erreur s'est produite lors de la récupération des données"
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiEndpoint]
  );

  // Export data to CSV
  const exportToCsv = useCallback(() => {
    if (!satisfactionData) return;

    // Format data for CSV
    const {
      satisfactionDistribution = {},
      averageSatisfaction,
      totalEvaluations,
    } = satisfactionData;

    // Prepare header row
    let csvContent = "Données de satisfaction\n";
    csvContent += `Note moyenne,${
      typeof averageSatisfaction === "number"
        ? averageSatisfaction.toFixed(2)
        : "N/A"
    }\n`;
    csvContent += `Total des évaluations,${totalEvaluations}\n\n`;

    // Add distribution data if available
    if (Object.keys(satisfactionDistribution).length > 0) {
      csvContent += "Note,Nombre d'évaluations\n";
      for (let i = 5; i >= 1; i--) {
        csvContent += `${i},${satisfactionDistribution[i.toString()] || 0}\n`;
      }
    }

    // Create downloadable blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create and trigger download link
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `satisfaction-data-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [satisfactionData]);

  // Initial data fetch
  useEffect(() => {
    fetchSatisfactionData(false);
  }, [fetchSatisfactionData]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchSatisfactionData(true);
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchSatisfactionData, refreshInterval]);

  // Format time since last update
  const getTimeSinceUpdate = () => {
    if (!lastFetchTime) return "Jamais";

    const now = new Date();
    const diffMs = now.getTime() - lastFetchTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins === 1) return "Il y a 1 minute";
    if (diffMins < 60) return `Il y a ${diffMins} minutes`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "Il y a 1 heure";
    if (diffHours < 24) return `Il y a ${diffHours} heures`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  };

  // Render loading state
  if (loading) {
    return (
      <div
        className={`p-5 rounded-lg shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"} border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-3 justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Chargement des données de satisfaction...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        className={`p-5 rounded-lg shadow-md ${
          darkMode ? "bg-red-900/20" : "bg-red-50"
        } ${darkMode ? "text-red-300" : "text-red-600"} border ${
          darkMode ? "border-red-800/30" : "border-red-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Erreur de chargement des données</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => fetchSatisfactionData(false)}
          className={`mt-3 px-3 py-1.5 rounded-md text-sm font-medium ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-white hover:bg-gray-100"
          } transition-colors`}
        >
          <RefreshCw className="h-4 w-4 inline mr-1" /> Réessayer
        </button>
      </div>
    );
  }

  // Handle no data
  if (!satisfactionData || satisfactionData.averageSatisfaction === "N/A") {
    return (
      <div
        className={`p-5 rounded-lg shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"} border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          <BarChart2 className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Données de satisfaction</h3>
            <p className="text-sm mt-1">
              Aucune donnée disponible pour le moment
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchSatisfactionData(false)}
          className={`mt-3 px-3 py-1.5 rounded-md text-sm font-medium ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-white hover:bg-gray-100"
          } transition-colors`}
        >
          <RefreshCw className="h-4 w-4 inline mr-1" /> Actualiser
        </button>
      </div>
    );
  }

  // Handle successful data load
  const {
    averageSatisfaction,
    totalEvaluations,
    satisfactionDistribution,
    trends,
  } = satisfactionData;
  const satisfactionScore =
    typeof averageSatisfaction === "number" ? averageSatisfaction : 0;
  const percentage = (satisfactionScore / 5) * 100;

  // Dynamic styling based on satisfaction score
  let scoreColorClass = darkMode ? "text-yellow-300" : "text-yellow-500";
  if (satisfactionScore >= 4) {
    scoreColorClass = darkMode ? "text-green-400" : "text-green-500";
  } else if (satisfactionScore < 2.5) {
    scoreColorClass = darkMode ? "text-red-400" : "text-red-500";
  }

  // Determine trend icon and color
  let TrendIcon = null;
  let trendColorClass = "";

  if (trends && trends.change !== 0) {
    if (trends.change > 0) {
      TrendIcon = ChevronUp;
      trendColorClass = darkMode ? "text-green-400" : "text-green-500";
    } else {
      TrendIcon = ChevronDown;
      trendColorClass = darkMode ? "text-red-400" : "text-red-500";
    }
  }

  return (
    <div
      className={`p-5 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      } ${darkMode ? "text-gray-200" : "text-gray-900"} border ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      {/* Header with title and refresh button */}
      <div className="flex justify-between items-center">
        <h3
          className={`text-base font-medium ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Taux de Satisfaction des Étudiants
        </h3>
        <div className="flex items-center space-x-2">
          {isRefreshing && (
            <span
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
              Actualisation...
            </span>
          )}
          <button
            onClick={() => fetchSatisfactionData(true)}
            className={`p-1 rounded-md ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } transition-colors`}
            title="Actualiser les données"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isRefreshing
                  ? darkMode
                    ? "text-gray-600"
                    : "text-gray-400"
                  : ""
              }`}
            />
          </button>

          {exportable && (
            <button
              onClick={exportToCsv}
              className={`p-1 rounded-md ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } transition-colors`}
              title="Exporter les données (CSV)"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main satisfaction score */}
      <div className="mt-4 flex items-center">
        <div
          className={`text-4xl font-bold ${scoreColorClass} flex items-center`}
        >
          {typeof averageSatisfaction === "number"
            ? averageSatisfaction.toFixed(1)
            : "N/A"}
          <span className="text-lg ml-1">/ 5</span>
          {TrendIcon && (
            <span
              className={`ml-2 ${trendColorClass} flex items-center text-lg`}
            >
              <TrendIcon className="h-5 w-5" />
              {Math.abs(trends!.change).toFixed(1)}
            </span>
          )}
        </div>

        <div className="ml-4 flex flex-col">
          <div className="flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {totalEvaluations} évaluations
            </span>
          </div>
          <span
            className={`text-xs mt-1 ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Mis à jour: {getTimeSinceUpdate()}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div
          className={`h-2 w-full rounded-full ${
            darkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <div
            className={`h-2 rounded-full ${scoreColorClass.replace(
              "text-",
              "bg-"
            )}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <div
            className={`text-xs ${
              darkMode ? "text-gray-500" : "text-gray-500"
            } flex items-center`}
          >
            <ThumbsDown className="h-3 w-3 mr-1" /> Insatisfait
          </div>
          <div
            className={`text-xs ${
              darkMode ? "text-gray-500" : "text-gray-500"
            } flex items-center`}
          >
            <ThumbsUp className="h-3 w-3 mr-1" /> Très satisfait
          </div>
        </div>
      </div>

      {/* Toggle for detailed distribution */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full mt-4 flex items-center justify-center py-1 text-sm ${
          darkMode
            ? "text-gray-400 hover:text-gray-300"
            : "text-gray-600 hover:text-gray-800"
        } transition-colors`}
      >
        {expanded ? "Masquer les détails" : "Afficher les détails"}
        {expanded ? (
          <ChevronUp className="h-4 w-4 ml-1" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-1" />
        )}
      </button>

      {/* Expanded distribution view */}
      {expanded && satisfactionDistribution && (
        <div className="mt-3 space-y-2 border-t pt-3 border-gray-700">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = satisfactionDistribution[rating.toString()] || 0;
            const percentage =
              totalEvaluations > 0
                ? Math.round((count / totalEvaluations) * 100)
                : 0;

            return (
              <div key={rating} className="flex items-center">
                <div className="w-6 text-center">
                  <span
                    className={`text-xs font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {rating}
                  </span>
                </div>
                <div className="w-4 ml-1">
                  <Star
                    className={`w-3 h-3 ${
                      rating >= 4
                        ? darkMode
                          ? "text-yellow-300"
                          : "text-yellow-400"
                        : darkMode
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div
                  className={`flex-1 h-2 mx-2 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded-full`}
                >
                  <div
                    className={`h-2 rounded-full ${
                      rating >= 4
                        ? darkMode
                          ? "bg-green-400"
                          : "bg-green-500"
                        : rating === 3
                        ? darkMode
                          ? "bg-yellow-400"
                          : "bg-yellow-500"
                        : darkMode
                        ? "bg-red-400"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right">
                  <span
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {count} ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}

          {/* API info */}
          <div className="text-xs text-center mt-3 pt-2 border-t border-gray-700">
            <span className={`${darkMode ? "text-gray-500" : "text-gray-500"}`}>
              Source: {apiEndpoint}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatisfactionRateGauge;
