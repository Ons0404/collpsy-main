import prisma from "../lib/prisma";

export const createRendezVous = async (data: any) => {
  return prisma.rendezVous.create({ data });
};

export const getRendezVousById = async (id: number) => {
  return prisma.rendezVous.findUnique({
    where: { id },
    include: {
      utilisateur: true,
      psychologue: { include: { utilisateur: true } },
    },
  });
};

export const updateRendezVous = async (id: number, data: any) => {
  return prisma.rendezVous.update({
    where: { id },
    data,
    include: {
      utilisateur: true,
      psychologue: { include: { utilisateur: true } },
    },
  });
};

export const getRendezVousByUtilisateurId = async (id_utilisateur: number) => {
  return prisma.rendezVous.findMany({
    where: { id_utilisateur },
    include: {
      utilisateur: true,
      psychologue: { include: { utilisateur: true } },
    },
    orderBy: { date: "desc" },
  });
};
