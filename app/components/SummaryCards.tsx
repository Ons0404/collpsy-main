"use client";
import React, { useState, useEffect } from "react";

interface SummaryCardsProps {
  darkMode: boolean;
}

interface SummaryData {
  totalUsers: number;
  pendingAccounts: number;
  conversionRate: number;
  appPerformance: number;
}

export const SummaryCards = ({ darkMode }: SummaryCardsProps) => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalUsers: 0,
    pendingAccounts: 0,
    conversionRate: 0,
    appPerformance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await fetch("/api/auth/admin/summary");
        if (!response.ok) {
          throw new Error("Failed to fetch summary data");
        }
        const data = await response.json();
        setSummaryData({
          totalUsers: data.totalUsers,
          pendingAccounts: data.pendingAccounts,
          conversionRate: data.conversionRate,
          appPerformance: data.appPerformance,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Utilisateurs */}
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        } p-6 rounded-lg shadow-sm`}
      >
        <h3
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Total Utilisateurs
        </h3>
        <p className="text-2xl font-bold mt-2">{summaryData.totalUsers}</p>
        <span
          className={`text-sm ${
            darkMode ? "text-green-400" : "text-green-500"
          }`}
        >
          20% depuis le mois dernier
        </span>
      </div>

      {/* Comptes en Attente */}
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        } p-6 rounded-lg shadow-sm`}
      >
        <h3
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Comptes en Attente
        </h3>
        <p className="text-2xl font-bold mt-2">{summaryData.pendingAccounts}</p>
        <span
          className={`text-sm ${darkMode ? "text-red-400" : "text-red-500"}`}
        >
          Nécessite une vérification
        </span>
      </div>

      {/* Taux de Conversion */}
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        } p-6 rounded-lg shadow-sm`}
      >
        <h3
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Taux de Conversion
        </h3>
        <p className="text-2xl font-bold mt-2">{summaryData.conversionRate}%</p>
        
      </div>

      {/* Performance App */}
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        } p-6 rounded-lg shadow-sm`}
      >
        <h3
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Performance App
        </h3>
        <p className="text-2xl font-bold mt-2">{summaryData.appPerformance}%</p>
        <span
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Temps de disponibilité
        </span>
      </div>
    </div>
  );
};
