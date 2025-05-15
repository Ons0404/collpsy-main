"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import {
  User,
  Calendar as CalendarIcon,
  Clock,
  Star,
  LogOut,
  ChevronRight,
  Video,
  Menu,
  Bell,
  Users,
  BarChart2,
  Sun,
  Moon,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import Progress from "../../../../components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { useToast } from "../../../../(mvc)/hooks/use-toast";
import ReclamationForm from "./ReclamationForm/page";

// Interfaces
interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "PSYCHOLOGUE" | "ETUDIANT";
  civilite: "M" | "Mme";
  avatar?: string | null;
  psychologue?: { id_psychologue: number };
}

interface RendezVous {
  id: number;
  date: string;
  heure_debut: string;
  utilisateur: {
    prenom: string;
    nom: string;
  };
}

interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

interface Patient {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

// Sidebar Component
const ModernSidebar = ({
  isDarkMode,
  activeMenuItem,
  setActiveMenuItem,
  setIsMobileSidebarOpen,
  router,
  userData,
  handleOpenReclamation,
  handleLogout,
}: {
  isDarkMode: boolean;
  activeMenuItem: string;
  setActiveMenuItem: (item: string) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  router: ReturnType<typeof useRouter>;
  userData: UserData;
  handleOpenReclamation: () => void;
  handleLogout: () => void;
}) => {
  const navItems = [
    {
      icon: <User size={18} />,
      label: "Profil",
      value: "profile",
      path: `/dashboard/dashboardpsy/${userData.id}/profil`,
    },
    {
      icon: <CalendarIcon size={18} />,
      label: "Rendez-vous",
      value: "rendezvous",
      path: `/dashboard/dashboardpsy/${userData.id}/rendez-vous`,
    },
    {
      icon: <Clock size={18} />,
      label: "Disponibilités",
      value: "disponibilites",
      path: `/dashboard/dashboardpsy/${userData.id}/disponibilites`,
    },
    {
      icon: <Star size={18} />,
      label: "Évaluations",
      value: "evaluations",
      path: `/dashboard/dashboardpsy/${userData.id}/evaluations`,
    },
    {
      icon: <Video size={18} />,
      label: "Consultations",
      value: "consultations",
      path: `/dashboard/dashboardpsy/${userData.id}/consultations`,
    },
    {
      icon: <Users size={18} />,
      label: "Patients",
      value: "patients",
      path: `/dashboard/dashboardpsy/${userData.id}/patients`,
    },
    {
      icon: <Users size={18} />,
      label: "Conversations",
      value: "conversations",
      path: `/dashboard/dashboardpsy/${userData.id}/conversations`,
    },
    {
      icon: <AlertCircle size={18} />,
      label: "Réclamations",
      value: "reclamations",
      onClick: handleOpenReclamation,
    },
    {
      icon: <BarChart2 size={18} />,
      label: "Statistiques",
      value: "statistiques",
      path: `/dashboard/dashboardpsy/${userData.id}/statistique`,
    },
  ];

  return (
    <div
      className={`h-full flex flex-col ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } rounded-xl shadow-sm transition-all border ${
        isDarkMode ? "border-gray-700" : "border-gray-100"
      }`}
    >
      <div className="flex-1 py-6 px-3">
        <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-sm border border-gray-100 dark:border-gray-700">
          <Avatar className="h-12 w-12 border-2 border-green-500 ring-2 ring-white dark:ring-gray-800">
            {userData.avatar ? (
              <AvatarImage
                src={`data:image/jpeg;base64,${userData.avatar}`}
                alt={`${userData.prenom} ${userData.nom}`}
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                {userData.prenom?.charAt(0) ?? ""}
                {userData.nom?.charAt(0) ?? ""}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {userData.civilite} {userData.prenom} {userData.nom}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Psychologue
            </p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <div key={item.value}>
              {item.onClick ? (
                <button
                  onClick={() => {
                    item.onClick();
                    setActiveMenuItem(item.value);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeMenuItem === item.value
                      ? isDarkMode
                        ? "bg-green-600 text-white"
                        : "bg-green-50 text-green-600"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span
                    className={
                      activeMenuItem === item.value
                        ? "text-current"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                  {activeMenuItem === item.value && (
                    <ChevronRight size={16} className="ml-auto text-current" />
                  )}
                </button>
              ) : (
                <Link href={item.path}>
                  <button
                    onClick={() => {
                      setActiveMenuItem(item.value);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeMenuItem === item.value
                        ? isDarkMode
                          ? "bg-green-600 text-white"
                          : "bg-green-50 text-green-600"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span
                      className={
                        activeMenuItem === item.value
                          ? "text-current"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="ml-3 text-sm font-medium">
                      {item.label}
                    </span>
                    {activeMenuItem === item.value && (
                      <ChevronRight
                        size={16}
                        className="ml-auto text-current"
                      />
                    )}
                  </button>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
          onClick={handleLogout}
        >
          <LogOut size={16} className="mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

// Main Component
export default function DashboardPsychologue() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [prochainRdv, setProchainRdv] = useState<RendezVous | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    rdvCeMois: 0,
    rdvConfirmes: 0,
    tauxAnnulation: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");
  const [showReclamationModal, setShowReclamationModal] =
    useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const initialMode = savedTheme ? savedTheme === "dark" : false;
    setIsDarkMode(initialMode);
    document.documentElement.classList.toggle("dark", initialMode);
  }, []);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      // Optional: Call a logout API to invalidate the server-side session
      // await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error during server-side logout:", e);
    }
    // Clear client-side session data
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userId");
    setUserData(null);
    router.push("/auth/login");
  }, [router]);

  // Fetch user data and session
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Fetch error:", errorData);
          if (response.status === 401) {
            toast({
              title: "Session expirée",
              description: "Veuillez vous reconnecter.",
              variant: "destructive",
            });
            handleLogout();
            return;
          }
          throw new Error(
            errorData.error || "Erreur lors de la récupération des données"
          ); // Line ~359
        }
        const data = await response.json();
        if (data.user) {
          setUserData(data.user);
          // ... additional fetches
        } else {
          throw new Error("Données utilisateur non disponibles");
        }
      } catch (err) {
        console.error("Fetch data error:", err); // Line ~364
        setError(err.message || "Une erreur est survenue.");
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast, handleLogout]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        }
      );
      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour de la notification");
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour de la notification",
        variant: "destructive",
      });
    }
  };

  // Handler for opening reclamation form
  const handleOpenReclamation = () => {
    setActiveMenuItem("reclamations");
    setShowReclamationModal(true);
  };

  // Handler for closing reclamation form
  const handleCloseReclamation = () => {
    setShowReclamationModal(false);
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Loading state
  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Chargement en cours...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="max-w-md p-6 rounded-lg shadow-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full p-2 bg-red-100 dark:bg-red-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Erreur d'authentification</h2>
          </div>
          <p className="mb-4">{error}</p>
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => router.push("/auth/login")}
          >
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  // Ensure userData is not null
  if (!userData) return null;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      } transition-colors duration-300 font-sans`}
    >
      {/* Mobile Header */}
      <header
        className={`lg:hidden sticky top-0 z-30 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } px-4 py-3 shadow-sm`}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  <Bell
                    size={18}
                    className="text-gray-500 dark:text-gray-300"
                  />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-green-600 text-white text-xs flex items-center justify-center shadow-sm">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className={`w-80 rounded-lg shadow-lg ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } border`}
              >
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      Aucune notification
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-t ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all`}
                        onClick={() => markNotificationAsRead(notif.id)}
                      >
                        <p
                          className={`text-sm ${
                            notif.read
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-800 dark:text-gray-100 font-medium"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(notif.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ModernSidebar
          isDarkMode={isDarkMode}
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          router={router}
          userData={userData}
          handleOpenReclamation={handleOpenReclamation}
          handleLogout={handleLogout}
        />
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block col-span-3">
            <div className="sticky top-8">
              <ModernSidebar
                isDarkMode={isDarkMode}
                activeMenuItem={activeMenuItem}
                setActiveMenuItem={setActiveMenuItem}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                router={router}
                userData={userData}
                handleOpenReclamation={handleOpenReclamation}
                handleLogout={handleLogout}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="col-span-12 lg:col-span-9">
            {/* Desktop Header */}
            <div
              className={`hidden lg:flex items-center justify-between mb-6 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-sm rounded-xl p-5 border ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  Tableau de bord
                </h1>
                <p
                  className={`mt-1 text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Bonjour, {userData.prenom}. Bienvenue dans votre espace.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <Bell
                        size={18}
                        className="text-gray-500 dark:text-gray-300"
                      />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-green-600 text-white text-xs flex items-center justify-center shadow-sm">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={`w-80 rounded-lg shadow-lg ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } border`}
                  >
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                          Aucune notification
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-t ${
                              isDarkMode ? "border-gray-700" : "border-gray-200"
                            } hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all`}
                            onClick={() => markNotificationAsRead(notif.id)}
                          >
                            <p
                              className={`text-sm ${
                                notif.read
                                  ? "text-gray-500 dark:text-gray-400"
                                  : "text-gray-800 dark:text-gray-100 font-medium"
                              }`}
                            >
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(notif.date).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                    id="dark-mode-toggle"
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  />
                  <Moon className="h-4 w-4 text-gray-400 dark:text-green-300" />
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div
              className={`rounded-xl overflow-hidden ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-md border ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card
                    className={`${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } border-${
                      isDarkMode ? "gray-700" : "gray-100"
                    } shadow-md rounded-2xl hover:shadow-lg transition-shadow`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Rendez-vous du mois
                          </p>
                          <h3
                            className={`text-3xl font-bold ${
                              isDarkMode ? "text-gray-100" : "text-gray-900"
                            } mt-2`}
                          >
                            {stats.rdvCeMois}
                          </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <CalendarIcon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress
                          value={65}
                          className={`h-2 ${
                            isDarkMode ? "bg-blue-900" : "bg-blue-100"
                          }`}
                          indicatorClassName="bg-blue-600 rounded-full"
                        />
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          } mt-2`}
                        >
                          65% de votre objectif mensuel
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className={`${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } border-${
                      isDarkMode ? "gray-700" : "gray-100"
                    } shadow-md rounded-2xl hover:shadow-lg transition-shadow`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Patients actifs
                          </p>
                          <h3
                            className={`text-3xl font-bold ${
                              isDarkMode ? "text-gray-100" : "text-gray-900"
                            } mt-2`}
                          >
                            24
                          </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress
                          value={78}
                          className={`h-2 ${
                            isDarkMode ? "bg-green-900" : "bg-green-100"
                          }`}
                          indicatorClassName="bg-green-600 rounded-full"
                        />
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          } mt-2`}
                        >
                          +2 nouveaux patients cette semaine
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className={`${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } border-${
                      isDarkMode ? "gray-700" : "gray-100"
                    } shadow-md rounded-2xl hover:shadow-lg transition-shadow`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Taux d'assiduité
                          </p>
                          <h3
                            className={`text-3xl font-bold ${
                              isDarkMode ? "text-gray-100" : "text-gray-900"
                            } mt-2`}
                          >
                            92%
                          </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          <BarChart2 className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress
                          value={92}
                          className={`h-2 ${
                            isDarkMode ? "bg-purple-900" : "bg-purple-100"
                          }`}
                          indicatorClassName="bg-purple-600 rounded-full"
                        />
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          } mt-2`}
                        >
                          Taux d'annulation: {stats.tauxAnnulation}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card
                      className={`${
                        isDarkMode ? "bg-gray-800" : "bg-white"
                      } border-${
                        isDarkMode ? "gray-700" : "gray-100"
                      } shadow-md rounded-2xl hover:shadow-lg transition-shadow`}
                    >
                      <CardHeader
                        className={`${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gradient-to-r from-white to-gray-50 border-gray-100"
                        } border-b rounded-t-2xl`}
                      >
                        <CardTitle
                          className={`font-bold ${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          Prochain rendez-vous
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {prochainRdv ? (
                          <div className="flex flex-col md:flex-row gap-6">
                            <div
                              className={`${
                                isDarkMode
                                  ? "bg-green-900/30"
                                  : "bg-gradient-to-br from-green-50 to-green-100"
                              } rounded-xl p-5 flex items-center justify-center shadow-sm`}
                            >
                              <CalendarIcon
                                className={`h-14 w-14 ${
                                  isDarkMode
                                    ? "text-green-400"
                                    : "text-green-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <h3
                                className={`text-xl font-semibold ${
                                  isDarkMode ? "text-gray-100" : "text-gray-900"
                                }`}
                              >
                                {formatDate(prochainRdv.date)} à{" "}
                                {prochainRdv.heure_debut}
                              </h3>
                              <p
                                className={`${
                                  isDarkMode ? "text-gray-300" : "text-gray-600"
                                } mt-2`}
                              >
                                Avec {prochainRdv.utilisateur.prenom}{" "}
                                {prochainRdv.utilisateur.nom}
                              </p>
                              <div className="mt-6 flex gap-4">
                                <Button className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all">
                                  Voir les détails
                                </Button>
                                <Button
                                  variant="outline"
                                  className={`${
                                    isDarkMode
                                      ? "border-green-600 hover:bg-green-900/20"
                                      : "border-green-200 hover:bg-green-50"
                                  } transition-all`}
                                >
                                  Préparer la séance
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div
                              className={`inline-flex p-5 rounded-full ${
                                isDarkMode ? "bg-gray-700" : "bg-gray-100"
                              }`}
                            >
                              <CalendarIcon
                                className={`h-12 w-12 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-400"
                                }`}
                              />
                            </div>
                            <h3
                              className={`text-lg font-medium ${
                                isDarkMode ? "text-gray-100" : "text-gray-900"
                              } mt-4`}
                            >
                              Aucun rendez-vous à venir
                            </h3>
                            <p
                              className={`${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              } mt-2`}
                            >
                              Vous n'avez pas de rendez-vous programmé pour le
                              moment
                            </p>
                            <Button className="mt-4 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all">
                              Voir votre calendrier
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <Card
                      className={`${
                        isDarkMode ? "bg-gray-800" : "bg-white"
                      } border-${
                        isDarkMode ? "gray-700" : "gray-100"
                      } shadow-md rounded-2xl hover:shadow-lg transition-shadow`}
                    >
                      <CardHeader
                        className={`${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gradient-to-r from-white to-gray-50 border-gray-100"
                        } border-b rounded-t-2xl`}
                      >
                        <CardTitle
                          className={`font-bold ${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          Notifications récentes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {notifications.length > 0 ? (
                          <div className="space-y-4">
                            {notifications.slice(0, 3).map((notification) => (
                              <div
                                key={notification.id}
                                className={`flex gap-3 items-start p-4 rounded-xl transition-all hover:${
                                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                                } cursor-pointer`}
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                              >
                                <div
                                  className={`p-2.5 rounded-lg ${
                                    isDarkMode
                                      ? "bg-blue-900/30 text-blue-400"
                                      : "bg-blue-50 text-blue-600"
                                  }`}
                                >
                                  <Bell className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h4
                                    className={`font-medium ${
                                      isDarkMode
                                        ? "text-gray-100"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {notification.message}
                                  </h4>
                                  <p
                                    className={`text-xs ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-400"
                                    } mt-2`}
                                  >
                                    {new Date(notification.date).toLocaleString(
                                      "fr-FR"
                                    )}
                                  </p>
                                  {!notification.read && (
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {notifications.length > 3 && (
                              <Button
                                variant="ghost"
                                className={`w-full mt-2 ${
                                  isDarkMode
                                    ? "text-green-400 hover:bg-green-900/20"
                                    : "text-green-600 hover:bg-green-50"
                                }`}
                                onClick={() =>
                                  router.push(
                                    `/dashboard/dashboardpsy/${userData.id}/notifications`
                                  )
                                }
                              >
                                Voir toutes les notifications (
                                {notifications.length})
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div
                              className={`inline-flex p-5 rounded-full ${
                                isDarkMode ? "bg-gray-700" : "bg-gray-100"
                              }`}
                            >
                              <Bell
                                className={`h-12 w-12 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-400"
                                }`}
                              />
                            </div>
                            <h3
                              className={`text-lg font-medium ${
                                isDarkMode ? "text-gray-100" : "text-gray-900"
                              } mt-4`}
                            >
                              Aucune notification
                            </h3>
                            <p
                              className={`${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              } mt-2`}
                            >
                              Vous n'avez pas de nouvelles notifications
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Floating Actions (Mobile) */}
      <div className="fixed bottom-6 left-6 z-40 lg:hidden">
        <div className="flex flex-col space-y-3">
          <button
            onClick={toggleDarkMode}
            className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
              isDarkMode ? "bg-green-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-700"
            }`}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`py-6 border-t ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } mt-8`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                © 2025 PsyPulse. Tous droits réservés.
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className={`${
                  isDarkMode
                    ? "text-gray-400 hover:text-green-300"
                    : "text-gray-500 hover:text-green-700"
                }`}
              >
                Conditions d'utilisation
              </a>
              <a
                href="#"
                className={`${
                  isDarkMode
                    ? "text-gray-400 hover:text-green-300"
                    : "text-gray-500 hover:text-green-700"
                }`}
              >
                Politique de confidentialité
              </a>
              <a
                href="#"
                className={`${
                  isDarkMode
                    ? "text-gray-400 hover:text-green-300"
                    : "text-gray-500 hover:text-green-700"
                }`}
              >
                Aide
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Reclamation Form Modal */}
      <ReclamationForm
        isOpen={showReclamationModal}
        onClose={handleCloseReclamation}
        userId={userData.id}
        userRole={userData.role}
      />
    </div>
  );
}
