"use client";
import React, { useEffect, useState } from "react";
import {
  AppointmentType,
  Appointment,
} from "../../(mvc)/types/appointment.types";
import { Button } from "../ui/Button";

interface AppointmentTypeSelectorProps {
  selectedType: AppointmentType | null;
  onSelect: (type: AppointmentType) => void;
  userId: string; // Add userId prop
}

export const AppointmentTypeSelector: React.FC<
  AppointmentTypeSelectorProps
> = ({ selectedType, onSelect, userId }) => {
  // You could use userId to fetch user preferences for appointment types
  useEffect(() => {
    // Example of how you might use userId
    console.log(`Loading appointment preferences for user: ${userId}`);
    // In a real app, you might fetch user preferences here
  }, [userId]);

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        onClick={() => onSelect("online")}
        className={`p-4 rounded-md border transition-colors ${
          selectedType === "online"
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <div className="font-medium">En ligne</div>
      </button>

      <button
        onClick={() => onSelect("inPerson")}
        className={`p-4 rounded-md border transition-colors ${
          selectedType === "inPerson"
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <div className="font-medium">Présentiel</div>
      </button>
    </div>
  );
};

interface AppointmentsListProps {
  userId: string; // Add userId prop
}

interface ExtendedAppointment extends Appointment {
  userId: string;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  userId,
}) => {
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch appointments from API
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        // const response = await fetch(`/api/appointments?userId=${userId}`);
        // const data = await response.json();
        // setAppointments(data.appointments);

        // For demo purposes
        setTimeout(() => {
          setAppointments([
            {
              id: "1",
              number: 101,
              date: "2023-11-15",
              doctorName: "Dr. Martin",
              type: "online",
              userId: userId,
            },
            {
              id: "2",
              number: 102,
              date: "2023-12-01",
              doctorName: "Dr. Laurent",
              type: "inPerson",
              userId: userId,
            },
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [userId]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Consultations précédentes</h2>

      {isLoading ? (
        <p>Chargement des consultations...</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-500">Aucune consultation passée</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border rounded-md p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="font-bold text-lg">
                Consultation #{appointment.number}
              </div>
              <div className="text-gray-600">
                {appointment.date} - {appointment.doctorName}
              </div>
              <Button className="mt-2">Voir détails</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
