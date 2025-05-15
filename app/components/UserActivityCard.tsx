"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

interface UserActivityData {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  stickinessRatio: number | string; // DAU/MAU percentage
  dateRange: {
    dauDate: string;
    mauStartDate: string;
  };
}

interface UserActivityCardProps {
  darkMode: boolean;
  // apiEndpoint: string;
}

const UserActivityCard: React.FC<UserActivityCardProps> = ({ darkMode }) => {
  const [activityData, setActivityData] = useState<UserActivityData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "/api/auth/admin/dashboard/userActivityRate"
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch user activity data: ${response.statusText}`
          );
        }
        const data: UserActivityData = await response.json();
        setActivityData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  if (loading) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Chargement de l'activité des utilisateurs...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-rose-900" : "bg-rose-100"
        } ${darkMode ? "text-rose-200" : "text-rose-700"}`}
      >
        Erreur: {error}
      </div>
    );
  }

  if (!activityData) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Aucune donnée d'activité utilisateur disponible.
      </div>
    );
  }

  const { dailyActiveUsers, monthlyActiveUsers, stickinessRatio, dateRange } =
    activityData;

  const stickiness = typeof stickinessRatio === "number" ? stickinessRatio : 0;

  // More creative stickiness color and icon selection
  let stickinessColorClass;
  let StickinessIcon;

  if (stickiness >= 50) {
    // Excellent stickiness
    stickinessColorClass = darkMode ? "text-emerald-300" : "text-emerald-500";
    StickinessIcon = TrendingUp;
  } else if (stickiness >= 30) {
    // Very good stickiness
    stickinessColorClass = darkMode ? "text-teal-300" : "text-teal-500";
    StickinessIcon = TrendingUp;
  } else if (stickiness >= 20) {
    // Good stickiness
    stickinessColorClass = darkMode ? "text-cyan-300" : "text-cyan-600";
    StickinessIcon = Activity;
  } else if (stickiness >= 10) {
    // Average stickiness
    stickinessColorClass = darkMode ? "text-amber-300" : "text-amber-500";
    StickinessIcon = Activity;
  } else {
    // Low stickiness
    stickinessColorClass = darkMode ? "text-fuchsia-300" : "text-fuchsia-600";
    StickinessIcon = TrendingDown;
  }

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-white to-gray-50 text-gray-900"
      }`}
    >
      <h3
        className={`text-sm font-medium ${
          darkMode ? "text-violet-300" : "text-violet-600"
        }`}
      >
        Activité des Utilisateurs
      </h3>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-800/50" : "bg-white/70"
          }`}
        >
          <p
            className={`text-xs ${
              darkMode ? "text-indigo-300" : "text-indigo-600"
            }`}
          >
            Utilisateurs Actifs Quotidiens (DAU)
          </p>
          <p className="text-3xl font-bold flex items-center mt-1">
            <Users
              className={`w-7 h-7 mr-2 ${
                darkMode ? "text-cyan-300" : "text-cyan-600"
              }`}
            />
            {dailyActiveUsers}
          </p>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Aujourd'hui ({dateRange.dauDate})
          </p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-800/50" : "bg-white/70"
          }`}
        >
          <p
            className={`text-xs ${
              darkMode ? "text-purple-300" : "text-purple-600"
            }`}
          >
            Utilisateurs Actifs Mensuels (MAU)
          </p>
          <p className="text-3xl font-bold flex items-center mt-1">
            <Users
              className={`w-7 h-7 mr-2 ${
                darkMode ? "text-fuchsia-300" : "text-fuchsia-600"
              }`}
            />
            {monthlyActiveUsers}
          </p>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Sur 30 jours (depuis {dateRange.mauStartDate})
          </p>
        </div>
      </div>

      <hr
        className={`my-5 ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      />

      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-gray-800/50" : "bg-white/70"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            darkMode ? "text-amber-300" : "text-amber-600"
          }`}
        >
          Ratio d'Adhérence (DAU/MAU)
        </p>
        <div className={`flex items-center mt-2 ${stickinessColorClass}`}>
          <StickinessIcon className="w-6 h-6 mr-2" />
          <p className="text-2xl font-bold">
            {typeof stickinessRatio === "number"
              ? `${stickinessRatio}%`
              : stickinessRatio}
          </p>
        </div>
        <p
          className={`mt-1 text-xs ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Indique la proportion d'utilisateurs mensuels qui reviennent
          quotidiennement.
        </p>
        {stickiness < 15 && monthlyActiveUsers > 0 && (
          <p
            className={`mt-2 text-xs flex items-center ${
              darkMode ? "text-fuchsia-300" : "text-fuchsia-600"
            }`}
          >
            <AlertCircle className="inline w-4 h-4 mr-1" /> Un ratio d'adhérence
            plus élevé est généralement meilleur.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserActivityCard;
