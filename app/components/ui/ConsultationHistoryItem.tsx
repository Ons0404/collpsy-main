// app/components/ui/ConsultationHistoryItem.tsx
import React from "react";

interface ConsultationHistoryItemProps {
  id: string | number;
  doctor: string;
  date: string;
  onDetailsClick?: () => void;
}

export default function ConsultationHistoryItem({
  id,
  doctor,
  date,
  onDetailsClick,
}: ConsultationHistoryItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
      <div>
        <h3 className="font-medium">Consultation #{id}</h3>
        <p className="text-gray-500 text-sm">
          {doctor} - {date}
        </p>
      </div>
      <button
        onClick={onDetailsClick}
        className="text-purple-600 hover:text-purple-800"
      >
        Détails
      </button>
    </div>
  );
}
