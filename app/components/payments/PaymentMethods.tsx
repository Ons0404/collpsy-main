import React, { useEffect, useState } from "react";
import { PaymentMethod } from "../../(mvc)/types/appointment.types";
import { Button } from "../ui/Button";

interface PaymentMethodsProps {
  userId: string;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ userId }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch payment methods from API
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true);
        // Replace with actual API call
        // const response = await fetch(`/api/payment-methods?userId=${userId}`);
        // const data = await response.json();
        // setMethods(data.methods);

        // For demo purposes
        setTimeout(() => {
          setMethods([
            { id: "1", name: "Carte de crédit", icon: "💳" },
            { id: "2", name: "PayPal", icon: "🅿️" },
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [userId]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Méthodes de paiement</h2>

      {isLoading ? (
        <p>Chargement des méthodes de paiement...</p>
      ) : (
        <div className="space-y-2">
          {methods.map((method) => (
            <Button
              key={method.id}
              className="w-full flex items-center justify-center gap-2 mb-2"
            >
              {method.icon && <span>{method.icon}</span>}
              Payer avec {method.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
