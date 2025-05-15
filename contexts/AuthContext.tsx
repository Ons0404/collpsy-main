"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Définition du type utilisateur (ajuste selon ton modèle)
interface User {
  id: string;
  email: string;
  name: string;
  role: "psychologist" | "student";
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Charger l'utilisateur depuis le stockage local (si présent)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fonction de connexion
  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Stocker l'utilisateur
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
