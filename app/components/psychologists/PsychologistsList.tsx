import React from "react";
import { Psychologist } from "../../(mvc)/types/appointment.types";
import { Button } from "../ui/Button";

interface PsychologistsListProps {
  psychologists: Psychologist[];
}

export const PsychologistsList: React.FC<PsychologistsListProps> = ({
  psychologists,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {psychologists.map((psychologist) => (
        <div
          key={psychologist.id}
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
              <span>👤</span>
            </div>
            <h3 className="ml-3 text-lg font-medium">{psychologist.name}</h3>
          </div>
          <p className="text-gray-600 mb-2">{psychologist.specialty}</p>
          <p className="text-sm text-gray-500 mb-4">
            {psychologist.experience}
          </p>
          <Button fullWidth>Prendre rendez-vous</Button>
        </div>
      ))}
    </div>
  );
};
