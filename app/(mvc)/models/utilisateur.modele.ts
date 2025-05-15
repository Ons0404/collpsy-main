import prisma from "../lib/prisma";

export const findUserByEmail = async (email: string) => {
  return prisma.utilisateur.findUnique({
    where: { email },
    include: { etudiant: true, psychologue: true },
  });
};
