"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "../../../components/ui/input";
import { ArrowLeft } from "lucide-react"; // Importation de l'icône de flèche

// Wrapper pour utiliser useSearchParams car il doit être dans un composant client enfant de Suspense
const LoginLogic = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleBackToHome = () => {
    router.push("/"); // Navigation vers la page d'accueil
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Veuillez entrer une adresse e-mail valide.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success || !data.sessionToken) {
        setError(
          data.error || "Une erreur s'est produite lors de la connexion."
        );
        setIsLoading(false);
        return;
      }

      // Logique de redirection améliorée
      const redirectedFrom = searchParams.get("redirectedFrom");
      if (redirectedFrom) {
        router.replace(redirectedFrom);
      } else {
        // Redirection par défaut basée sur le rôle
        if (data.role === "ETUDIANT") {
          router.replace(`/dashboard/dashboardEtudiant/${data.user.id}`);
        } else if (data.role === "PSYCHOLOGUE") {
          router.replace(`/dashboard/dashboardpsy/${data.user.id}`);
        } else if (data.role === "ADMIN") {
          router.replace(`/dashboard/dashboardAdmin/${data.user.id}`);
        } else {
          router.replace("/");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Une erreur de communication est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 relative"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* Bouton de retour - positionné en haut à gauche */}
      <button
        onClick={handleBackToHome}
        className="absolute top-6 left-6 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-all duration-300 flex items-center group"
        aria-label="Retour à l'accueil"
      >
        <ArrowLeft
          size={20}
          className="mr-1 group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-sm font-medium">Accueil</span>
      </button>

      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-10 space-y-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-16 mb-4 drop-shadow-md"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h1>
          <p className="text-gray-600 text-sm text-center">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Adresse E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 transition-all duration-300"
              aria-label="Adresse e-mail"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                Mot de passe oublié?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 transition-all duration-300"
              aria-label="Mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-300 ease-in-out transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-600 mr-2">Vous n'avez pas de compte?</span>
          <Link
            href="/auth/signup"
            className="text-green-600 font-semibold hover:text-green-700 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

// Composant principal exporté qui utilise Suspense
const Login = () => {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginLogic />
    </Suspense>
  );
};

export default Login;
