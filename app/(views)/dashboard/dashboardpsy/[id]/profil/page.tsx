"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import {
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  Award,
  FileText,
  Camera,
  PenSquare,
  Save,
  X,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Psychologue {
  id_psychologue?: number;
  cin: string;
  titre: string;
  etablissement: string;
  adresse_cabinet?: string;
  intitule_diplome: string;
  date_obtention: string;
  mode_consultation?: string;
}

interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  date_naissance?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  telephone?: string;
  role: "PSYCHOLOGUE" | "ETUDIANT";
  civilite: "M" | "Mme";
  avatar?: string | null;
  psychologue?: Psychologue;
}

export default function ProfilPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("personnel");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Utilisateur non authentifié.");
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération.");
        const data = await response.json();
        setUserData(data.user || data);

        if (data.user?.avatar) {
          setAvatarPreview(`data:image/jpeg;base64,${data.user.avatar}`);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez télécharger une image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La taille du fichier doit être inférieure à 2 Mo");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Utilisateur non authentifié");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch(`/api/users/${userId}/avatar`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour de l'avatar");
      }

      const userResponse = await fetch(`/api/users/${userId}`);
      const userData = await userResponse.json();
      setUserData(userData);

      toast.success("Avatar mis à jour avec succès!");
    } catch (error) {
      console.error("Erreur de téléchargement de l'avatar:", error);
      toast.error("Échec de la mise à jour de l'avatar");
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<UserData>) => {
    if (!userData) return;

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Utilisateur non authentifié");

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      const freshResponse = await fetch(`/api/users/${userId}`);
      const freshData = await freshResponse.json();
      setUserData(freshData.user || freshData);

      setIsEditing(false);
      toast.success("Profil mis à jour avec succès!");
    } catch (error) {
      toast.error(
        `Échec de la mise à jour : ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    }
  };

  const navigateToHomepage = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/dashboard/dashboardpsy/${userId}`);
    } else {
      router.push("/auth/login");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md p-6 shadow-xl border-0 bg-gradient-to-br from-white to-red-50">
          <div className="text-center text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
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
          <CardTitle className="text-center mb-4 text-gray-800">
            Erreur
          </CardTitle>
          <p className="text-center text-gray-600">{error}</p>
          <Button
            className="w-full mt-6 bg-green-600 hover:bg-green-700"
            onClick={() => router.push("/auth/login")}
          >
            Retourner à la page de connexion
          </Button>
        </Card>
      </div>
    );

  if (!userData) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={navigateToHomepage}
        className="mb-6 text-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Retour au tableau de bord
      </Button>

      {/* Header with profile picture */}
      <div className="mb-8 relative">
        <div className="h-48 bg-green-50 rounded-xl shadow-lg"></div>
        <div className="absolute -bottom-16 left-8 w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <User className="w-12 h-12 text-gray-500" />
            </div>
          )}
          {!isEditing && (
            <button
              className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-tl-full hover:bg-green-700 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {!isEditing && (
          <div className="absolute bottom-6 right-8">
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-white text-green-600 hover:bg-green-50 shadow-md hover:shadow-lg transition-all"
              variant="outline"
            >
              <PenSquare className="w-4 h-4 mr-2" />
              Modifier le profil
            </Button>
          </div>
        )}
      </div>

      {/* Title and role */}
      <div className="mb-8 mt-20 px-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {userData.civilite} {userData.prenom} {userData.nom}
        </h1>
        <div className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {userData.role === "PSYCHOLOGUE" ? "Psychologue" : "Étudiant"}
        </div>
      </div>

      {isEditing ? (
        <Card className="shadow-xl mb-8 overflow-hidden border-0">
          <CardHeader className="bg-green-100 text-green-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Modifier mon profil</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-800 hover:bg-green-200"
                onClick={() => setIsEditing(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-64 bg-gray-50 border-r">
                <div className="py-4">
                  <button
                    className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                      activeSection === "personnel"
                        ? "bg-green-50 text-green-600 border-r-2 border-green-500 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setActiveSection("personnel")}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Informations personnelles
                  </button>
                  <button
                    className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                      activeSection === "adresse"
                        ? "bg-green-50 text-green-600 border-r-2 border-green-500 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => setActiveSection("adresse")}
                  >
                    <MapPin className="mr-3 h-5 w-5" />
                    Adresse
                  </button>
                  {userData.role === "PSYCHOLOGUE" && (
                    <button
                      className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                        activeSection === "professionnel"
                          ? "bg-green-50 text-green-600 border-r-2 border-green-500 font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setActiveSection("professionnel")}
                    >
                      <Briefcase className="mr-3 h-5 w-5" />
                      Informations professionnelles
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 p-6 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const updatedData: Partial<UserData> = {
                      civilite: formData.get("civilite") as "M" | "Mme",
                      nom: formData.get("nom") as string,
                      prenom: formData.get("prenom") as string,
                      email: formData.get("email") as string,
                      telephone: formData.get("telephone") as string,
                      date_naissance: formData.get("date_naissance") as string,
                      adresse: formData.get("adresse") as string,
                      ville: formData.get("ville") as string,
                      code_postal: formData.get("code_postal") as string,
                    };

                    if (
                      userData.role === "PSYCHOLOGUE" &&
                      userData.psychologue
                    ) {
                      updatedData.psychologue = {
                        ...userData.psychologue,
                        cin: formData.get("psychologue_cin") as string,
                        titre: formData.get("psychologue_titre") as string,
                        etablissement: formData.get(
                          "psychologue_etablissement"
                        ) as string,
                        adresse_cabinet: formData.get(
                          "psychologue_adresse_cabinet"
                        ) as string,
                        intitule_diplome: formData.get(
                          "psychologue_intitule_diplome"
                        ) as string,
                        date_obtention: formData.get(
                          "psychologue_date_obtention"
                        ) as string,
                        mode_consultation: formData.get(
                          "psychologue_mode_consultation"
                        ) as string,
                      };
                    }

                    handleProfileUpdate(updatedData);
                  }}
                >
                  {activeSection === "personnel" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Civilité
                          </label>
                          <select
                            name="civilite"
                            defaultValue={userData.civilite}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="M">M</option>
                            <option value="Mme">Mme</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Prénom
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            defaultValue={userData.prenom}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Nom
                          </label>
                          <input
                            type="text"
                            name="nom"
                            defaultValue={userData.nom}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={userData.email}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          defaultValue={userData.telephone || ""}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Date de naissance
                        </label>
                        <input
                          type="date"
                          name="date_naissance"
                          defaultValue={userData.date_naissance || ""}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  )}

                  {activeSection === "adresse" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Adresse
                        </label>
                        <input
                          type="text"
                          name="adresse"
                          defaultValue={userData.adresse || ""}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Ville
                          </label>
                          <input
                            type="text"
                            name="ville"
                            defaultValue={userData.ville || ""}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Code postal
                          </label>
                          <input
                            type="text"
                            name="code_postal"
                            defaultValue={userData.code_postal || ""}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "professionnel" &&
                    userData.role === "PSYCHOLOGUE" &&
                    userData.psychologue && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              CIN
                            </label>
                            <input
                              type="text"
                              name="psychologue_cin"
                              defaultValue={userData.psychologue.cin || ""}
                              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                              Titre
                            </label>
                            <input
                              type="text"
                              name="psychologue_titre"
                              defaultValue={userData.psychologue.titre || ""}
                              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Établissement
                          </label>
                          <input
                            type="text"
                            name="psychologue_etablissement"
                            defaultValue={
                              userData.psychologue.etablissement || ""
                            }
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Adresse du cabinet
                          </label>
                          <input
                            type="text"
                            name="psychologue_adresse_cabinet"
                            defaultValue={
                              userData.psychologue.adresse_cabinet || ""
                            }
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Diplôme
                          </label>
                          <input
                            type="text"
                            name="psychologue_intitule_diplome"
                            defaultValue={
                              userData.psychologue.intitule_diplome || ""
                            }
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Date d'obtention
                          </label>
                          <input
                            type="date"
                            name="psychologue_date_obtention"
                            defaultValue={
                              userData.psychologue.date_obtention || ""
                            }
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Mode de consultation
                          </label>
                          <select
                            name="psychologue_mode_consultation"
                            defaultValue={
                              userData.psychologue.mode_consultation || ""
                            }
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="En ligne">En ligne</option>
                            <option value="En présentiel">En présentiel</option>
                            <option value="Les deux">Les deux</option>
                          </select>
                        </div>
                      </div>
                    )}

                  <div className="mt-8">
                    <Button
                      type="submit"
                      className="w-full bg-green-200 hover:bg-green-300 text-green-800 transition-colors shadow-md"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Information Card */}
          <Card className="shadow-md hover:shadow-lg transition-all border-0 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Informations personnelles
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              <div className="py-3 flex items-center">
                <div className="w-10 flex justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nom complet</p>
                  <p className="font-medium">
                    {userData.civilite} {userData.prenom} {userData.nom}
                  </p>
                </div>
              </div>
              <div className="py-3 flex items-center">
                <div className="w-10 flex justify-center">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
              </div>
              <div className="py-3 flex items-center">
                <div className="w-10 flex justify-center">
                  <Phone className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <p className="font-medium">
                    {userData.telephone || "Non spécifié"}
                  </p>
                </div>
              </div>
              <div className="py-3 flex items-center">
                <div className="w-10 flex justify-center">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date de naissance</p>
                  <p className="font-medium">
                    {formatDate(userData.date_naissance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="shadow-md hover:shadow-lg transition-all border-0 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Adresse
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <address className="not-italic">
                  <p className="mb-1 font-medium">
                    {userData.adresse || "Adresse non spécifiée"}
                  </p>
                  {userData.code_postal && userData.ville && (
                    <p className="text-gray-600">
                      {userData.code_postal} {userData.ville}
                    </p>
                  )}
                </address>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information Card (for psychologists) */}
          {userData.role === "PSYCHOLOGUE" && userData.psychologue && (
            <Card className="shadow-md hover:shadow-lg transition-all border-0 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Informations professionnelles
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-gray-100">
                <div className="py-3 flex items-center">
                  <div className="w-10 flex justify-center">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Titre</p>
                    <p className="font-medium">
                      {userData.psychologue.titre || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="py-3 flex items-center">
                  <div className="w-10 flex justify-center">
                    <Award className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Diplôme</p>
                    <p className="font-medium">
                      {userData.psychologue.intitule_diplome || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="py-3 flex items-center">
                  <div className="w-10 flex justify-center">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Établissement</p>
                    <p className="font-medium">
                      {userData.psychologue.etablissement || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="py-3 flex items-center">
                  <div className="w-10 flex justify-center">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Adresse du cabinet</p>
                    <p className="font-medium">
                      {userData.psychologue.adresse_cabinet || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="py-3 flex items-center">
                  <div className="w-10 flex justify-center">
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Mode de consultation
                    </p>
                    <p className="font-medium">
                      {userData.psychologue.mode_consultation || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
