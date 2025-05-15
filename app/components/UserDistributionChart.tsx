"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

interface UserDistributionChartProps {
  data: {
    psychologists: number;
    students: number;
    pending: number;
  };
  darkMode: boolean;
}

export default function UserDistributionChart({
  data,
  darkMode,
}: UserDistributionChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Palette de couleurs plus vive et créative
  const chartData = [
    {
      name: "Psychologues",
      value: data.psychologists,
      color: darkMode ? "#FF6D8F" : "#FF4069", // Rose/Framboise
      icon: "👩‍⚕️",
    },
    {
      name: "Étudiants",
      value: data.students,
      color: darkMode ? "#63E2B7" : "#10B981", // Vert émeraude
      icon: "🎓",
    },
    {
      name: "En attente",
      value: data.pending,
      color: darkMode ? "#FFC107" : "#F59E0B", // Ambre/doré
      icon: "⏳",
    },
  ];

  useEffect(() => {
    // Simuler une animation complète après un certain délai
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Styles pour les éléments du graphique
  const styles = {
    gridColor: darkMode ? "#2D3748" : "#E2E8F0",
    textColor: darkMode ? "#E2E8F0" : "#2D3748",
    backgroundColor: darkMode ? "bg-gray-900" : "bg-gray-50",
    cardShadow: darkMode
      ? "shadow-xl shadow-blue-900/10"
      : "shadow-xl shadow-blue-200/50",
    borderColor: darkMode ? "border-gray-700" : "border-gray-200",
  };

  // Personnalisation du tooltip avancé avec icônes
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = chartData.find((item) => item.name === label);
      return (
        <div
          className={`${darkMode ? "bg-gray-800" : "bg-white"} p-3 border ${
            styles.borderColor
          } rounded-lg shadow-lg`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{data?.icon}</span>
            <p className="font-medium">{`${label}`}</p>
          </div>
          <p className="text-lg font-bold mt-1">
            {payload[0].value}
            <span className="text-xs ml-1 opacity-70">utilisateurs</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Animation au survol des barres
  const handleMouseEnter = (index: number) => {
    setHoveredBar(index);
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  return (
    <div
      className={`${styles.backgroundColor} p-6 rounded-xl ${styles.cardShadow} h-96 border ${styles.borderColor} transition-all duration-300`}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h3
              className={`text-xl font-bold ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Panorama des Utilisateurs
            </h3>
            {animationComplete && (
              <span className="animate-pulse text-green-500 text-xs px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                Live
              </span>
            )}
          </div>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            } mt-1`}
          >
            Vue d'ensemble interactive des utilisateurs par catégorie
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              onMouseMove={(e) => e}
            >
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`colorGradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={entry.color}
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="95%"
                      stopColor={entry.color}
                      stopOpacity={0.6}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={styles.gridColor}
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: styles.textColor }}
                axisLine={{ stroke: styles.gridColor }}
                tickLine={{ stroke: styles.gridColor }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                tick={{ fill: styles.textColor }}
                axisLine={{ stroke: styles.gridColor }}
                tickLine={{ stroke: styles.gridColor }}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.3 }} />
              <Legend
                wrapperStyle={{ paddingTop: 15 }}
                formatter={(value, entry, index) => (
                  <span className="flex items-center gap-1">
                    <span className="text-lg">{chartData[index].icon}</span>
                    <span>{value}</span>
                  </span>
                )}
              />
              <Bar
                dataKey="value"
                name="Nombre d'utilisateurs"
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
                onMouseEnter={(data, index) => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorGradient-${index})`}
                    cursor="pointer"
                    stroke={hoveredBar === index ? "#fff" : "none"}
                    strokeWidth={hoveredBar === index ? 2 : 0}
                    className="transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between mt-4 text-xs opacity-70">
          <div className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Total: {data.psychologists + data.students + data.pending}{" "}
            utilisateurs
          </div>
          <div className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Mis à jour {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
