"use client";

import React, { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { resetPassword } from "../../../../(mvc)/lib/auth";

interface FormState {
  newPassword: string;
  confirmPassword: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [formState, setFormState] = useState<FormState>({
    newPassword: "",
    confirmPassword: "",
    isSubmitting: false,
    error: null,
    success: false,
  });

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formState.newPassword !== formState.confirmPassword) {
      setFormState((prev) => ({
        ...prev,
        error: "Les mots de passe ne correspondent pas",
      }));
      return;
    }

    if (formState.newPassword.length < 8) {
      setFormState((prev) => ({
        ...prev,
        error: "Le mot de passe doit contenir au moins 8 caractères",
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      await resetPassword(token, formState.newPassword);

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        success: true,
      }));

      // Redirection après 3 secondes
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-opacity-75 bg-[url('/background.jpg')] bg-cover bg-center">
      <div className="bg-white bg-opacity-90 rounded-lg shadow-md w-full max-w-md p-8 mx-4">
        <div className="flex justify-center mb-4">
          <div className="relative w-6 h-6">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h1 className="text-2xl font-medium text-center text-gray-800 mb-2">
          Réinitialisation du mot de passe
        </h1>

        {formState.success ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être
              redirigé vers la page de connexion.
            </p>
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Retour à la page de connexion
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-center mb-6">
              Veuillez saisir votre nouveau mot de passe
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formState.error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {formState.error}
                </div>
              )}

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={formState.newPassword}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full transition duration-200 disabled:opacity-70"
                >
                  {formState.isSubmitting
                    ? "Réinitialisation en cours..."
                    : "Réinitialiser le mot de passe"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link
                href="/"
                className="block text-sm text-gray-600 hover:underline"
              >
                Page d&apos;accueil
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
