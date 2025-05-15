import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface AdminChartsProps {
  darkMode: boolean;
}

interface ChartData {
  userDistribution: { psychologists: number; students: number };
  avgSatisfaction: number;
  userStatusRates: { accepted: number; rejected: number };
  complaints: { psychologists: number; students: number };
}

const AdminCharts: React.FC<AdminChartsProps> = ({ darkMode }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Palette de couleurs professionnelle
  const colorPalettes = {
    userDistribution: {
      light: ["#2c699a", "#54a0ff"], // Bleu professionnel foncé, bleu clair
      dark: ["#3b82f6", "#60a5fa"], // Bleu plus lumineux pour le mode sombre
    },
    userStatusRates: {
      light: ["#2e7d32", "#e53935"], // Vert professionnel, rouge professionnel
      dark: ["#4caf50", "#f44336"], // Vert plus lumineux, rouge plus lumineux
    },
    complaints: {
      light: ["#5c6bc0", "#7986cb"], // Indigo professionnel, indigo clair
      dark: ["#6366f1", "#818cf8"], // Indigo plus lumineux pour le mode sombre
    },
  };

  // Couleur pour la satisfaction moyenne
  const satisfactionColor = darkMode ? "#4caf50" : "#2e7d32"; // Vert professionnel

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/admin/charts");
        if (!res.ok) {
          throw new Error(
            "Erreur lors de la récupération des données des graphiques"
          );
        }
        const response = await res.json();
        if (!response.success) {
          throw new Error(response.error || "Erreur dans la réponse de l'API");
        }
        setChartData(response.data); // Extract the 'data' property
      } catch (err: any) {
        setError(err.message || "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div
          className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            darkMode ? "border-blue-400" : "border-blue-600"
          }`}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${
          darkMode ? "bg-red-800 text-red-300" : "bg-red-50 text-red-700"
        } p-4 rounded-lg mb-4 flex items-start`}
      >
        <svg
          className="w-5 h-5 mr-2 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!chartData) return null;

  const chartTextColor = darkMode ? "#D1D5DB" : "#374151";
  const chartGridColor = darkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  // User Distribution Chart (Psychologists vs Students)
  const userDistributionData = {
    labels: ["Psychologues", "Étudiants"],
    datasets: [
      {
        label: "Nombre d'utilisateurs",
        data: [
          chartData.userDistribution.psychologists,
          chartData.userDistribution.students,
        ],
        backgroundColor: darkMode
          ? colorPalettes.userDistribution.dark
          : colorPalettes.userDistribution.light,
        borderWidth: 0,
      },
    ],
  };

  const userDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: chartTextColor },
        grid: { color: chartGridColor },
      },
      x: {
        ticks: { color: chartTextColor },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
        titleColor: darkMode ? "#F3F4F6" : "#111827",
        bodyColor: darkMode ? "#F3F4F6" : "#111827",
        borderColor: darkMode ? "#374151" : "#E5E7EB",
        borderWidth: 1,
      },
    },
  };

  // User Status Rates Chart (Accepted vs Rejected)
  const userStatusRatesData = {
    labels: ["Acceptés", "Refusés"],
    datasets: [
      {
        label: "Taux",
        data: [
          chartData.userStatusRates.accepted,
          chartData.userStatusRates.rejected,
        ],
        backgroundColor: darkMode
          ? colorPalettes.userStatusRates.dark
          : colorPalettes.userStatusRates.light,
        borderWidth: 0,
      },
    ],
  };

  const userStatusRatesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: chartTextColor },
        grid: { color: chartGridColor },
      },
      x: {
        ticks: { color: chartTextColor },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
        titleColor: darkMode ? "#F3F4F6" : "#111827",
        bodyColor: darkMode ? "#F3F4F6" : "#111827",
        borderColor: darkMode ? "#374151" : "#E5E7EB",
        borderWidth: 1,
      },
    },
  };

  // Complaints Chart (Psychologists vs Students)
  const complaintsData = {
    labels: ["Côté Psychologues", "Côté Étudiants"],
    datasets: [
      {
        label: "Nombre de réclamations",
        data: [
          chartData.complaints.psychologists,
          chartData.complaints.students,
        ],
        backgroundColor: darkMode
          ? colorPalettes.complaints.dark
          : colorPalettes.complaints.light,
        borderWidth: 0,
      },
    ],
  };

  const complaintsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: chartTextColor },
        grid: { color: chartGridColor },
      },
      x: {
        ticks: { color: chartTextColor },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
        titleColor: darkMode ? "#F3F4F6" : "#111827",
        bodyColor: darkMode ? "#F3F4F6" : "#111827",
        borderColor: darkMode ? "#374151" : "#E5E7EB",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Distribution Chart */}
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        } p-5 rounded-xl shadow-sm`}
      >
        <h2 className="text-lg font-semibold mb-4">
          Distribution des Utilisateurs
        </h2>
        <div className="h-64">
          <Bar data={userDistributionData} options={userDistributionOptions} />
        </div>
      </div>

      {/* Average Satisfaction */}
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        } p-5 rounded-xl shadow-sm flex items-center justify-center`}
      >
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">
            Satisfaction Moyenne (Consultations en Ligne)
          </h2>
          <div
            className={`text-4xl font-bold`}
            style={{ color: satisfactionColor }}
          >
            {chartData.avgSatisfaction.toFixed(1)}/5
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Basé sur les évaluations des consultations en ligne
          </p>
        </div>
      </div>

      {/* User Status Rates Chart */}
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        } p-5 rounded-xl shadow-sm`}
      >
        <h2 className="text-lg font-semibold mb-4">
          Taux d'Acceptation et de Refus des Utilisateurs
        </h2>
        <div className="h-64">
          <Bar data={userStatusRatesData} options={userStatusRatesOptions} />
        </div>
      </div>

      {/* Complaints Chart */}
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        } p-5 rounded-xl shadow-sm`}
      >
        <h2 className="text-lg font-semibold mb-4">Nombre de Réclamations</h2>
        <div className="h-64">
          <Bar data={complaintsData} options={complaintsOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
