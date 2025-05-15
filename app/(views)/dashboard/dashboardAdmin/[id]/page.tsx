"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  BarChart4,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Home,
  User,
  Bell,
  Moon,
  Sun,
} from "lucide-react";

import AdminCharts from "../../../../components/AdminCharts";
import PendingAccountsTable from "../../../../components/PendingAccountsTable";
import { useRouter } from "next/navigation";
import GrowthRateCard from "../../../../components/GrowthRateCard";
import SatisfactionRateGauge from "../../../../components/SatisfactionRateGauge";
import AccountStatusCard from "../../../../components/AccountStatusCard";
import UserActivityCard from "../../../../components/UserActivityCard";
import ConsultationTypesChart from "../../../../components/ConsultationTypesChart";

// Interface for authenticated user
interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Interface for a user account
export interface UserAccount {
  name: string;
  email: string;
  role: string;
  statut: boolean;
}

// Extended interface for user details
interface UserDetails extends UserAccount {
  id?: number;
  phone?: string;
  address?: string;
  createdAt?: string;
  lastLogin?: string;
  dateNaissance?: string;
  civilite?: string;
  numeroCarteEtudiant?: string;
  niveau?: string;
  university?: string;
  studyYear?: string;
  cin?: string;
  titre?: string;
  speciality?: string;
  etablissement?: string;
  adresseCabinet?: string;
  intituleDiplome?: string;
  dateObtention?: string;
  modeConsultation?: string;
  licenseNumber?: string;
  yearsExperience?: number;
}

// Interface for a notification
interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

const AdminDashboard = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationLoading, setNotificationLoading] =
    useState<boolean>(false);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch authenticated user details
  async function fetchMe() {
    try {
      const response = await fetch("/api/auth/admin/me", {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch admin");
      }
      const data = await response.json();
      if (data.success) {
        setUser(data.admin);
        return data.admin;
      } else {
        throw new Error("User authentication failed");
      }
    } catch (error) {
      console.error("Erreur fetchMe:", error);
      setAuthError("Failed to authenticate");
      router.push("/auth/login");
      throw error;
    }
  }
  useEffect(() => {
    fetchMe();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(
        now.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/admin", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des comptes");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setAccounts(data);
      } else {
        throw new Error("Les données récupérées ne sont pas valides");
      }
    } catch (error: any) {
      console.error("Erreur fetchAccounts :", error);
      setError("Impossible de récupérer les comptes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationLoading(true);
    setNotificationError(null);
    try {
      const adminId = user?.id || 1;
      const res = await fetch(
        `/api/notifications/admin?administrateurId=${adminId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des notifications");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(
          data.map((notif: any) => ({
            id: notif.id,
            message: notif.message,
            date: new Date(notif.date).toLocaleString(),
            read: notif.read,
          }))
        );
      } else {
        throw new Error("Les données des notifications ne sont pas valides");
      }
    } catch (error: any) {
      console.error("Erreur fetchNotifications :", error);
      setNotificationError("Impossible de récupérer les notifications.");
    } finally {
      setNotificationLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Erreur lors du marquage de la notification comme lue");
      }
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error: any) {
      console.error("Erreur markAsRead :", error);
      setNotificationError("Impossible de marquer la notification comme lue.");
    }
  };

  const handleDelete = async (email: string) => {
    try {
      const res = await fetch("/api/auth/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const responseData = await res.json();
      if (res.ok && responseData.success) {
        console.log(`Compte avec l'email ${email} supprimé avec succès`);
        fetchAccounts();
      } else {
        console.error(
          "Erreur API :",
          responseData.error || "Suppression échouée"
        );
        setError(responseData.error || "Suppression échouée");
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression du compte :", error);
      setError("Erreur lors de la suppression du compte.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchNotifications();
    }
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [user]);

  const handleStatusChange = async (
    email: string,
    action: "activate" | "deactivate"
  ) => {
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
        credentials: "include",
      });
      const responseData = await res.json();
      if (res.ok && responseData.success) {
        console.log(`Statut mis à jour pour ${email}`);
        fetchAccounts();
      } else {
        console.error("Erreur API :", responseData.error || "Action échouée");
        setError(responseData.error || "Action échouée");
      }
    } catch (error: any) {
      console.error("Erreur lors du changement de statut :", error);
      setError("Erreur lors de la mise à jour du statut.");
    }
  };

  const [profileData, setProfileData] = useState({
    email: user?.email || "",
    ancien_mot_de_passe: "",
    nouveau_mot_de_passe: "",
    confirmer_mot_de_passe: "",
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (
      profileData.nouveau_mot_de_passe !== profileData.confirmer_mot_de_passe
    ) {
      setProfileError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const adminId = user?.id || 1;
      const updateData = {
        email: profileData.email || undefined,
        ancien_mot_de_passe: profileData.ancien_mot_de_passe || undefined,
        nouveau_mot_de_passe: profileData.nouveau_mot_de_passe || undefined,
      };

      const res = await fetch(`/api/auth/admin/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error("Réponse invalide du serveur");
      }

      if (!res.ok) {
        throw new Error(data.error || `Erreur: ${res.status}`);
      }

      setProfileSuccess("Profil mis à jour avec succès");
      setProfileData({
        ...profileData,
        ancien_mot_de_passe: "",
        nouveau_mot_de_passe: "",
        confirmer_mot_de_passe: "",
      });
      if (data.email) {
        setUser((prev) => (prev ? { ...prev, email: data.email } : prev));
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      setProfileError(error.message || "Une erreur s'est produite");
    }
  };

  const getUserDetails = async (email: string): Promise<UserDetails> => {
    try {
      const res = await fetch(
        `/api/auth/admin?email=${encodeURIComponent(email)}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Erreur lors de la récupération des détails"
        );
      }
      const userData = await res.json();
      return userData;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des détails:", error);
      throw error;
    }
  };

  const sidebarButtonClass = (section: string) => `
    w-full flex items-center p-4 hover:bg-blue-50 transition-colors rounded-lg my-1 mx-2
    ${
      activeSection === section
        ? darkMode
          ? "bg-blue-700 text-white shadow-md"
          : "bg-blue-100 text-blue-800 shadow-md"
        : darkMode
        ? "text-gray-300"
        : "text-gray-700"
    }
  `;

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  if (!user && !authError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div
          className={`animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400`}
        ></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{authError}</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div
        className={`${
          darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
        } transition-all duration-300 shadow-lg z-20 ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div
          className={`p-4 flex justify-between items-center border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {!sidebarCollapsed && (
            <div className="flex items-center">
              <div
                className={`${
                  darkMode ? "bg-blue-600" : "bg-blue-50"
                } rounded-lg p-1 mr-2`}
              >
                <div
                  className={`${
                    darkMode ? "text-blue-200" : "text-blue-500"
                  } font-bold text-lg`}
                >
                  E
                </div>
              </div>
              <h2
                className={`font-bold text-xl ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Espace Administrateur
              </h2>
            </div>
          )}
          {sidebarCollapsed && (
            <div
              className={`mx-auto ${
                darkMode ? "bg-blue-600" : "bg-blue-50"
              } rounded-lg p-1`}
            >
              <div
                className={`${
                  darkMode ? "text-blue-200" : "text-blue-500"
                } font-bold text-lg`}
              >
                E
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-1 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } transition-colors`}
          >
            {sidebarCollapsed ? (
              <ChevronRight
                size={18}
                className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
              />
            ) : (
              <ChevronLeft
                size={18}
                className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
              />
            )}
          </button>
        </div>

        <div className="mt-4 px-3">
          {!sidebarCollapsed && (
            <div className="mb-6 px-3">
              <div
                className={`text-xs uppercase ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                } font-semibold mb-2`}
              >
                Admin
              </div>
              <div
                className={`${
                  darkMode ? "bg-blue-700" : "bg-blue-50"
                } flex items-center gap-3 p-2 rounded-lg`}
              >
                <div
                  className={`${
                    darkMode ? "bg-blue-600" : "bg-blue-100"
                  } rounded-full p-2`}
                >
                  <User
                    size={18}
                    className={`${
                      darkMode ? "text-blue-300" : "text-blue-500"
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-medium text-sm ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {user?.name || "Admin User"}
                  </h3>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Administrateur
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="px-2 mt-2">
          {!sidebarCollapsed && (
            <div
              className={`text-xs uppercase ${
                darkMode ? "text-gray-400" : "text-gray-500"
              } font-semibold mb-2 px-4`}
            >
              Principal
            </div>
          )}
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveSection("dashboard")}
                className={sidebarButtonClass("dashboard")}
              >
                <Home className="h-5 w-5" />
                {!sidebarCollapsed && <span className="ml-4">Dashboard</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("users")}
                className={sidebarButtonClass("users")}
              >
                <Users className="h-5 w-5" />
                {!sidebarCollapsed && (
                  <span className="ml-4">Utilisateurs</span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("analytics")}
                className={sidebarButtonClass("analytics")}
              >
                <BarChart4 className="h-5 w-5" />
                {!sidebarCollapsed && (
                  <span className="ml-4">Statistiques</span>
                )}
              </button>
            </li>
          </ul>

          {!sidebarCollapsed && (
            <div
              className={`text-xs uppercase ${
                darkMode ? "text-gray-400" : "text-gray-500"
              } font-semibold mb-2 mt-8 px-4`}
            >
              Paramètres
            </div>
          )}
          <ul className="space-y-1 mt-4">
            <li>
              <button
                onClick={() => setActiveSection("profile")}
                className={sidebarButtonClass("profile")}
              >
                <User className="h-5 w-5" />
                {!sidebarCollapsed && <span className="ml-4">Mon Profil</span>}
              </button>
            </li>
          </ul>

          <div className="absolute bottom-8 left-0 px-4">
            <button
              className={`flex items-center p-2 text-sm ${
                darkMode
                  ? "bg-red-700 hover:bg-red-600 text-red-200"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
              } transition-colors rounded-lg`}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-4">Déconnexion</span>}
            </button>
          </div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header
          className={`${
            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
          } shadow-sm p-4 flex justify-between items-center`}
        >
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">{currentTime}</div>
            <div className="text-sm">{currentDate}</div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              } rounded-full transition-colors`}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            <div className="relative">
              <button
                className={`p-2 ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } rounded-full transition-colors relative`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell
                  className={`h-5 w-5 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className={`absolute right-0 mt-2 w-80 ${
                    darkMode
                      ? "bg-gray-800 text-gray-200"
                      : "bg-white text-gray-800"
                  } rounded-lg shadow-xl z-50 border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`p-4 border-b ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationLoading && (
                      <div className="flex justify-center items-center h-40">
                        <div
                          className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                            darkMode ? "border-blue-300" : "border-blue-400"
                          }`}
                        ></div>
                      </div>
                    )}
                    {notificationError && (
                      <div
                        className={`p-3 ${
                          darkMode ? "text-red-400" : "text-red-600"
                        } text-sm`}
                      >
                        {notificationError}
                      </div>
                    )}
                    {!notificationLoading &&
                      !notificationError &&
                      notifications.length === 0 && (
                        <div
                          className={`p-3 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          } text-sm`}
                        >
                          Aucune notification disponible.
                        </div>
                      )}
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b ${
                          darkMode
                            ? "border-gray-700 hover:bg-gray-700"
                            : "border-gray-100 hover:bg-gray-50"
                        } ${
                          !notification.read
                            ? darkMode
                              ? "bg-blue-700"
                              : "bg-blue-50"
                            : ""
                        } cursor-pointer`}
                        onClick={() =>
                          !notification.read && markAsRead(notification.id)
                        }
                      >
                        <div className="flex mb-1">
                          <p className="text-sm flex-1">
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 bg-blue-400 rounded-full"></span>
                          )}
                        </div>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {notification.date}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`p-2 text-center border-t ${
                      darkMode ? "border-gray-700" : "border-gray-100"
                    }`}
                  >
                    <button
                      className={`text-sm ${
                        darkMode
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-500 hover:text-blue-700"
                      }`}
                    >
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <div
                className={`h-10 w-10 ${
                  darkMode ? "bg-blue-700" : "bg-blue-100"
                } rounded-full flex items-center justify-center ${
                  darkMode ? "text-blue-200" : "text-blue-700"
                } font-semibold`}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "AD"}
              </div>
              {!sidebarCollapsed && (
                <span className="ml-2 text-sm">{user?.email}</span>
              )}
            </div>
          </div>
        </header>

        <div
          className={`flex-1 overflow-auto p-6 ${
            darkMode ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <div className="mb-6">
            <h1
              className={`text-2xl font-bold ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {activeSection === "dashboard" && "Tableau de bord"}
              {activeSection === "users" && "Gestion des utilisateurs"}
              {activeSection === "analytics" && "Statistiques avancées"}
              {activeSection === "profile" && "Mon Profil"}
            </h1>
            <p
              className={`text-sm mt-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {activeSection === "dashboard" &&
                "Vue d'ensemble des performances et activités"}
              {activeSection === "users" &&
                "Gestion et surveillance des comptes utilisateurs"}
              {activeSection === "analytics" &&
                "Analyses détaillées et métriques"}
              {activeSection === "profile" &&
                "Gérer vos informations personnelles"}
            </p>
          </div>

        
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              {/* Résumé général */}
             

              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="animate-fade-in">
                  <GrowthRateCard darkMode={darkMode} />
                </div>
                <div className="animate-fade-in animation-delay-100">
                  <SatisfactionRateGauge darkMode={darkMode} />
                </div>
                <div className="animate-fade-in animation-delay-200">
                  <AccountStatusCard darkMode={darkMode} />
                </div>
              </div>

              {/* Statistiques secondaires */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="animate-fade-in animation-delay-300">
                  <UserActivityCard darkMode={darkMode} />
                </div>
                <div className="animate-fade-in animation-delay-400">
                  <ConsultationTypesChart darkMode={darkMode} />
                </div>
              </div>

              {/* Graphiques détaillés */}
              <div className="mt-6">
                <h2
                  className={`text-lg font-semibold mb-4 ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Tendances globales
                </h2>
                <AdminCharts darkMode={darkMode} />
              </div>

              {/* Tableau des comptes en attente */}
              <div
                className={`${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-800"
                } p-6 rounded-xl shadow-sm`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Activation des comptes
                  </h2>
                  <button
                    onClick={fetchAccounts}
                    
                    className={`px-4 py-2 ${
                      darkMode
                        ? "bg-blue-700 text-blue-200 hover:bg-blue-600"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } rounded-lg transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300`}
                  >
                    
                    Rafraîchir
                  </button>
                </div>

                {loading && (
                  <div className="flex justify-center items-center h-40">
                    <div
                      className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                        darkMode ? "border-blue-300" : "border-blue-400"
                      }`}
                    ></div>
                  </div>
                )}

                {error && (
                  <div
                    className={`${
                      darkMode
                        ? "bg-red-800 text-red-300"
                        : "bg-red-50 text-red-700"
                    } p-4 rounded-lg mb-4 flex items-start`}
                  >
                    <svg
                      className="w-5 h-5 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {!loading && !error && accounts.length === 0 ? (
                  <div
                    className={`text-center py-12 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Users
                      className={`w-12 h-12 mx-auto ${
                        darkMode ? "text-gray-600" : "text-gray-300"
                      } mb-4`}
                    />
                    <p>Aucun compte en attente d'activation.</p>
                  </div>
                ) : (
                  <PendingAccountsTable
                    accounts={accounts}
                    refresh={fetchAccounts}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    getUserDetails={getUserDetails}
                    darkMode={darkMode}
                  />
                )}
              </div>
            </div>
          )}

          {activeSection === "analytics" && (
            <div
              className={`${
                darkMode
                  ? "bg-gray-800 text-gray-200"
                  : "bg-white text-gray-800"
              } shadow-sm rounded-xl p-6 space-y-6`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Statistiques avancées</h2>
                <div className="flex gap-4">
                  <select
                    className={`px-3 py-2 border ${
                      darkMode
                        ? "border-gray-600 bg-gray-700 text-gray-200"
                        : "border-gray-300 bg-white text-gray-800"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300`}
                    onChange={(e) => {
                      // Logique pour filtrer par période (ex. : dernier mois, trimestre)
                      console.log("Période sélectionnée:", e.target.value);
                    }}
                  >
                    <option value="last30days">Derniers 30 jours</option>
                    <option value="last90days">Derniers 90 jours</option>
                    <option value="thisYear">Cette année</option>
                  </select>
                  <select
                    className={`px-3 py-2 border ${
                      darkMode
                        ? "border-gray-600 bg-gray-700 text-gray-200"
                        : "border-gray-300 bg-white text-gray-800"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300`}
                    onChange={(e) => {
                      // Logique pour filtrer par type de données (ex. : utilisateurs, consultations)
                      console.log("Type sélectionné:", e.target.value);
                    }}
                  >
                    <option value="users">Utilisateurs</option>
                    <option value="consultations">Consultations</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
              </div>
              <AdminCharts darkMode={darkMode} />
            </div>
          )}

          {activeSection === "profile" && (
            <div
              className={`${
                darkMode
                  ? "bg-gray-800 text-gray-200"
                  : "bg-white text-gray-800"
              } shadow-sm rounded-xl p-6`}
            >
              <h2 className="text-lg font-semibold mb-4">
                Modifier mon profil
              </h2>

              {profileSuccess && (
                <div
                  className={`${
                    darkMode
                      ? "bg-green-800 border-green-700 text-green-300"
                      : "bg-green-50 border-green-200 text-green-700"
                  } border px-4 py-3 rounded-lg mb-4 flex items-center`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  {profileSuccess}
                </div>
              )}

              {profileError && (
                <div
                  className={`${
                    darkMode
                      ? "bg-red-800 border-red-700 text-red-300"
                      : "bg-red-50 border-red-200 text-red-700"
                  } border px-4 py-3 rounded-lg mb-4 flex items-center`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {profileError}
                </div>
              )}

              <div
                className={`${
                  darkMode
                    ? "bg-blue-900 border-blue-800"
                    : "bg-blue-50 border-blue-100"
                } border p-4 rounded-lg mb-6`}
              >
                <div className="flex items-start">
                  <div
                    className={`${
                      darkMode ? "bg-blue-800" : "bg-blue-100"
                    } p-2 rounded-lg mr-3`}
                  >
                    <User
                      className={`h-5 w-5 ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-medium ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      Informations personnelles
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-blue-300" : "text-blue-500"
                      } mt-1`}
                    >
                      Mettez à jour vos informations de compte et vos paramètres
                      de sécurité
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleProfileUpdate}
                className="space-y-5 max-w-lg"
              >
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className={`w-full px-3 py-2 border ${
                      darkMode
                        ? "border-gray-600 bg-gray-700 text-gray-200"
                        : "border-gray-300 bg-white text-gray-800"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors`}
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    placeholder="Entrez votre nouvel email"
                  />
                </div>

                <div
                  className={`border-t ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } pt-5 mt-4`}
                >
                  <h3
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } mb-3`}
                  >
                    Modifier le mot de passe
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        } mb-1`}
                      >
                        Ancien mot de passe
                      </label>
                      <input
                        type="password"
                        className={`w-full px-3 py-2 border ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-gray-200"
                            : "border-gray-300 bg-white text-gray-800"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors`}
                        value={profileData.ancien_mot_de_passe}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            ancien_mot_de_passe: e.target.value,
                          })
                        }
                        placeholder="Entrez votre ancien mot de passe"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        } mb-1`}
                      >
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        className={`w-full px-3 py-2 border ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-gray-200"
                            : "border-gray-300 bg-white text-gray-800"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors`}
                        value={profileData.nouveau_mot_de_passe}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            nouveau_mot_de_passe: e.target.value,
                          })
                        }
                        placeholder="Entrez votre nouveau mot de passe"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        } mb-1`}
                      >
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        className={`w-full px-3 py-2 border ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-gray-200"
                            : "border-gray-300 bg-white text-gray-800"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors`}
                        value={profileData.confirmer_mot_de_passe}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            confirmer_mot_de_passe: e.target.value,
                          })
                        }
                        placeholder="Confirmez votre nouveau mot de passe"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`px-5 py-2.5 ${
                      darkMode
                        ? "bg-blue-700 text-blue-200 hover:bg-blue-600"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } rounded-lg transition-colors font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300`}
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
