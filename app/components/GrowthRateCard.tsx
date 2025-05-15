"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react"; // Using lucide-react for icons

interface GrowthData {
  monthlyRegistrations: Array<{ month: string; count: number }>;
  currentMonthlyGrowthRate: number | string;
  lastMonthRegistrations: number;
  previousMonthRegistrations: number;
}

interface GrowthRateCardProps {
  darkMode: boolean;
  // We might want to pass the API endpoint as a prop for flexibility in the future
  // apiEndpoint: string;
}

const GrowthRateCard: React.FC<GrowthRateCardProps> = ({ darkMode }) => {
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrowthData = async () => {
      setLoading(true);
      try {
        // Assuming the API route is set up at this path
        // The actual path might need adjustment based on the Next.js project structure
        const response = await fetch("/api/auth/admin/dashboard/growthRate");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch growth data: ${response.statusText}`
          );
        }
        const data: GrowthData = await response.json();
        setGrowthData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  if (loading) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Chargement du taux de croissance...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-red-900" : "bg-red-100"
        } ${darkMode ? "text-red-300" : "text-red-700"}`}
      >
        Erreur: {error}
      </div>
    );
  }

  if (!growthData) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Aucune donnée de croissance disponible.
      </div>
    );
  }

  const {
    currentMonthlyGrowthRate,
    lastMonthRegistrations,
    monthlyRegistrations,
  } = growthData;
  const latestMonthData =
    monthlyRegistrations.length > 0
      ? monthlyRegistrations[monthlyRegistrations.length - 1]
      : null;

  let growthIndicator;
  let growthColorClass = darkMode ? "text-gray-400" : "text-gray-500";

  if (typeof currentMonthlyGrowthRate === "number") {
    if (currentMonthlyGrowthRate > 0) {
      growthIndicator = <TrendingUp className="w-5 h-5" />;
      growthColorClass = darkMode ? "text-green-400" : "text-green-500";
    } else if (currentMonthlyGrowthRate < 0) {
      growthIndicator = <TrendingDown className="w-5 h-5" />;
      growthColorClass = darkMode ? "text-red-400" : "text-red-500";
    } else {
      growthIndicator = <Minus className="w-5 h-5" />;
    }
  }

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
        Taux de Croissance Mensuel (Inscriptions)
      </h3>
      {latestMonthData ? (
        <p className="text-2xl font-bold mt-2">
          {latestMonthData.count}{" "}
          <span className="text-sm font-normal">
            inscriptions ce mois-ci ({latestMonthData.month})
          </span>
        </p>
      ) : (
        <p className="text-2xl font-bold mt-2">N/A</p>
      )}
      <div className={`flex items-center mt-2 ${growthColorClass}`}>
        {growthIndicator}
        <span className="ml-2 text-sm">
          {typeof currentMonthlyGrowthRate === "number"
            ? `${currentMonthlyGrowthRate}% par rapport au mois précédent`
            : currentMonthlyGrowthRate}
        </span>
      </div>
      {monthlyRegistrations && monthlyRegistrations.length > 0 && (
        <div className="mt-4">
          <p
            className={`text-xs ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Historique (derniers mois):
          </p>
          <ul className="text-xs">
            {monthlyRegistrations.slice(-3).map((entry) => (
              <li
                key={entry.month}
                className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {entry.month}: {entry.count} inscriptions
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GrowthRateCard;
