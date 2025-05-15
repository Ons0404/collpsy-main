"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Définition de l'interface FormData
interface FormData {
  role: "PSYCHOLOGUE" | "ETUDIANT" | "";
  email: string;
  password: string;
  confirmPassword: string;
  profileImage: string | null;
  nom: string;
  prenom: string;
  ville: string;
  adresse: string;
  telephone: string;
  dateNaissance: string;
  civilite: string;
  numeroCarteEtudiant?: string;
  niveau?: string;
  etablissementEtudiant?: string;
  cin?: string;
  titre?: string;
  adresseCabinet?: string;
  etablissementPsy?: string;
  intituleDiplome?: string;
  dateObtentionDiplome?: string;
  modeConsultation?: string;
  diplomeFile: string;
}

// Interface pour les erreurs du formulaire
interface FormErrors {
  [key: string]: string;
}

// Fonctions de validation
const validateAge = (dateString: string): boolean => {
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 17;
};

const validateDigitCount = (value: string, count: number): boolean => {
  const regex = new RegExp(`^\\d{${count}}$`);
  return regex.test(value);
};

const validateDiplomaDate = (dateString: string): boolean => {
  const diplomaDate = new Date(dateString);
  const today = new Date();
  let years = today.getFullYear() - diplomaDate.getFullYear();
  const m = today.getMonth() - diplomaDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < diplomaDate.getDate())) {
    years--;
  }
  return years >= 2;
};

const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/auth/signup?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    return false;
  }
};

const Signup = () => {
  const [formData, setFormData] = useState<FormData>({
    role: "",
    email: "",
    password: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    ville: "",
    adresse: "",
    telephone: "",
    dateNaissance: "",
    civilite: "",
    numeroCarteEtudiant: undefined,
    niveau: undefined,
    etablissementEtudiant: undefined,
    cin: undefined,
    titre: undefined,
    adresseCabinet: undefined,
    etablissementPsy: undefined,
    intituleDiplome: undefined,
    dateObtentionDiplome: undefined,
    modeConsultation: undefined,
    profileImage: null,
    diplomeFile: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const totalSteps = 3;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setTouched({
      ...touched,
      [name]: true,
    });
    if (errors[name]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[name];
      setErrors(updatedErrors);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        setFormData({
          ...formData,
          profileImage: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({
          ...formData,
          diplomeFile: base64String,
        });
        setTouched({
          ...touched,
          diplomeFile: true,
        });
        if (errors.diplomeFile) {
          const updatedErrors = { ...errors };
          delete updatedErrors.diplomeFile;
          setErrors(updatedErrors);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.role) newErrors.role = "Veuillez sélectionner un rôle";
      if (!formData.email) newErrors.email = "L'email est requis";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Format d'email invalide";
      else if (await checkEmailExists(formData.email))
        newErrors.email = "Cet email existe déjà";

      if (!formData.password) newErrors.password = "Le mot de passe est requis";
      else if (formData.password.length < 8)
        newErrors.password =
          "Le mot de passe doit contenir au moins 8 caractères";

      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    } else if (step === 2) {
      if (!formData.nom) newErrors.nom = "Le nom est requis";
      if (!formData.prenom) newErrors.prenom = "Le prénom est requis";
      if (!formData.civilite) newErrors.civilite = "La civilité est requise";
      if (!formData.dateNaissance)
        newErrors.dateNaissance = "La date de naissance est requise";
      else if (!validateAge(formData.dateNaissance))
        newErrors.dateNaissance = "Vous devez avoir au moins 17 ans";
      if (formData.telephone && !validateDigitCount(formData.telephone, 8))
        newErrors.telephone = "Le numéro de téléphone doit contenir 8 chiffres";
      if (!formData.ville) newErrors.ville = "La ville est requise";
      if (!formData.adresse) newErrors.adresse = "L'adresse est requise"; // Added validation for adresse
    } else if (step === 3) {
      if (formData.role === "ETUDIANT") {
        if (!formData.numeroCarteEtudiant)
          newErrors.numeroCarteEtudiant =
            "Le numéro de carte étudiant est requis";
        else if (!validateDigitCount(formData.numeroCarteEtudiant, 7))
          newErrors.numeroCarteEtudiant = "Le numéro doit contenir 7 chiffres";
        if (!formData.niveau)
          newErrors.niveau = "Le niveau d'études est requis";
        if (!formData.etablissementEtudiant)
          newErrors.etablissementEtudiant = "L'établissement est requis";
      } else if (formData.role === "PSYCHOLOGUE") {
        if (!formData.cin) newErrors.cin = "Le CIN est requis";
        else if (!validateDigitCount(formData.cin, 8))
          newErrors.cin = "Le CIN doit contenir 8 chiffres";
        if (!formData.titre) newErrors.titre = "Le titre est requis";
        if (!formData.adresseCabinet)
          newErrors.adresseCabinet = "L'adresse du cabinet est requise";
        if (!formData.intituleDiplome)
          newErrors.intituleDiplome = "L'intitulé du diplôme est requis";
        if (!formData.dateObtentionDiplome)
          newErrors.dateObtentionDiplome =
            "La date d'obtention du diplôme est requise";
        else if (!validateDiplomaDate(formData.dateObtentionDiplome))
          newErrors.dateObtentionDiplome =
            "Le diplôme doit avoir été obtenu il y a au moins 2 ans";
        if (!formData.modeConsultation)
          newErrors.modeConsultation = "Le mode de consultation est requis";
        if (!formData.diplomeFile)
          newErrors.diplomeFile = "Veuillez joindre votre diplôme";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (await validateStep(currentStep)) {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        console.log("Signup response:", data);

        if (!response.ok) {
          setErrors({
            ...errors,
            global:
              data.error || "Une erreur s'est produite lors de l'inscription.",
          });
          return;
        }

        if (!data.userId) {
          console.error("Error: userId missing in signup response", data);
          setErrors({
            ...errors,
            global:
              "Inscription réussie, mais notification non envoyée (userId manquant).",
          });
        } else {
          const notificationPayload = {
            message: `Nouvelle inscription: ${formData.prenom} ${formData.nom} (${formData.role})`,
            administrateurId: 1,
            userId: data.userId,
          };
          console.log("Notification payload:", notificationPayload);

          const notificationResponse = await fetch("/api/notifications/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notificationPayload),
          });
          const notificationData = await notificationResponse.json();
          console.log("Notification response:", {
            status: notificationResponse.status,
            data: notificationData,
          });

          if (!notificationResponse.ok) {
            console.error("Error creating notification:", {
              status: notificationResponse.status,
              data: notificationData,
            });
            setErrors({
              ...errors,
              global: `Inscription réussie, mais notification non envoyée (erreur: ${
                notificationData.error || "inconnue"
              }).`,
            });
          }
        }

        setIsSuccess(true);
        setTimeout(() => router.push("/"), 3000);
      } catch (err) {
        console.error("Erreur réseau lors de l'inscription:", err);
        setErrors({
          ...errors,
          global:
            "Une erreur réseau s'est produite. Vérifiez votre connexion ou réessayez.",
        });
      }
    }
  };

  const handleNextStep = async () => {
    if (await validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const inputStyles =
    "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all";

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold ${
                currentStep >= index + 1
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              } transition-all`}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-2 text-gray-600">
              {index === 0
                ? "Identifiants"
                : index === 1
                ? "Informations"
                : formData.role === "ETUDIANT"
                ? "Étudiant"
                : "Professionnel"}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderFormStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Identifiants de connexion
      </h2>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Rôle <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, role: true })}
            className={`${inputStyles} ${
              touched.role && errors.role ? "border-red-500" : ""
            }`}
          >
            <option value="">Choisissez psychologue ou étudiant</option>
            <option value="PSYCHOLOGUE">Psychologue</option>
            <option value="ETUDIANT">Étudiant</option>
          </select>
          {touched.role && errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, email: true })}
            className={`${inputStyles} ${
              touched.email && errors.email ? "border-red-500" : ""
            }`}
            placeholder="exemple@email.com"
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, password: true })}
            className={`${inputStyles} ${
              touched.password && errors.password ? "border-red-500" : ""
            }`}
            placeholder="Minimum 8 caractères"
          />
          {touched.password && errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirmer mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, confirmPassword: true })}
            className={`${inputStyles} ${
              touched.confirmPassword && errors.confirmPassword
                ? "border-red-500"
                : ""
            }`}
            placeholder="Répétez votre mot de passe"
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderFormStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Informations personnelles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="civilite"
            className="block text-sm font-medium text-gray-700"
          >
            Civilité <span className="text-red-500">*</span>
          </label>
          <select
            id="civilite"
            name="civilite"
            value={formData.civilite}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, civilite: true })}
            className={`${inputStyles} ${
              touched.civilite && errors.civilite ? "border-red-500" : ""
            }`}
          >
            <option value="">Sélectionner</option>
            <option value="M">Monsieur</option>
            <option value="Mme">Madame</option>
          </select>
          {touched.civilite && errors.civilite && (
            <p className="mt-1 text-sm text-red-600">{errors.civilite}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="dateNaissance"
            className="block text-sm font-medium text-gray-700"
          >
            Date de naissance <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateNaissance"
            name="dateNaissance"
            value={formData.dateNaissance}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, dateNaissance: true })}
            className={`${inputStyles} ${
              touched.dateNaissance && errors.dateNaissance
                ? "border-red-500"
                : ""
            }`}
          />
          {touched.dateNaissance && errors.dateNaissance && (
            <p className="mt-1 text-sm text-red-600">{errors.dateNaissance}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="nom"
            className="block text-sm font-medium text-gray-700"
          >
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, nom: true })}
            className={`${inputStyles} ${
              touched.nom && errors.nom ? "border-red-500" : ""
            }`}
            placeholder="Votre nom de famille"
          />
          {touched.nom && errors.nom && (
            <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="prenom"
            className="block text-sm font-medium text-gray-700"
          >
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, prenom: true })}
            className={`${inputStyles} ${
              touched.prenom && errors.prenom ? "border-red-500" : ""
            }`}
            placeholder="Votre prénom"
          />
          {touched.prenom && errors.prenom && (
            <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="telephone"
            className="block text-sm font-medium text-gray-700"
          >
            N° téléphone
          </label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, telephone: true })}
            pattern="[0-9]{8}"
            className={`${inputStyles} ${
              touched.telephone && errors.telephone ? "border-red-500" : ""
            }`}
            placeholder="Ex: 06123456 (8 chiffres)"
          />
          {touched.telephone && errors.telephone && (
            <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="ville"
            className="block text-sm font-medium text-gray-700"
          >
            Ville <span className="text-red-500">*</span>
          </label>
          <select
            id="ville"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, ville: true })}
            className={`${inputStyles} ${
              touched.ville && errors.ville ? "border-red-500" : ""
            }`}
          >
            <option value="">Sélectionnez votre ville</option>
            <option value="Sousse">Sousse</option>
            <option value="Hammam Sousse">Hammam Sousse</option>
            <option value="Port El Kantaoui">Port El Kantaoui</option>
            <option value="Msaken">Msaken</option>
            <option value="Kalâa Kebira">Kalâa Kebira</option>
            <option value="Kalâa Soghra">Kalâa Soghra</option>
            <option value="Akouda">Akouda</option>
            <option value="Chott Mariem">Chott Mariem</option>
            <option value="Enfidha">Enfidha</option>
            <option value="Kondar">Kondar</option>
            <option value="Sidi Bou Ali">Sidi Bou Ali</option>
            <option value="Hergla">Hergla</option>
            <option value="Zaouiet Sousse">Zaouiet Sousse</option>
            <option value="Bouficha">Bouficha</option>
            <option value="Sidi El Hani">Sidi El Hani</option>
          </select>
          {touched.ville && errors.ville && (
            <p className="mt-1 text-sm text-red-600">{errors.ville}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="adresse"
            className="block text-sm font-medium text-gray-700"
          >
            Adresse <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, adresse: true })}
            className={`${inputStyles} ${
              touched.adresse && errors.adresse ? "border-red-500" : ""
            }`}
            placeholder="Votre adresse complète"
          />
          {touched.adresse && errors.adresse && (
            <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="profileImage"
          className="block text-sm font-medium text-gray-700"
        >
          Photo de profil
        </label>
        <div className="mt-2 flex items-center space-x-4">
          <div className="relative h-24 w-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-300">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
                width={96}
                height={96}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
          <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition">
            <span>Choisir une image</span>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderFormStep3 = () => (
    <div className="space-y-6">
      {formData.role === "ETUDIANT" ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900">
            Informations étudiant
          </h2>
          <div className="p-6 bg-green-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="numeroCarteEtudiant"
                  className="block text-sm font-medium text-gray-700"
                >
                  Numéro de carte étudiant{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="numeroCarteEtudiant"
                  name="numeroCarteEtudiant"
                  value={formData.numeroCarteEtudiant}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched({ ...touched, numeroCarteEtudiant: true })
                  }
                  pattern="[0-9]{7}"
                  className={`${inputStyles} ${
                    touched.numeroCarteEtudiant && errors.numeroCarteEtudiant
                      ? "border-red-500"
                      : ""
                  }`}
                  placeholder="Ex: 2022568 (7 chiffres)"
                />
                {touched.numeroCarteEtudiant && errors.numeroCarteEtudiant && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.numeroCarteEtudiant}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="niveau"
                  className="block text-sm font-medium text-gray-700"
                >
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select
                  id="niveau"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, niveau: true })}
                  className={`${inputStyles} ${
                    touched.niveau && errors.niveau ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Sélectionner</option>
                  <option value="Licence 1">Licence 1</option>
                  <option value="Licence 2">Licence 2</option>
                  <option value="Licence 3">Licence 3</option>
                  <option value="Master 1">Master 1</option>
                  <option value="Master 2">Master 2</option>
                  <option value="Doctorat">Doctorat</option>
                </select>
                {touched.niveau && errors.niveau && (
                  <p className="mt-1 text-sm text-red-600">{errors.niveau}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="etablissementEtudiant"
                className="block text-sm font-medium text-gray-700"
              >
                Établissement <span className="text-red-500">*</span>
              </label>
              <select
                id="etablissementEtudiant"
                name="etablissementEtudiant"
                value={formData.etablissementEtudiant}
                onChange={handleChange}
                onBlur={() =>
                  setTouched({ ...touched, etablissementEtudiant: true })
                }
                className={`${inputStyles} ${
                  touched.etablissementEtudiant && errors.etablissementEtudiant
                    ? "border-red-500"
                    : ""
                }`}
              >
                <option value="">Sélectionnez votre établissement</option>
                <optgroup label="Facultés">
                  <option value="Faculté de Médecine de Sousse">
                    Faculté de Médecine de Sousse
                  </option>
                  <option value="Faculté de Droit et des Sciences Politiques de Sousse">
                    Faculté de Droit et des Sciences Politiques de Sousse
                  </option>
                  <option value="Faculté des Lettres et des Sciences Humaines de Sousse">
                    Faculté des Lettres et des Sciences Humaines de Sousse
                  </option>
                  <option value="Faculté des Sciences Économiques et de Gestion de Sousse">
                    Faculté des Sciences Économiques et de Gestion de Sousse
                  </option>
                </optgroup>
                <optgroup label="Instituts">
                  <option value="Institut des Hautes Études Commerciales de Sousse">
                    Institut des Hautes Études Commerciales de Sousse
                  </option>
                  <option value="Institut Supérieur de Finance et de Fiscalité de Sousse">
                    Institut Supérieur de Finance et de Fiscalité de Sousse
                  </option>
                  <option value="Institut Supérieur des Beaux-Arts de Sousse">
                    Institut Supérieur des Beaux-Arts de Sousse
                  </option>
                  <option value="Institut Supérieur de Gestion de Sousse">
                    Institut Supérieur de Gestion de Sousse
                  </option>
                  <option value="Institut Supérieur d'Informatique et des Technologies de Communication de Hammam Sousse">
                    Institut Supérieur d'Informatique et des Technologies de
                    Communication de Hammam Sousse
                  </option>
                  <option value="Institut Supérieur de Musique de Sousse">
                    Institut Supérieur de Musique de Sousse
                  </option>
                  <option value="Institut Supérieur des Sciences Appliquées et de Technologie de Sousse">
                    Institut Supérieur des Sciences Appliquées et de Technologie
                    de Sousse
                  </option>
                  <option value="Institut Supérieur du Transport et de la Logistique de Sousse">
                    Institut Supérieur du Transport et de la Logistique de
                    Sousse
                  </option>
                  <option value="Institut Agronomique de Chott-Mariem">
                    Institut Agronomique de Chott-Mariem
                  </option>
                  <option value="Institut des Sciences Infirmières de Sousse">
                    Institut des Sciences Infirmières de Sousse
                  </option>
                </optgroup>
                <optgroup label="Écoles">
                  <option value="École Nationale d'Ingénieurs de Sousse (ENISO)">
                    École Nationale d'Ingénieurs de Sousse (ENISO)
                  </option>
                  <option value="École Supérieure des Sciences et de la Technologie de Hammam Sousse">
                    École Supérieure des Sciences et de la Technologie de Hammam
                    Sousse
                  </option>
                  <option value="École Supérieure des Sciences et Techniques de la Santé de Sousse">
                    École Supérieure des Sciences et Techniques de la Santé de
                    Sousse
                  </option>
                </optgroup>
              </select>
              {touched.etablissementEtudiant &&
                errors.etablissementEtudiant && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.etablissementEtudiant}
                  </p>
                )}
            </div>
          </div>
        </>
      ) : formData.role === "PSYCHOLOGUE" ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900">
            Informations professionnelles
          </h2>
          <div className="p-6 bg-green-100 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="cin"
                  className="block text-sm font-medium text-gray-700"
                >
                  CIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cin"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, cin: true })}
                  pattern="[0-9]{8}"
                  className={`${inputStyles} ${
                    touched.cin && errors.cin ? "border-red-500" : ""
                  }`}
                  placeholder="Votre numéro d'identité (8 chiffres)"
                />
                {touched.cin && errors.cin && (
                  <p className="mt-1 text-sm text-red-600">{errors.cin}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="titre"
                  className="block text-sm font-medium text-gray-700"
                >
                  Titre <span className="text-red-500">*</span>
                </label>
                <select
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, titre: true })}
                  className={`${inputStyles} ${
                    touched.titre && errors.titre ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Sélectionnez votre titre</option>
                  <option value="Psychologue Clinicien">
                    Psychologue Clinicien
                  </option>
                  <option value="Psychologue Scolaire">
                    Psychologue Scolaire
                  </option>
                  <option value="Psychologue de l'Éducation">
                    Psychologue de l'Éducation
                  </option>
                  <option value="Psychologue du Développement">
                    Psychologue du Développement
                  </option>
                  <option value="Psychologue Social">Psychologue Social</option>
                  <option value="Psychologue Cognitiviste">
                    Psychologue Cognitiviste
                  </option>
                  <option value="Psychologue de la Santé">
                    Psychologue de la Santé
                  </option>
                  <option value="Conseiller en Orientation Psychologique">
                    Conseiller en Orientation Psychologique
                  </option>
                  <option value="Psychologue Spécialisé en Santé Mentale des Étudiants">
                    Psychologue Spécialisé en Santé Mentale des Étudiants
                  </option>
                  <option value="Psychologue Comportemental">
                    Psychologue Comportemental
                  </option>
                  <option value="Psychologue du Travail et des Organisations">
                    Psychologue du Travail et des Organisations
                  </option>
                  <option value="Neuropsychologue">Neuropsychologue</option>
                  <option value="Psychothérapeute">Psychothérapeute</option>
                </select>
                {touched.titre && errors.titre && (
                  <p className="mt-1 text-sm text-red-600">{errors.titre}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="intituleDiplome"
                  className="block text-sm font-medium text-gray-700"
                >
                  Intitulé de Diplôme <span className="text-red-500">*</span>
                </label>
                <select
                  id="intituleDiplome"
                  name="intituleDiplome"
                  value={formData.intituleDiplome}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched({ ...touched, intituleDiplome: true })
                  }
                  className={`${inputStyles} ${
                    touched.intituleDiplome && errors.intituleDiplome
                      ? "border-red-500"
                      : ""
                  }`}
                >
                  <option value="">Sélectionnez votre diplôme</option>
                  <option value="Master en Psychologie Clinique">
                    Master en Psychologie Clinique
                  </option>
                  <option value="Master en Psychologie de l'Éducation">
                    Master en Psychologie de l'Éducation
                  </option>
                  <option value="Master en Psychologie Scolaire">
                    Master en Psychologie Scolaire
                  </option>
                  <option value="Master en Psychologie du Développement">
                    Master en Psychologie du Développement
                  </option>
                  <option value="Master en Psychologie Sociale">
                    Master en Psychologie Sociale
                  </option>
                  <option value="Master en Psychologie Cognitive">
                    Master en Psychologie Cognitive
                  </option>
                  <option value="Master en Psychologie de la Santé">
                    Master en Psychologie de la Santé
                  </option>
                  <option value="Master Professionnel en Conseil et Orientation">
                    Master Professionnel en Conseil et Orientation
                  </option>
                  <option value="Doctorat en Psychologie Clinique">
                    Doctorat en Psychologie Clinique
                  </option>
                  <option value="Doctorat en Psychologie de l'Éducation">
                    Doctorat en Psychologie de l'Éducation
                  </option>
                  <option value="Licence en Psychologie">
                    Licence en Psychologie
                  </option>
                  <option value="Diplôme National de Psychologue Clinicien">
                    Diplôme National de Psychologue Clinicien
                  </option>
                  <option value="Master en Psychologie du Travail et des Organisations">
                    Master en Psychologie du Travail et des Organisations
                  </option>
                </select>
                {touched.intituleDiplome && errors.intituleDiplome && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.intituleDiplome}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="dateObtentionDiplome"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date d'obtention de diplôme{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateObtentionDiplome"
                  name="dateObtentionDiplome"
                  value={formData.dateObtentionDiplome}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched({ ...touched, dateObtentionDiplome: true })
                  }
                  className={`${inputStyles} ${
                    touched.dateObtentionDiplome && errors.dateObtentionDiplome
                      ? "border-red-500"
                      : ""
                  }`}
                />
                {touched.dateObtentionDiplome &&
                  errors.dateObtentionDiplome && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dateObtentionDiplome}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <label
                htmlFor="adresseCabinet"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse Cabinet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="adresseCabinet"
                name="adresseCabinet"
                value={formData.adresseCabinet}
                onChange={handleChange}
                onBlur={() => setTouched({ ...touched, adresseCabinet: true })}
                className={`${inputStyles} ${
                  touched.adresseCabinet && errors.adresseCabinet
                    ? "border-red-500"
                    : ""
                }`}
                placeholder="Adresse complète de votre cabinet"
              />
              {touched.adresseCabinet && errors.adresseCabinet && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.adresseCabinet}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label
                htmlFor="etablissementPsy"
                className="block text-sm font-medium text-gray-700"
              >
                Établissement <span className="text-red-500">*</span>
              </label>
              <select
                id="etablissementPsy"
                name="etablissementPsy"
                value={
                  formData.etablissementPsy === "Autre"
                    ? "Autre"
                    : formData.etablissementPsy
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    etablissementPsy: value === "Autre" ? "Autre" : value,
                  });
                  setTouched({ ...touched, etablissementPsy: true });
                }}
                onBlur={() =>
                  setTouched({ ...touched, etablissementPsy: true })
                }
                className={`${inputStyles} ${
                  touched.etablissementPsy && errors.etablissementPsy
                    ? "border-red-500"
                    : ""
                }`}
              >
                <option value="">Sélectionnez votre établissement</option>
                <optgroup label="Établissements en Tunisie">
                  <option value="Université de Tunis - Faculté des Sciences Humaines et Sociales">
                    Université de Tunis - Faculté des Sciences Humaines et
                    Sociales
                  </option>
                  <option value="Université de Sousse - Faculté des Lettres et des Sciences Humaines">
                    Université de Sousse - Faculté des Lettres et des Sciences
                    Humaines
                  </option>
                  <option value="Université de Sfax - Faculté des Lettres et des Sciences Humaines">
                    Université de Sfax - Faculté des Lettres et des Sciences
                    Humaines
                  </option>
                  <option value="Université de Monastir - Faculté des Sciences">
                    Université de Monastir - Faculté des Sciences
                  </option>
                  <option value="Institut Supérieur des Sciences Humaines de Tunis">
                    Institut Supérieur des Sciences Humaines de Tunis
                  </option>
                  <option value="Université Centrale">
                    Université Centrale
                  </option>
                  <option value="Université Libre de Tunis">
                    Université Libre de Tunis
                  </option>
                </optgroup>
                <optgroup label="Autres">
                  <option value="Autre">
                    Autre (Établissement à l'étranger ou non listé)
                  </option>
                </optgroup>
              </select>
              {formData.etablissementPsy === "Autre" && (
                <input
                  type="text"
                  id="etablissementPsyCustom"
                  value={
                    formData.etablissementPsy === "Autre"
                      ? ""
                      : formData.etablissementPsy
                  }
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      etablissementPsy: e.target.value,
                    });
                  }}
                  onBlur={() =>
                    setTouched({ ...touched, etablissementPsy: true })
                  }
                  className={`${inputStyles} mt-2`}
                  placeholder="Précisez l’établissement"
                />
              )}
              {touched.etablissementPsy && errors.etablissementPsy && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.etablissementPsy}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label
                htmlFor="modeConsultation"
                className="block text-sm font-medium text-gray-700"
              >
                Mode de consultation proposé{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="modeConsultation"
                name="modeConsultation"
                value={formData.modeConsultation}
                onChange={handleChange}
                onBlur={() =>
                  setTouched({ ...touched, modeConsultation: true })
                }
                className={`${inputStyles} ${
                  touched.modeConsultation && errors.modeConsultation
                    ? "border-red-500"
                    : ""
                }`}
              >
                <option value="">Sélectionner</option>
                <option value="En cabinet">En cabinet</option>
                <option value="En ligne">En ligne</option>
                <option value="Les deux">Les deux</option>
              </select>
              {touched.modeConsultation && errors.modeConsultation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.modeConsultation}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label
                htmlFor="diplomeFile"
                className="block text-sm font-medium text-gray-700"
              >
                Joindre votre diplôme <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex items-center">
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition">
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {formData.diplomeFile
                      ? "Fichier sélectionné"
                      : "Choisir un fichier"}
                  </span>
                  <input
                    type="file"
                    id="diplomeFile"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Formats acceptés: PDF, JPG, PNG
              </p>
              {touched.diplomeFile && errors.diplomeFile && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.diplomeFile}
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: "url('/inscription.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black opacity-30" />

      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden relative z-10">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold">Créer un compte</h1>
          <p className="mt-2 text-green-100">
            Rejoignez notre plateforme en quelques étapes simples
          </p>
        </div>

        <div className="px-8 py-6">
          {renderProgressBar()}
          <form onSubmit={handleSubmit}>
            {isSuccess ? (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
                <p>
                  L'inscription s'effectue avec succès, en attendant
                  l'activation de la part de l'admin.
                </p>
              </div>
            ) : (
              <>
                {errors.global && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                    <p>{errors.global}</p>
                  </div>
                )}
                {currentStep === 1 && renderFormStep1()}
                {currentStep === 2 && renderFormStep2()}
                {currentStep === 3 && renderFormStep3()}

                <div className="mt-8 flex justify-between items-center">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    >
                      Retour
                    </button>
                  )}
                  <div className="flex-1" />
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    >
                      Continuer
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    >
                      S'inscrire
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <a href="/auth/login" className="text-green-500 hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
