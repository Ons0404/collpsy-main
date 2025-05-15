"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import {
  Sun,
  Moon,
  Bell,
  Menu,
  LogOut,
  User,
  Home,
  Calendar,
  ClipboardCheck,
  ChevronRight,
  MessageSquare,
  Brain,
  Smile,
  BookOpen,
  Sparkles,
  AlertTriangle,
  BarChart2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ReclamationForm from "./ReclamationForm/page";
import { useToast } from "../../../../(mvc)/hooks/use-toast";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "PSYCHOLOGUE" | "ETUDIANT";
  civilite: "M" | "Mme";
  avatar?: string | null;
  telephone?: string;
  date_naissance?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  etudiant?: {
    id_etudiant: number;
    numero_carte_etudiant?: string;
    niveau?: string;
    etablissement?: string;
  };
}

interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

interface TestCategoryData {
  category: string;
  completed: number;
}

const ModernSidebar: React.FC<{
  isDarkMode: boolean;
  activeMenuItem: string;
  setActiveMenuItem: (item: string) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  router: ReturnType<typeof useRouter>;
  handleGoToChat: () => void;
  handleRendezvous: () => void;
  handleConsultations: () => void;
  handleTests: () => void;
  handleGoToProfile: () => void;
  handleGotomessages: () => void;
  handleOpenReclamation: () => void;
  handleStatistics: () => void;
  handleLogout: () => void;
}> = ({
  isDarkMode,
  activeMenuItem,
  setActiveMenuItem,
  setIsMobileSidebarOpen,
  router,
  handleGoToChat,
  handleRendezvous,
  handleConsultations,
  handleTests,
  handleGoToProfile,
  handleGotomessages,
  handleOpenReclamation,
  handleStatistics,
  handleLogout,
}) => {
  const menuItems = [
    {
      icon: <Home size={18} />,
      label: "Tableau de bord",
      value: "dashboard",
    },
    { icon: <User size={18} />, label: "Profil", value: "profile" },
    {
      icon: (
        <Avatar className="h-5 w-5">
          <AvatarImage
            src="/slimenelabyedh.jpeg"
            alt="Dr Slimane Labyedh"
            onError={() => {
              console.error("Failed to load Dr Slimane Labyedh image");
            }}
          />
          <AvatarFallback>SL</AvatarFallback>
        </Avatar>
      ),
      label: "Dr Slimane Labyedh",
      value: "chat",
    },
    { icon: <Bell size={18} />, label: "Rendezvous", value: "rendezvous" },
    {
      icon: <Calendar size={18} />,
      label: "Consultations",
      value: "consultations",
    },
    { icon: <ClipboardCheck size={18} />, label: "Tests", value: "tests" },
    {
      icon: <MessageSquare size={18} />,
      label: "Ahki lel psy",
      value: "messages",
    },
    {
      icon: <AlertTriangle size={18} />,
      label: "Signaler un problème",
      value: "reclamation",
    },
    {
      icon: <BarChart2 size={18} />,
      label: "Statistiques",
      value: "statistics",
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
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                if (item.value === "chat") handleGoToChat();
                else if (item.value === "rendezvous") handleRendezvous();
                else if (item.value === "consultations") handleConsultations();
                else if (item.value === "tests") handleTests();
                else if (item.value === "profile") handleGoToProfile();
                else if (item.value === "messages") handleGotomessages();
                else if (item.value === "reclamation") handleOpenReclamation();
                else if (item.value === "statistics") handleStatistics();
                else setActiveMenuItem(item.value);
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

const DashboardEtudiant: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [avatarError, setAvatarError] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showQuickTip, setShowQuickTip] = useState<boolean>(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string>("dashboard");
  const [showReclamationModal, setShowReclamationModal] =
    useState<boolean>(false);
  const [testCategoryData, setTestCategoryData] = useState<TestCategoryData[]>(
    []
  );
  const [testDataLoading, setTestDataLoading] = useState<boolean>(false);
  const [testDataError, setTestDataError] = useState<string>("");
  const { toast } = useToast();
  const router = useRouter();

  const encouragementMessages: string[] = [
    "Écrivez 3 choses pour lesquelles vous êtes reconnaissant aujourd’hui 🐾💖",
    "Prenez 5 minutes pour dessiner quelque chose qui vous fait sourire 😺✨",
    "Notez un objectif que vous voulez atteindre cette semaine 🌟🐻",
    "Écoutez une chanson qui vous rend heureux et dansez un peu 🦄🎶",
    "Prenez une grande respiration et dites-vous : 'Je peux le faire !' 💪🐼",
    "Offrez un compliment à un ami ou un proche aujourd’hui 🌈💕",
    "Faites une petite promenade et observez la beauté autour de vous 🌻🐾",
  ];

  const getDailyMessage = (): string => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const messageIndex = dayOfYear % encouragementMessages.length;
    return encouragementMessages[messageIndex];
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const initialMode = savedTheme ? savedTheme === "dark" : false;
    setIsDarkMode(initialMode);
    document.documentElement.classList.toggle("dark", initialMode);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Optional: Call a logout API to invalidate the server-side session
      // await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error during server-side logout:", e);
    }
    // Clear client-side session data
    localStorage.removeItem("sessionToken"); // If using localStorage for tokens
    localStorage.removeItem("userId"); // Clear userId if still used
    // Clear cookies if used
    // document.cookie = "sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUserData(null);
    router.push("/auth/login");
  }, [router]);

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
  useEffect(() => {
    const fetchUserDataAndSession = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
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
            `Erreur lors de la récupération des données utilisateur: ${response.statusText}`
          );
        }
        const data = await response.json();
        if (data.success && data.user) {
          setUserData(data.user);
        } else {
          throw new Error(
            data.error || "Impossible de récupérer les données utilisateur."
          );
        }
      } catch (err) {
        console.error("Fetch user data error:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchUserDataAndSession();
  }, [toast, handleLogout]);
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userData?.id) return;
      try {
        const response = await fetch(
          `/api/notifications/utilisateur/${userData.id}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des notifications");
        }
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des notifications:", err);
      }
    };
    if (userData?.id) fetchNotifications();
  }, [userData]);

  useEffect(() => {
    const fetchTestCategoryData = async () => {
      if (activeMenuItem !== "statistics" || !userData?.id) return;
      setTestDataLoading(true);
      try {
        const response = await fetch(
          `/api/tests/completed-by-category?userId=${userData.id}`
        );
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données des tests"
          );
        }
        const data = await response.json();
        setTestCategoryData(data);
      } catch (err) {
        setTestDataError(
          err instanceof Error ? err.message : "Une erreur est survenue."
        );
        toast({
          title: "Erreur",
          description: "Impossible de charger les données des tests.",
          variant: "destructive",
        });
      } finally {
        setTestDataLoading(false);
      }
    };
    if (userData?.id) fetchTestCategoryData();
  }, [activeMenuItem, userData, toast]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  const handleGoToChat = () => {
    if (userData?.id) {
      setActiveMenuItem("chat");
      router.push(`/dashboard/dashboardEtudiant/${userData.id}/wall-e`);
    } else {
      toast({
        title: "Erreur",
        description: "Données utilisateur non chargées.",
        variant: "destructive",
      });
    }
  };

  const handleGotomessages = () => {
    if (userData?.id) {
      setActiveMenuItem("messages");
      router.push(`/dashboard/dashboardEtudiant/${userData.id}/messages`);
    } else {
      toast({
        title: "Erreur",
        description: "Données utilisateur non chargées.",
        variant: "destructive",
      });
    }
  };

  const handleGoToProfile = () => {
    if (userData?.id) {
      setActiveMenuItem("profile");
      router.push(`/dashboard/dashboardEtudiant/${userData.id}/ProfileSection`);
    } else {
      toast({
        title: "Erreur",
        description: "Données utilisateur non chargées.",
        variant: "destructive",
      });
    }
  };

  const handleRendezvous = () => {
    if (userData?.id) {
      setActiveMenuItem("rendezvous");
      router.push(`/dashboard/dashboardEtudiant/${userData.id}/rendezvous`);
    } else {
      toast({
        title: "Erreur",
        description: "Données utilisateur non chargées.",
        variant: "destructive",
      });
    }
  };

  const handleConsultations = () => {
    if (userData?.id) {
      setActiveMenuItem("consultations");
      router.push(`/dashboard/dashboardEtudiant/${userData.id}/consultations`);
    } else {
      toast({
        title: "Erreur",
        description: "Données utilisateur non chargées.",
        variant: "destructive",
      });
    }
  };

  const handleTests = () => {
    if (userData?.id) {
      setActiveMenuItem("tests");
      router.push(`/dashboard/dashboardEtudiant/${userData.id}/tests`);
    } else {
      toast({
        title: "Erreur",
        description: "Données utilisateur non chargées.",
        variant: "destructive",
      });
    }
  };

  const handleOpenReclamation = () => {
    setActiveMenuItem("reclamation");
    setShowReclamationModal(true);
  };

  const handleStatistics = () => {
    setActiveMenuItem("statistics");
  };

  const handleCloseReclamation = () => {
    setShowReclamationModal(false);
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const markNotificationAsRead = async (notificationId: number) => {
    const notificationToRemove = notifications.find(
      (notif) => notif.id === notificationId
    );
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la notification");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la notification:", err);
      if (notificationToRemove) {
        setNotifications((prev) => [...prev, notificationToRemove]);
      }
    }
  };

  const chartData = {
    labels: testCategoryData.map((item) => item.category),
    datasets: [
      {
        label: "Tests Complétés",
        data: testCategoryData.map((item) => item.completed),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Nombre de Tests Complétés par Catégorie",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Nombre de Tests",
        },
      },
      x: {
        title: {
          display: true,
          text: "Catégorie",
        },
      },
    },
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-slate-50"
        } transition-colors duration-300`}
      >
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-green-500 border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
    </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-slate-50"
        } transition-colors duration-300`}
      >
        <div className="max-w-md p-8 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Erreur de connexion
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{error}</p>
          <Button
            className="w-full py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-md transition-all"
            onClick={() => (window.location.href = "/auth/login")}
          >
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      } transition-colors duration-300 font-sans`}
    >
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
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={18} className="text-gray-500 dark:text-gray-300" />
              {notifications.filter((notif) => !notif.read).length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-green-600 text-white text-xs flex items-center justify-center shadow-sm">
                  {notifications.filter((notif) => !notif.read).length}
                </span>
              )}
            </button>
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              onClick={() => setShowQuickTip(!showQuickTip)}
            >
              <Sparkles
                size={18}
                className="text-gray-500 dark:text-gray-300"
              />
            </button>
            <Avatar className="h-8 w-8 ring-2 ring-green-500">
              {userData.avatar && !avatarError ? (
                <AvatarImage
                  src={`data:image/jpeg;base64,${userData.avatar}`}
                  alt={`${userData.prenom} ${userData.nom}`}
                  onError={handleAvatarError}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  {userData.prenom?.[0]}
                  {userData.nom?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col text-right">
              <p className="font-medium text-sm text-gray-800 dark:text-gray-100">
                {userData.prenom} {userData.nom}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userData.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      {showQuickTip && (
        <div
          className={`lg:hidden absolute top-16 right-4 z-50 w-64 rounded-lg shadow-lg ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border overflow-hidden`}
        >
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Lik Enti
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {getDailyMessage()}
            </p>
          </div>
        </div>
      )}

      {showNotifications && (
        <div
          className={`lg:hidden absolute top-16 right-4 z-50 w-64 rounded-lg shadow-lg ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border overflow-hidden`}
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
        </div>
      )}

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

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
          handleGoToChat={handleGoToChat}
          handleRendezvous={handleRendezvous}
          handleConsultations={handleConsultations}
          handleTests={handleTests}
          handleGoToProfile={handleGoToProfile}
          handleGotomessages={handleGotomessages}
          handleOpenReclamation={handleOpenReclamation}
          handleStatistics={handleStatistics}
          handleLogout={handleLogout}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="hidden lg:block col-span-3">
            <div className="sticky top-8">
              <ModernSidebar
                isDarkMode={isDarkMode}
                activeMenuItem={activeMenuItem}
                setActiveMenuItem={setActiveMenuItem}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                router={router}
                handleGoToChat={handleGoToChat}
                handleRendezvous={handleRendezvous}
                handleConsultations={handleConsultations}
                handleTests={handleTests}
                handleGoToProfile={handleGoToProfile}
                handleGotomessages={handleGotomessages}
                handleOpenReclamation={handleOpenReclamation}
                handleStatistics={handleStatistics}
                handleLogout={handleLogout}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div
              className={`hidden lg:flex items-center justify-between mb-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5 border ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Tableau de bord
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Bonjour, {userData.prenom}. Bienvenue dans votre espace.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell
                    size={18}
                    className="text-gray-500 dark:text-gray-300"
                  />
                  {notifications.filter((notif) => !notif.read).length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-green-600 text-white text-xs flex items-center justify-center shadow-sm">
                      {notifications.filter((notif) => !notif.read).length}
                    </span>
                  )}
                </button>
                <button
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  onClick={() => setShowQuickTip(!showQuickTip)}
                >
                  <Sparkles
                    size={18}
                    className="text-gray-500 dark:text-gray-300"
                  />
                </button>
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
                <Avatar className="h-10 w-10 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-800">
                  {userData.avatar && !avatarError ? (
                    <AvatarImage
                      src={`data:image/jpeg;base64,${userData.avatar}`}
                      alt={`${userData.prenom} ${userData.nom}`}
                      onError={handleAvatarError}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                      {userData.prenom?.[0]}
                      {userData.nom?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col text-right">
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-100">
                    {userData.prenom} {userData.nom}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userData.email}
                  </p>
                </div>
              </div>
            </div>

            {showQuickTip && (
              <div
                className={`hidden lg:block absolute top-20 right-8 z-50 w-80 rounded-lg shadow-lg ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } border overflow-hidden`}
              >
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    Lik Enti
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {getDailyMessage()}
                  </p>
                </div>
              </div>
            )}

            {showNotifications && (
              <div
                className={`hidden lg:block absolute top-20 right-8 z-50 w-80 rounded-lg shadow-lg ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } border overflow-hidden`}
              >
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
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
              </div>
            )}

            <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {activeMenuItem === "statistics" ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                      Statistiques des Tests Complétés
                    </h2>
                    {testDataLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-green-500 border-b-transparent border-l-transparent animate-spin"></div>
                        </div>
                      </div>
                    ) : testDataError ? (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                        <p className="text-red-600 dark:text-red-400">
                          {testDataError}
                        </p>
                      </div>
                    ) : testCategoryData.length === 0 ? (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-gray-600 dark:text-gray-300">
                          Aucun test complété pour le moment.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="h-[400px]">
                          <Bar data={chartData} options={chartOptions} />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            Résumé
                          </h3>
                          <ul className="space-y-2">
                            {testCategoryData.map((item) => (
                              <li
                                key={item.category}
                                className="text-sm text-gray-600 dark:text-gray-300"
                              >
                                <span className="font-medium">
                                  {item.category} :
                                </span>{" "}
                                {item.completed} test(s) complété(s)
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                          Bienvenue, {userData.prenom} !
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                          Votre espace est conçu pour soutenir votre bien-être
                          mental.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-all">
                        <div className="flex items-center">
                          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                            <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Consultations
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Gérer vos rendez-vous
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-all">
                        <div className="flex items-center">
                          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                            <ClipboardCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Tests
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Accéder aux questionnaires
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-all">
                        <div className="flex items-center">
                          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src="/slimenelabyedh.jpeg"
                                alt="Dr Slimane Labyedh"
                                onError={() => {
                                  console.error(
                                    "Failed to load Dr Slimane Labyedh image"
                                  );
                                }}
                              />
                              <AvatarFallback>SL</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Dr Slimane Labyedh
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Discuter avec votre psy
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Activités récentes
                      </h3>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            Activité
                          </span>
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            Date
                          </span>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                              <p className="text-gray-500 dark:text-gray-400">
                                Aucune activité récente à afficher
                              </p>
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                className="px-4 py-3 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span
                                  className={`text-sm ${
                                    notif.read
                                      ? "text-gray-500 dark:text-gray-400"
                                      : "text-gray-800 dark:text-gray-100"
                                  }`}
                                >
                                  {notif.message}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {new Date(notif.date).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Conseils pour les étudiants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 hover:shadow-md transition-all">
              <div className="mb-3">
                <div className="h-10 w-10 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Pratiquez la pleine conscience
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Prenez 5 minutes chaque jour pour méditer ou respirer
                profondément. Cela réduit le stress et améliore votre
                concentration avant d'étudier.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 hover:shadow-md transition-all">
              <div className="mb-3">
                <div className="h-10 w-10 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center">
                  <Smile className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Cultivez des relations positives
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Entourez-vous d'amis qui vous soutiennent. Partagez vos
                préoccupations et riez ensemble pour libérer des endorphines et
                améliorer votre humeur.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 hover:shadow-md transition-all">
              <div className="mb-3">
                <div className="h-10 w-10 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Planifiez des pauses créatives
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Dessinez, écrivez ou écoutez de la musique pendant vos pauses.
                Ces activités stimulent votre créativité et aident à prévenir
                l'épuisement mental.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer
        className={`py-6 border-t ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } mt-8`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 collpsy. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <ReclamationForm
        isOpen={showReclamationModal}
        onClose={handleCloseReclamation}
        userId={userData?.id ?? null}
        userRole={userData?.role ?? null}
      />
    </div>
  );
};

export default DashboardEtudiant;