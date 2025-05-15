"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ActiveUsersChartProps {
  data: number[];
  labels: string[];
  darkMode: boolean; // Ajout de la prop darkMode
}

export const ActiveUsersChart = ({
  data,
  labels,
  darkMode,
}: ActiveUsersChartProps) => {
  const chartData = labels.map((label, index) => ({
    name: label,
    users: data[index],
  }));

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      } p-6 rounded-lg shadow-sm h-80`}
    >
      <h3 className="text-lg font-semibold mb-4">
        Nombre d'utilisateurs actifs par mois
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={darkMode ? "#4B5563" : "#E5E7EB"}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: darkMode ? "#A0AEC0" : "#6B7280" }}
            axisLine={{ stroke: darkMode ? "#4B5563" : "#E5E7EB" }}
          />
          <YAxis
            tick={{ fill: darkMode ? "#A0AEC0" : "#6B7280" }}
            axisLine={{ stroke: darkMode ? "#4B5563" : "#E5E7EB" }}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke={darkMode ? "#60A5FA" : "#3B82F6"}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
