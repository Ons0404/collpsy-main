"use client";
import React, { useState, useEffect } from "react";
import {
  UserCheck,
  UserX,
  Users,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface AccountStatusData {
  recentlyRegisteredPsychologistsLast30Days: number;
  recentlyApprovedPsychologistsLast30Days: number;
  pendingApprovalPsychologists: number;
  approvalRateOfNewPsychologistsLast30Days: number | string;
  totalPsychologists: number;
  totalActivePsychologists: number;
  totalInactivePsychologists: number;
}

interface AccountStatusCardProps {
  darkMode: boolean;
  // apiEndpoint: string;
}

const AccountStatusCard: React.FC<AccountStatusCardProps> = ({ darkMode }) => {
  const [statusData, setStatusData] = useState<AccountStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/admin/dashboard/accountStatusRate");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Failed to fetch account status data: ${response.statusText}`
          );
        }
        const data: AccountStatusData = await response.json();
        setStatusData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  if (loading) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Chargement des statuts de comptes...
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

  if (!statusData) {
    return (
      <div
        className={`p-4 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800" : "bg-white"
        } ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Aucune donnée de statut de compte disponible.
      </div>
    );
  }

  const {
    recentlyRegisteredPsychologistsLast30Days,
    recentlyApprovedPsychologistsLast30Days,
    pendingApprovalPsychologists,
    approvalRateOfNewPsychologistsLast30Days,
    totalPsychologists,
    totalActivePsychologists,
    totalInactivePsychologists,
  } = statusData;

  const approvalRate =
    typeof approvalRateOfNewPsychologistsLast30Days === "number"
      ? approvalRateOfNewPsychologistsLast30Days
      : 0;
  let rateColorClass = darkMode ? "text-gray-400" : "text-gray-500";
  let RateIcon = TrendingUp;

  if (approvalRate >= 75) {
    rateColorClass = darkMode ? "text-green-400" : "text-green-500";
    RateIcon = TrendingUp;
  } else if (approvalRate < 50 && approvalRate > 0) {
    rateColorClass = darkMode ? "text-red-400" : "text-red-500";
    RateIcon = TrendingDown;
  } else if (
    approvalRate === 0 &&
    recentlyRegisteredPsychologistsLast30Days > 0
  ) {
    rateColorClass = darkMode ? "text-yellow-400" : "text-yellow-500";
    RateIcon = AlertCircle;
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
        Statut des Comptes Psychologues
      </h3>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Nouveaux Inscrits (30j)
          </p>
          <p className="text-xl font-bold">
            {recentlyRegisteredPsychologistsLast30Days}
          </p>
        </div>
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Nouveaux Approuvés (30j)
          </p>
          <p className="text-xl font-bold flex items-center">
            <UserCheck
              className={`w-5 h-5 mr-2 ${
                darkMode ? "text-green-400" : "text-green-500"
              }`}
            />
            {recentlyApprovedPsychologistsLast30Days}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p
          className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Taux d'Approbation des Nouveaux (30j)
        </p>
        <div className={`flex items-center ${rateColorClass}`}>
          <RateIcon className="w-6 h-6 mr-2" />
          <p className="text-2xl font-bold">
            {typeof approvalRateOfNewPsychologistsLast30Days === "number"
              ? `${approvalRateOfNewPsychologistsLast30Days}%`
              : approvalRateOfNewPsychologistsLast30Days}
          </p>
        </div>
      </div>

      <hr
        className={`my-4 ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Total Psychologues
          </p>
          <p className="text-lg font-semibold flex items-center">
            <Users className="w-4 h-4 mr-2" /> {totalPsychologists}
          </p>
        </div>
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-green-400" : "text-green-600"
            }`}
          >
            Actifs
          </p>
          <p className="text-lg font-semibold flex items-center">
            <UserCheck
              className={`w-4 h-4 mr-2 ${
                darkMode ? "text-green-400" : "text-green-500"
              }`}
            />{" "}
            {totalActivePsychologists}
          </p>
        </div>
        <div>
          <p
            className={`text-xs ${
              darkMode ? "text-yellow-400" : "text-yellow-600"
            }`}
          >
            En Attente / Inactifs
          </p>
          <p className="text-lg font-semibold flex items-center">
            <UserX
              className={`w-4 h-4 mr-2 ${
                darkMode ? "text-yellow-400" : "text-yellow-500"
              }`}
            />{" "}
            {pendingApprovalPsychologists}
            {/* totalInactivePsychologists could be used if it represents something different than pending */}
          </p>
        </div>
      </div>
      {pendingApprovalPsychologists > 0 && (
        <p
          className={`mt-3 text-xs ${
            darkMode ? "text-orange-400" : "text-orange-600"
          }`}
        >
          <AlertCircle className="inline w-4 h-4 mr-1" />{" "}
          {pendingApprovalPsychologists} compte(s) psychologue(s) en attente de
          validation.
        </p>
      )}
    </div>
  );
};

export default AccountStatusCard;
