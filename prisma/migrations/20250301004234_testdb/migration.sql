-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('PSYCHOLOGUE', 'ETUDIANT');

-- CreateEnum
CREATE TYPE "CiviliteEnum" AS ENUM ('M', 'Mme');

-- CreateTable
CREATE TABLE "Utilisateur" (
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

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychologue" (
    "id_psychologue" SERIAL NOT NULL,
    "cin" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "etablissement" TEXT NOT NULL,
    "adresse_cabinet" TEXT,
    "intitule_diplome" TEXT NOT NULL,
    "date_obtention" TIMESTAMP(3) NOT NULL,
    "mode_consultation" TEXT,
    "photo_diplome" BYTEA,
    "tarif" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "psychologue_pkey" PRIMARY KEY ("id_psychologue")
);

-- CreateTable
CREATE TABLE "etudiant" (
    "id_etudiant" SERIAL NOT NULL,
    "numero_carte_etudiant" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "etablissement" TEXT NOT NULL,

    CONSTRAINT "etudiant_pkey" PRIMARY KEY ("id_etudiant")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "psychologue_cin_key" ON "psychologue"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "etudiant_numero_carte_etudiant_key" ON "etudiant"("numero_carte_etudiant");

-- AddForeignKey
ALTER TABLE "psychologue" ADD CONSTRAINT "psychologue_id_psychologue_fkey" FOREIGN KEY ("id_psychologue") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiant" ADD CONSTRAINT "etudiant_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
