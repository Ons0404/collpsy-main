// app/(mvc)/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Type basé sur votre structure de données utilisateur
export interface User {
  id: string;
  email: string;
  role: "ETUDIANT" | "PSYCHOLOGUE" | string;
  nom: string;
  prenom: string;
  civilite: string;
  telephone?: string;
  ville?: string;
  statut: "Actif" | "Inactif";

  // Propriétés conditionnelles basées sur le rôle
  numero_carte_etudiant?: string;
  niveau?: string;
  etablissement?: string;

  cin?: string;
  titre?: string;
  tarif?: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        // Récupérer le token depuis le localStorage
        const token = localStorage.getItem("auth-token");

        if (!token) {
          setIsLoading(false);
          return;
        }

        // Utiliser votre API de login existante pour vérifier l'utilisateur
        const response = await fetch("/api/auth/dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Token invalide ou expiré
          localStorage.removeItem("auth-token");
          document.cookie =
            "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          setUser(null);
          router.push("/auth/login");
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          error
        );
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentUser();
  }, [router]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    // Supprimer le token
    localStorage.removeItem("auth-token");
    document.cookie =
      "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Réinitialiser l'utilisateur
    setUser(null);

    // Rediriger vers la page de connexion
    router.push("/auth/login");
  };

  return {
    user,
    isLoading,
    login,
    logout,
  };
}
