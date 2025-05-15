"use client";

import React, { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { requestPasswordReset } from "../../../(mvc)/lib/auth";

interface FormState {
  email: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export default function ForgotPasswordPage() {
  const [formState, setFormState] = useState<FormState>({
    email: "",
    isSubmitting: false,
    error: null,
    success: false,
  });

  // page.tsx
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = formState.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormState((prev) => ({
        ...prev,
        error: "Veuillez entrer un email valide (ex. : personne@exemple.com)",
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      await requestPasswordReset(trimmedEmail); // Line 42
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        success: true,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message.includes("Échec de l'envoi de l'email")
            ? "Impossible d'envoyer l'email de réinitialisation. Vérifiez votre connexion ou contactez le support."
            : error.message
          : "Une erreur inattendue est survenue. Veuillez réessayer.";
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage,
      }));
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-opacity-75 bg-[url('/background.jpg')] bg-cover bg-center">
      <div className="bg-white bg-opacity-90 rounded-lg shadow-md w-full max-w-md p-8 mx-4">
        {/* Logo Section */}
        <div className="flex justify-center mb-4">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="Logo CollPsy"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-medium text-center text-gray-800 mb-2">
          Réinitialisation du mot de passe
        </h1>

        {formState.success ? (
          /* Success State */
          <div className="text-center space-y-4">
            <p className="text-green-600 bg-green-50 p-3 rounded-md">
              Un e-mail de réinitialisation a été envoyé à votre adresse e-mail
              si celle-ci est associée à un compte.{" "}
              <span className="font-medium">
                Vérifiez votre dossier de spam si vous ne le trouvez pas.
              </span>
            </p>
            <Link
              href="/auth/login"
              className="inline-block text-blue-600 hover:underline text-sm"
            >
              Retour à la page de connexion
            </Link>
          </div>
        ) : (
          /* Form State */
          <>
            <p className="text-gray-600 text-center mb-6">
              Entrez votre adresse e-mail pour recevoir un lien de
              réinitialisation de mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {formState.error && (
                <div
                  className="p-3 bg-red-100 text-red-700 rounded-md text-sm"
                  role="alert"
                >
                  {formState.error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="personne@exemple.com"
                  required
                  aria-label="Adresse e-mail pour réinitialisation"
                  aria-describedby={formState.error ? "email-error" : undefined}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full transition duration-200 disabled:opacity-70 flex items-center justify-center"
                  aria-label="Envoyer la demande de réinitialisation"
                >
                  {formState.isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                        />
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <div className="mt-6 text-center space-y-2">
              <Link
                href="/"
                className="block text-sm text-gray-600 hover:underline"
              >
                Page d'accueil
              </Link>
              <Link
                href="/auth/login"
                className="block text-sm text-gray-600 hover:underline"
              >
                Se connecter
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
