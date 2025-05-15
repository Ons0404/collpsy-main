// app/components/layout/MainContent.tsx
import React from "react";

export const MainContent = () => {
  return (
    <main className="flex-1 p-4 bg-gray-100">
      <h2 className="text-xl font-bold mb-4">Historique récent</h2>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Consultation #1</h3>
          <p>Dr. Smith - 12/03/2024</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Consultation #2</h3>
          <p>Dr. Smith - 12/03/2024</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Consultation #3</h3>
          <p>Dr. Smith - 12/03/2024</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Consultation #4</h3>
          <p>Dr. Smith - 12/03/2024</p>
        </div>
      </div>
    </main>
  );
};
