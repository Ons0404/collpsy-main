"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  modifiers?: { [key: string]: (date: Date) => boolean };
  modifiersStyles?: { [key: string]: React.CSSProperties };
}

export function Calendar({
  selected,
  onSelect,
  disabled,
  modifiers,
  modifiersStyles,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fonction pour passer au mois précédent
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Fonction pour passer au mois suivant
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Fonction pour gérer la sélection d'une date
  const handleDateClick = (date: Date) => {
    if (onSelect) {
      onSelect(date);
    }
  };

  // Générer les jours du mois
  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: fr });
    const endDate = endOfWeek(monthEnd, { locale: fr });

    const days: Date[] = []; // Explicitly type days as Date[]
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days.map((date, index) => {
      const isCurrentMonth = isSameMonth(date, currentMonth);
      const isSelected = selected && isSameDay(date, selected);
      const isDisabled = disabled && disabled(date);

      // Applique les modificateurs
      const activeModifiers = modifiers
        ? Object.keys(modifiers).filter((key) => modifiers[key](date))
        : [];

      // Applique les styles des modificateurs
      const modifierStyles = activeModifiers.reduce((acc, key) => {
        return { ...acc, ...(modifiersStyles?.[key] || {}) };
      }, {});

      return (
        <div
          key={index}
          className={`p-2 text-center rounded-full cursor-pointer ${
            isCurrentMonth ? "text-gray-900" : "text-gray-400"
          } ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"} ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={modifierStyles}
          onClick={() => !isDisabled && handleDateClick(date)}
        >
          {format(date, "d")}
        </div>
      );
    });
  };

  return (
    <div className="border rounded-lg shadow-lg p-4 bg-white">
      {/* En-tête du calendrier */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={previousMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          {"<"}
        </button>
        <div className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          {">"}
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, index) => (
          <div
            key={index}
            className="text-center text-gray-500 font-medium text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
    </div>
  );
}

export default Calendar;
