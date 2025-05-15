/*
  Warnings:

  - You are about to drop the column `utilisateurId` on the `etudiant` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `psychologue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "etudiant" DROP CONSTRAINT "etudiant_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "psychologue" DROP CONSTRAINT "psychologue_utilisateurId_fkey";

-- DropIndex
DROP INDEX "etudiant_utilisateurId_key";

-- DropIndex
DROP INDEX "psychologue_utilisateurId_key";

-- AlterTable
ALTER TABLE "etudiant" DROP COLUMN "utilisateurId",
ALTER COLUMN "id_etudiant" DROP DEFAULT;
DROP SEQUENCE "etudiant_id_etudiant_seq";

-- AlterTable
ALTER TABLE "psychologue" DROP COLUMN "utilisateurId",
ALTER COLUMN "id_psychologue" DROP DEFAULT;
DROP SEQUENCE "psychologue_id_psychologue_seq";

-- AlterTable
ALTER TABLE "rendez_vous" ALTER COLUMN "statut" SET DEFAULT 'en attente';

-- CreateTable
CREATE TABLE "administrateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,

    CONSTRAINT "administrateur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrateur_email_key" ON "administrateur"("email");

-- AddForeignKey
ALTER TABLE "psychologue" ADD CONSTRAINT "psychologue_id_psychologue_fkey" FOREIGN KEY ("id_psychologue") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiant" ADD CONSTRAINT "etudiant_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
