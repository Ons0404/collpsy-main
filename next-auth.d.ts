import "next-auth";

declare module "next-auth" {
  /**
   * Étend l'interface `Session` pour inclure `id` dans `user`.
   */
  interface Session {
    Utilisateur: {
      id: string; // Ajoutez cette ligne
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  /**
   * Étend l'interface `User` pour inclure `id`.
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
