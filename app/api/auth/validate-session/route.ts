// Fichier à placer par exemple dans pages/api/auth/validate-session.ts (pour Pages Router)
// Ou app/api/auth/validate-session/route.ts (pour App Router, avec adaptation de la syntaxe req/res en Request/NextResponse)

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../(mvc)/lib/prisma"; // Ajustez ce chemin vers votre instance Prisma

// Fonction pour parser le sessionToken (qui est l'ID de la session)
function parseSessionToken(token: string): number | null {
  const id = parseInt(token, 10);
  return isNaN(id) ? null : id;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { sessionToken } = req.body;

  if (!sessionToken || typeof sessionToken !== "string") {
    return res
      .status(400)
      .json({
        isValid: false,
        error: "Token de session manquant ou invalide.",
      });
  }

  const sessionId = parseSessionToken(sessionToken);

  if (sessionId === null) {
    return res
      .status(400)
      .json({ isValid: false, error: "Format du token de session invalide." });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { utilisateur: { select: { id: true, role: true } } }, // Sélectionner seulement les champs nécessaires
    });

    if (session && session.expiresAt > new Date()) {
      // Session valide et non expirée
      // Optionnel: prolonger la session (sliding session)
      // await prisma.session.update({ where: { id: sessionId }, data: { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });

      return res.status(200).json({
        isValid: true,
        user: {
          id: session.utilisateur.id,
          role: session.utilisateur.role,
        },
      });
    } else {
      // Session expirée ou non trouvée
      if (session) {
        // Si la session a été trouvée mais est expirée, on peut la supprimer de la DB
        await prisma.session
          .delete({ where: { id: sessionId } })
          .catch(console.error);
      }
      return res
        .status(401)
        .json({ isValid: false, error: "Session invalide ou expirée." });
    }
  } catch (error) {
    console.error("[API_VALIDATE_SESSION] Prisma error:", error);
    return res
      .status(500)
      .json({
        isValid: false,
        error: "Erreur interne du serveur lors de la validation de la session.",
      });
  }
}
