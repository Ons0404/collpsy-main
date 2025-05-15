import { PrismaClient } from "@prisma/client";

// Utilisation de Prisma avec une instance globale pour éviter la réinitialisation en développement
const prisma = global.prisma || new PrismaClient();

// Attacher Prisma à l'objet global pour éviter les réinitialisations en développement
if (process.env.NODE_ENV === "production") {
  global.prisma = prisma;
}

export default prisma;
