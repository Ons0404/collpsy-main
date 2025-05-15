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
  Book,
  Camera,
  PenSquare,
  Save,
  X,
} from "lucide-react";
import { useToast } from "../../../../../(mvc)/hooks/use-toast";

interface Etudiant {
  id_etudiant: number;
  numero_carte_etudiant: string;
  niveau: string;
  etablissement: string;
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
  civilite?: "M" | "Mme";
  avatar?: string | null;
  etudiant?: Etudiant;
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
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
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
            router.push("/auth/login");
            return;
          }
          throw new Error(
            "Erreur lors de récupération des données utilisateur"
          );
        }
        const data = await response.json();
        if (data.success && data.user) {
          setUserData({
            ...data.user,
            civilite: data.user.civilite || "M",
          });
          if (data.user.avatar) {
            setAvatarPreview(`data:image/jpeg;base64,${data.user.avatar}`);
          }
        } else {
          throw new Error("Données utilisateur non disponibles");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router, toast]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez télécharger une image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "Taille fichier < 2 Mo",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    if (!userData?.id) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch(`/api/users/${userData.id}/avatar`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Échec mise à jour avatar");
      }

      const userResponse = await fetch("/api/auth/me");
      const updatedData = await userResponse.json();
      setUserData(updatedData.user);
      toast({ title: "Succès", description: "Avatar mis à jour" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec mise à jour avatar",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<UserData>) => {
    if (!userData?.id) return;

    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Erreur mise à jour profil");

      const freshResponse = await fetch("/api/auth/me");
      const freshData = await freshResponse.json();
      setUserData({
        ...freshData.user,
        civilite: freshData.user.civilite || "M",
      });

      setIsEditing(false);
      toast({ title: "Succès", description: "Profil mis à jour" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return "Date invalide";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <Card className="w-full max-w-md p-6 shadow-lg border border-green-100 bg-white">
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
            className="w-full mt-6 bg-green-400 hover:bg-green-500 text-white"
            onClick={() => router.push("/auth/login")}
          >
            Retourner à la page de connexion
          </Button>
        </Card>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-green-50 min-h-screen">
      <div className="mb-8 relative">
        <div
          className="h-48 rounded-xl shadow-md relative overflow-hidden"
          style={{
            backgroundImage: "url('/psychology-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/60 to-green-800/40 backdrop-blur-sm"></div>
        </div>

        <div className="absolute -bottom-16 left-8 w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-100">
              <User className="w-12 h-12 text-green-400" />
            </div>
          )}
          {!isEditing && (
            <button
              className="absolute bottom-0 right-0 bg-green-400 text-white p-2 rounded-tl-full hover:bg-green-500 transition-colors"
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
              className="bg-white text-green-600 hover:bg-green-50 shadow-md hover:shadow-lg transition-all border border-green-100"
            >
              <PenSquare className="w-4 h-4 mr-2" />
              Modifier le profil
            </Button>
          </div>
        )}
      </div>

      <div className="mb-8 mt-20 px-6">
        <h1 className="text-3xl font-bold text-gray-700">
          {userData.civilite || "Non spécifié"} {userData.prenom || ""}{" "}
          {userData.nom || ""}
        </h1>
        <div className="inline-block mt-2 px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm font-medium">
          Étudiant
        </div>
      </div>

      {isEditing ? (
        <Card className="shadow-lg mb-8 overflow-hidden border border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-300 to-green-200 text-green-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Modifier mon profil</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-800 hover:bg-green-100"
                onClick={() => setIsEditing(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-64 bg-green-50 border-r border-green-100">
                <div className="py-4">
                  <button
                    className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                      activeSection === "personnel"
                        ? "bg-green-100 text-green-700 border-r-2 border-green-400 font-medium"
                        : "hover:bg-green-100 text-gray-700"
                    }`}
                    onClick={() => setActiveSection("personnel")}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Informations personnelles
                  </button>
                  <button
                    className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                      activeSection === "adresse"
                        ? "bg-green-100 text-green-700 border-r-2 border-green-400 font-medium"
                        : "hover:bg-green-100 text-gray-700"
                    }`}
                    onClick={() => setActiveSection("adresse")}
                  >
                    <MapPin className="mr-3 h-5 w-5" />
                    Adresse
                  </button>
                  <button
                    className={`w-full text-left px-6 py-3 flex items-center transition-colors ${
                      activeSection === "etudes"
                        ? "bg-green-100 text-green-700 border-r-2 border-green-400 font-medium"
                        : "hover:bg-green-100 text-gray-700"
                    }`}
                    onClick={() => setActiveSection("etudes")}
                  >
                    <Book className="mr-3 h-5 w-5" />
                    Études
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const updatedData: Partial<UserData> = {
                      civilite:
                        (formData.get("civilite") as "M" | "Mme") ||
                        userData.civilite,
                      nom: (formData.get("nom") as string) || userData.nom,
                      prenom:
                        (formData.get("prenom") as string) || userData.prenom,
                      email:
                        (formData.get("email") as string) || userData.email,
                      telephone:
                        (formData.get("telephone") as string) ||
                        userData.telephone,
                      date_naissance:
                        (formData.get("date_naissance") as string) ||
                        userData.date_naissance,
                      adresse:
                        (formData.get("adresse") as string) || userData.adresse,
                      ville:
                        (formData.get("ville") as string) || userData.ville,
                      code_postal:
                        (formData.get("code_postal") as string) ||
                        userData.code_postal,
                      etudiant:
                        userData.role === "ETUDIANT" && userData.etudiant
                          ? {
                              id_etudiant: userData.etudiant.id_etudiant,
                              numero_carte_etudiant:
                                (formData.get(
                                  "etudiant_numero_carte_etudiant"
                                ) as string) ||
                                userData.etudiant.numero_carte_etudiant,
                              niveau:
                                (formData.get("etudiant_niveau") as string) ||
                                userData.etudiant.niveau,
                              etablissement:
                                (formData.get(
                                  "etudiant_etablissement"
                                ) as string) || userData.etudiant.etablissement,
                            }
                          : undefined,
                    };
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
                            defaultValue={userData.civilite || "M"}
                            className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
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
                            defaultValue={userData.prenom || ""}
                            className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">
                            Nom
                          </label>
                          <input
                            type="text"
                            name="nom"
                            defaultValue={userData.nom || ""}
                            className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
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
                          defaultValue={userData.email || ""}
                          className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-glass-700">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          defaultValue={userData.telephone || ""}
                          className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
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
                          className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
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
                          className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
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
                            className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
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
                            className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === "etudes" && userData.etudiant && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Numéro de carte étudiante
                        </label>
                        <input
                          type="text"
                          name="etudiant_numero_carte_etudiant"
                          defaultValue={
                            userData.etudiant.numero_carte_etudiant || ""
                          }
                          className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Niveau
                        </label>
                        <input
                          type="text"
                          name="etudiant_niveau"
                          defaultValue={userData.etudiant.niveau || ""}
                          className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Établissement
                        </label>
                        <input
                          type="text"
                          name="etudiant_etablissement"
                          defaultValue={userData.etudiant.etablissement || ""}
                          className="w-full p-2 border border-green-200 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <Button
                      type="submit"
                      className="w-full bg-green-400 hover:bg-green-500 text-white transition-colors shadow-md"
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
          <Card className="shadow-md hover:shadow-lg transition-all border border-green-100 bg-white">
            <CardHeader className="border-b border-green-100 bg-green-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-200 text-green-600">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Informations personnelles
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-green-100">
              <div className="py-3 flex items-center">
                <div className="w-10 flex justify-center">
                  <User className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nom complet</p>
                  <p className="font-medium">
                    {userData.civilite || "Non spécifié"}{" "}
                    {userData.prenom || ""} {userData.nom || ""}
                  </p>
                </div>
              </div>
              <div className="py-3 flex items-center">
                <div className="w-10 flex justify-center">
                  <Mail className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">
                    {userData.email || "Non spécifié"}
                  </p>
                </div>
              </div>
              <div className="py-3 flex items-center">
                <div className="w-10 flex justify-center">
                  <Phone className="h-4 w-4 text-green-500" />
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
                  <CalendarIcon className="h-4 w-4 text-green-500" />
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

          <Card className="shadow-md hover:shadow-lg transition-all border border-green-100 bg-white">
            <CardHeader className="border-b border-green-100 bg-green-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-200 text-green-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Adresse
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
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

          {userData.role === "ETUDIANT" && userData.etudiant && (
            <Card className="shadow-md hover:shadow-lg transition-all border border-green-100 bg-white">
              <CardHeader className="border-b border-green-100 bg-green-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-green-200 text-green-600">
                    <Book className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-700">
                    Informations académiques
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-green-100">
                <div className="py-3 flex items-center">
                  <div className="w-10 flex justify-center">
                    <Book className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Numéro de carte étudiante
                    </p>
                    <p className="font-medium">
                      {userData.etudiant.numero_carte_etudiant ||
                        "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="py-3 flex items-center">
                  <div className="w-10 flex justify-center">
                    <Book className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Niveau</p>
                    <p className="font-medium">
                      {userData.etudiant.niveau || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="py-3 flex items-center">
                  <div className="w-10 flex justify-center">
                    <Book className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Établissement</p>
                    <p className="font-medium">
                      {userData.etudiant.etablissement || "Non spécifié"}
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
