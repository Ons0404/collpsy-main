/*
  Warnings:

  - You are about to drop the column `resetToken` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `utilisateur` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CategorieTest" AS ENUM ('ANXIETE', 'DEPRESSION', 'STRESS', 'PERSONNALITE', 'ORIENTATION_PROFESSIONNELLE', 'APPRENTISSAGE', 'TDAH', 'BIEN_ETRE');

-- CreateEnum
CREATE TYPE "TypeQuestion" AS ENUM ('CHOIX_UNIQUE', 'CHOIX_MULTIPLE', 'ECHELLE_LIKERT', 'TEXTE_LIBRE');

-- AlterTable
ALTER TABLE "rendez_vous" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "utilisateur" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry";

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "consultationId" INTEGER,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "rendezVousId" INTEGER,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" SERIAL NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "psychologueId" INTEGER NOT NULL,
    "status" "ConsultationStatus" NOT NULL,
    "type" "TypeConsultation" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "summary" TEXT,
    "roomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fichePatientId" TEXT,
    "rendezVousId" INTEGER,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiches_patients" (
    "id" TEXT NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "antecedentsMedicaux" TEXT,
    "antecedentsPsychologiques" TEXT,
    "allergies" TEXT,
    "medicamentsActuels" TEXT,
    "traitementsEnCours" TEXT,
    "symptomesActuels" TEXT,
    "objectifsTherapie" TEXT,
    "notesPsychologue" TEXT,
    "historiqueConsultations" TEXT,

    CONSTRAINT "fiches_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "consultationId" INTEGER NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "satisfaction" INTEGER NOT NULL DEFAULT 0,
    "empathie" INTEGER DEFAULT 0,
    "ecoute" INTEGER DEFAULT 0,
    "comprehension" INTEGER DEFAULT 0,
    "recommandation" INTEGER DEFAULT 0,
    "commentaires" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests_psychologiques" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "categorie" "CategorieTest" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dureeEstimee" INTEGER NOT NULL,

    CONSTRAINT "tests_psychologiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "type" "TypeQuestion" NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options_reponse" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "valeur" INTEGER NOT NULL,

    CONSTRAINT "options_reponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultats_test" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "interpretation" TEXT,
    "datePassation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultats_test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reponses_utilisateur" (
    "id" TEXT NOT NULL,
    "resultatId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT,
    "texteLibre" TEXT,

    CONSTRAINT "reponses_utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consultations_roomId_key" ON "consultations"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "consultations_rendezVousId_key" ON "consultations"("rendezVousId");

-- CreateIndex
CREATE UNIQUE INDEX "fiches_patients_etudiantId_key" ON "fiches_patients"("etudiantId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_consultationId_key" ON "evaluations"("consultationId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "rendez_vous"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiant"("id_etudiant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_psychologueId_fkey" FOREIGN KEY ("psychologueId") REFERENCES "psychologue"("id_psychologue") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_fichePatientId_fkey" FOREIGN KEY ("fichePatientId") REFERENCES "fiches_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_rendezVousId_fkey" FOREIGN KEY ("rendezVousId") REFERENCES "rendez_vous"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_patients" ADD CONSTRAINT "fiches_patients_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiant"("id_etudiant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiant"("id_etudiant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests_psychologiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_reponse" ADD CONSTRAINT "options_reponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_test" ADD CONSTRAINT "resultats_test_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests_psychologiques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_test" ADD CONSTRAINT "resultats_test_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiant"("id_etudiant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponses_utilisateur" ADD CONSTRAINT "reponses_utilisateur_resultatId_fkey" FOREIGN KEY ("resultatId") REFERENCES "resultats_test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponses_utilisateur" ADD CONSTRAINT "reponses_utilisateur_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponses_utilisateur" ADD CONSTRAINT "reponses_utilisateur_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options_reponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
