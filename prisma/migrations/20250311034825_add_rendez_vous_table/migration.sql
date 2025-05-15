/*
  Warnings:

  - The `photo_diplome` column on the `psychologue` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `avatar` column on the `utilisateur` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "psychologue" DROP COLUMN "photo_diplome",
ADD COLUMN     "photo_diplome" BYTEA;

-- AlterTable
ALTER TABLE "utilisateur" DROP COLUMN "avatar",
ADD COLUMN     "avatar" BYTEA;

-- CreateTable
CREATE TABLE "rendez_vous" (
    "id" SERIAL NOT NULL,
    "id_psychologue" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heure_debut" TEXT NOT NULL,
    "heure_fin" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'confirmé',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rendez_vous_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rendez_vous_id_psychologue_idx" ON "rendez_vous"("id_psychologue");

-- CreateIndex
CREATE INDEX "rendez_vous_id_utilisateur_idx" ON "rendez_vous"("id_utilisateur");

-- CreateIndex
CREATE INDEX "rendez_vous_date_idx" ON "rendez_vous"("date");

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_id_psychologue_fkey" FOREIGN KEY ("id_psychologue") REFERENCES "psychologue"("id_psychologue") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
