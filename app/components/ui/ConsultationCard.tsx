// app/components/ui/ConsultationCard.tsx
import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ConsultationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  buttonAction?: () => void;
  href?: string;
}

export default function ConsultationCard({
  title,
  description,
  icon: Icon,
  buttonText,
  buttonAction,
  href,
}: ConsultationCardProps) {
  const ButtonElement = () => (
    <button
      onClick={buttonAction}
      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded transition-colors"
    >
      {buttonText}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Icon className="text-purple-500 h-6 w-6 mr-2" />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>

      {href ? (
        <Link href={href} className="block">
          <ButtonElement />
        </Link>
      ) : (
        <ButtonElement />
      )}
    </div>
  );
}
