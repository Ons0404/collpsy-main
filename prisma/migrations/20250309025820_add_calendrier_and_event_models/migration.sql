/*
  Warnings:

  - You are about to drop the column `tarif` on the `psychologue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "psychologue" DROP COLUMN "tarif";

-- CreateTable
CREATE TABLE "calendrier" (
    "id" SERIAL NOT NULL,
    "psychologueId" INTEGER NOT NULL,

    CONSTRAINT "calendrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "calendrierId" INTEGER NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calendrier_psychologueId_key" ON "calendrier"("psychologueId");

-- AddForeignKey
ALTER TABLE "calendrier" ADD CONSTRAINT "calendrier_psychologueId_fkey" FOREIGN KEY ("psychologueId") REFERENCES "psychologue"("id_psychologue") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_calendrierId_fkey" FOREIGN KEY ("calendrierId") REFERENCES "calendrier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
