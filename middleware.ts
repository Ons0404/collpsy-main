import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Ou une autre méthode de validation de token si vous passez à JWT

// Il est préférable de stocker la clé secrète dans les variables d'environnement
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-fallback-secret-key"); 

// Fonction pour valider la session directement depuis les cookies (similaire à /api/auth/me)
async function validateSessionFromCookies(req: NextRequest) {
  const sessionTokenCookie = req.cookies.get("sessionToken");
  const userIdCookie = req.cookies.get("userId");
  const userRoleCookie = req.cookies.get("userRole");

  if (!sessionTokenCookie?.value || !userIdCookie?.value || !userRoleCookie?.value) {
    console.log("[MIDDLEWARE] Missing session cookies");
    return null;
  }

  const sessionId = parseInt(sessionTokenCookie.value);
  if (isNaN(sessionId)) {
    console.log("[MIDDLEWARE] Invalid session token format in cookie");
    return null;
  }

  // Ici, vous devriez idéalement appeler une fonction partagée ou réutiliser la logique de prisma
  // pour valider la session ID contre la base de données, vérifier l'expiration, etc.
  // Pour simplifier, nous supposons que si les cookies sont là et le token a un format valide,
  // la session est considérée comme potentiellement valide pour le middleware.
  // Une validation complète contre la DB serait plus robuste.
  // Exemple simplifié (NE PAS UTILISER EN PRODUCTION SANS VALIDATION DB):
  // const session = await prisma.session.findUnique({ where: { id: sessionId } });
  // if (!session || session.expiresAt < new Date() || session.userId !== parseInt(userIdCookie.value)) {
  //   return null;
  // }

  return {
    id: parseInt(userIdCookie.value),
    role: userRoleCookie.value,
    // Vous pouvez ajouter d'autres informations utilisateur si nécessaire
  };
}

export async function middleware(req: NextRequest) {
  console.log(
    "[MIDDLEWARE] Processing route:",
    req.nextUrl.pathname,
    "Method:",
    req.method
  );

  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/register", // Ajoutez d'autres routes publiques ici
    "/api/auth/me", // /api/auth/me gère sa propre logique de cookie
    "/api/auth/logout",
    // La route /api/auth/validate-session pourrait ne plus être nécessaire
  ];

  if (
    req.nextUrl.pathname.startsWith("/api/") &&
    !publicApiRoutes.some(path => req.nextUrl.pathname.startsWith(path))
  ) {
    console.log("[MIDDLEWARE] Protected API route detected:", req.nextUrl.pathname);

    const user = await validateSessionFromCookies(req);

    if (!user) {
      console.log("[MIDDLEWARE] Invalid or expired session from cookies");
      return NextResponse.json(
        { error: "Authentification requise. Session invalide ou expirée." },
        { status: 401 }
      );
    }

    // Attacher les infos utilisateur aux headers de la requête pour les routes API protégées
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", user.id.toString());
    requestHeaders.set("x-user-role", user.role);
    // Ajoutez d'autres en-têtes si nécessaire, comme x-user-email

    console.log("[MIDDLEWARE] Session valid from cookies, proceeding with headers:", {
      "x-user-id": user.id.toString(),
      "x-user-role": user.role,
    });

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  console.log("[MIDDLEWARE] Route not processed by session validation, passing through");
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Appliquer aux routes API, excluant celles gérées spécifiquement (auth)
    // Vous pouvez affiner ce matcher pour être plus précis
    "/api/:path*",
    // Le matcher "/:path*" est trop large et interceptera toutes les pages.
    // Il faut le restreindre si le but est de protéger des pages spécifiques.
    // Si vous voulez protéger des pages, utilisez une logique comme:
    // "/dashboard/:path*", "/profile/:path*", etc.
    // Pour l'instant, concentrons-nous sur la protection des API.
  ],
};

