/*
  Warnings:

  - You are about to drop the `calendrier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeConsultation" AS ENUM ('PRESENTIEL', 'EN_LIGNE', 'LES_DEUX');

-- DropForeignKey
ALTER TABLE "calendrier" DROP CONSTRAINT "calendrier_psychologueId_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_calendrierId_fkey";

-- AlterTable
ALTER TABLE "psychologue" ALTER COLUMN "photo_diplome" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "utilisateur" ALTER COLUMN "avatar" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "calendrier";

-- DropTable
DROP TABLE "event";

-- CreateTable
CREATE TABLE "disponibilite" (
    "id" SERIAL NOT NULL,
    "id_psychologue" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heure_debut" TEXT NOT NULL,
    "heure_fin" TEXT NOT NULL,
    "type" "TypeConsultation" NOT NULL,
    "est_disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "disponibilite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "disponibilite" ADD CONSTRAINT "disponibilite_id_psychologue_fkey" FOREIGN KEY ("id_psychologue") REFERENCES "psychologue"("id_psychologue") ON DELETE RESTRICT ON UPDATE CASCADE;
