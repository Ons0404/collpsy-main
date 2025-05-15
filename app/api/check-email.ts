import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ message: "Email requis et doit être une chaîne" });
  }

  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    return res.status(200).json({
      exists: !!utilisateur,
      utilisateur: utilisateur || null,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
