"use client";
import React, { useState, useEffect } from "react";
import { PieChart, ListChecks, AlertCircle, ServerCrash } from "lucide-react"; // Using lucide-react for icons

interface ConsultationTypeData {
  totalConsultationsLast30Days: number;
  consultationsByTypeLast30Days: { [key: string]: number }; // e.g., { EN_LIGNE: 50, PRESENTIEL: 20 }
  consultationTypePercentagesLast30Days: { [key: string]: number | string }; // e.g., { EN_LIGNE: 71.43, PRESENTIEL: 28.57 }
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface ConsultationTypesChartProps {
  darkMode: boolean;
  // apiEndpoint: string; // Optional
}

const ConsultationTypesChart: React.FC<ConsultationTypesChartProps> = ({
  darkMode,
}) => {
  const [consultationData, setConsultationData] =
    useState<ConsultationTypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultationData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "/api/auth/admin/dashboard/consultationTypesRate"
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch consultation types data: ${response.statusText}`
          );
        }
        const data: ConsultationTypeData = await response.json();
        setConsultationData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultationData();
  }, []);

  if (loading) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Chargement des types de consultation...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700"
        }`}
      >
        <div className="flex items-center">
          <ServerCrash className="w-5 h-5 mr-2" />
          Erreur: {error}
        </div>
      </div>
    );
  }

  if (
    !consultationData ||
    consultationData.totalConsultationsLast30Days === 0
  ) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        }`}
      >
        <h3
          className={`text-sm font-medium ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Répartition des Consultations (30j)
        </h3>
        <div className="flex items-center justify-center h-32">
          <ListChecks
            className={`w-10 h-10 mr-2 ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Aucune consultation enregistrée sur les 30 derniers jours.
          </p>
        </div>
      </div>
    );
  }

  const {
    consultationsByTypeLast30Days,
    consultationTypePercentagesLast30Days,
    totalConsultationsLast30Days,
    dateRange,
  } = consultationData;

  // Define colors for chart segments - adjust as needed
  const typeColors: { [key: string]: string } = {
    EN_LIGNE: darkMode ? "#38bdf8" : "#0ea5e9", // sky-500 / sky-600
    PRESENTIEL: darkMode ? "#818cf8" : "#6366f1", // indigo-400 / indigo-500
    // Add more if other types exist
  };

  const chartData = Object.entries(consultationTypePercentagesLast30Days).map(
    ([type, percentage]) => ({
      name: type
        .replace("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()), // Format name: "En Ligne"
      value: typeof percentage === "number" ? percentage : 0,
      count: consultationsByTypeLast30Days[type] || 0,
      color: typeColors[type] || (darkMode ? "#6b7280" : "#4b5563"), // Default gray
    })
  );

  // For a simple display without a complex chart library:
  return (
    <div
      className={`p-6 rounded-lg shadow-sm ${
        darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3
          className={`text-sm font-medium ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Répartition des Consultations (30j)
        </h3>
        <PieChart
          className={`w-5 h-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
        />
      </div>
      <p className={`text-2xl font-bold mt-2`}>
        {totalConsultationsLast30Days}{" "}
        <span className="text-sm font-normal">consultations</span>
      </p>
      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
        Du {dateRange.startDate} au {dateRange.endDate}
      </p>

      <div className="mt-4 space-y-3">
        {chartData.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span
                className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                {item.name} ({item.count})
              </span>
              <span
                className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {item.value}%
              </span>
            </div>
            <div
              className={`h-2 w-full rounded-full ${
                darkMode ? "bg-gray-700" : "bg-gray-300"
              }`}
            >
              <div
                className="h-2 rounded-full"
                style={{ width: `${item.value}%`, backgroundColor: item.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      {chartData.length === 0 && totalConsultationsLast30Days > 0 && (
        <p
          className={`mt-3 text-sm ${
            darkMode ? "text-yellow-400" : "text-yellow-600"
          }`}
        >
          <AlertCircle className="inline w-4 h-4 mr-1" /> Les types de
          consultations n'ont pas pu être détaillés.
        </p>
      )}
    </div>
  );
};

export default ConsultationTypesChart;
