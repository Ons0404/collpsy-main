/*
  Warnings:

  - You are about to drop the `Utilisateur` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[utilisateurId]` on the table `etudiant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[utilisateurId]` on the table `psychologue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `utilisateurId` to the `etudiant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilisateurId` to the `psychologue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "etudiant" DROP CONSTRAINT "etudiant_id_etudiant_fkey";

-- DropForeignKey
ALTER TABLE "psychologue" DROP CONSTRAINT "psychologue_id_psychologue_fkey";

-- AlterTable
ALTER TABLE "etudiant" ADD COLUMN     "utilisateurId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "psychologue" ADD COLUMN     "utilisateurId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Utilisateur";

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_naissance" TIMESTAMP(3),
    "adresse" TEXT,
    "ville" TEXT,
    "code_postal" TEXT,
    "telephone" TEXT,
    "role" "RoleEnum" NOT NULL,
    "civilite" "CiviliteEnum" NOT NULL,
    "avatar" BYTEA,
    "statut" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reset_token_token_key" ON "reset_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "reset_token_userId_key" ON "reset_token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "etudiant_utilisateurId_key" ON "etudiant"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "psychologue_utilisateurId_key" ON "psychologue"("utilisateurId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_token" ADD CONSTRAINT "reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychologue" ADD CONSTRAINT "psychologue_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiant" ADD CONSTRAINT "etudiant_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
