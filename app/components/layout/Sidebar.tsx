import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userId: string; // Add userId prop
}

export const Sidebar: React.FC<SidebarProps> = ({ userId }) => {
  const pathname = usePathname();

  // Menu items with userId in each path (using strings instead of RegExp)
  const menuItems = [
    { name: "Rendez-vous", path: `/appointments?userId=${userId}`, icon: "📅" },
    {
      name: "Consultation vidéo",
      path: `/video-consultation?userId=${userId}`,
      icon: "📹",
    },
    { name: "Historique", path: `/history?userId=${userId}`, icon: "📋" },
    { name: "Paiements", path: `/payments?userId=${userId}`, icon: "💰" },
    {
      name: "Tests psychologiques",
      path: `/tests?userId=${userId}`,
      icon: "🧠",
    },
    { name: "Chat bot", path: `/chatbot?userId=${userId}`, icon: "💬" },
    { name: "Mon compte", path: `/profile?userId=${userId}`, icon: "👤" },
    {
      name: "Psychologues",
      path: `/psychologists?userId=${userId}`,
      icon: "🩺",
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-4 h-full">
      <div className="mb-6">
        <div className="text-xl font-bold mb-2">Menu Principal</div>
        <div className="text-sm text-gray-500">Utilisateur ID: {userId}</div>
      </div>

      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center p-2 rounded-md transition-colors ${
                  pathname.startsWith(item.path.split("?")[0])
                    ? "bg-indigo-100 text-indigo-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
