import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma"; // Ajustez le chemin relatif
import { RoleEnum } from "@prisma/client"; // Assurez-vous que RoleEnum est correctement importé ou défini

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Psychologues inscrits récemment (30 derniers jours)
    const recentlyRegisteredPsychologists = await prisma.utilisateur.count({
      where: {
        role: RoleEnum.PSYCHOLOGUE,
        date_inscription: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Psychologues approuvés récemment (inscrits ET approuvés dans les 30 derniers jours)
    const recentlyApprovedPsychologists = await prisma.utilisateur.count({
      where: {
        role: RoleEnum.PSYCHOLOGUE,
        statut: true,
        date_inscription: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Psychologues en attente d'approbation (statut false)
    const pendingApprovalPsychologists = await prisma.utilisateur.count({
      where: {
        role: RoleEnum.PSYCHOLOGUE,
        statut: false,
      },
    });

    // Calcul du taux d'approbation des nouveaux inscrits (sur 30 jours)
    // (Approuvés récents / Inscrits récents)
    let approvalRateOfNew = 0;
    if (recentlyRegisteredPsychologists > 0) {
      approvalRateOfNew =
        (recentlyApprovedPsychologists / recentlyRegisteredPsychologists) * 100;
    }

    // Pour le "taux de suppression/désactivation", sans historique de changement de statut,
    // on peut fournir le nombre total de psychologues désactivés (statut false).
    // Ceci est déjà couvert par pendingApprovalPsychologists si on considère que "désactivé" = "non actif".
    // Si "désactivé" signifie un psychologue qui était actif PUIS désactivé, c'est plus complexe sans logs.
    // Pour l'instant, pendingApprovalPsychologists représente tous les psychologues non actifs.

    const totalPsychologists = await prisma.utilisateur.count({
      where: { role: RoleEnum.PSYCHOLOGUE },
    });

    const totalActivePsychologists = await prisma.utilisateur.count({
      where: {
        role: RoleEnum.PSYCHOLOGUE,
        statut: true,
      },
    });

    return NextResponse.json({
      recentlyRegisteredPsychologistsLast30Days:
        recentlyRegisteredPsychologists,
      recentlyApprovedPsychologistsLast30Days: recentlyApprovedPsychologists,
      pendingApprovalPsychologists: pendingApprovalPsychologists, // Psychologues avec statut = false
      approvalRateOfNewPsychologistsLast30Days: parseFloat(
        approvalRateOfNew.toFixed(2)
      ),
      totalPsychologists: totalPsychologists,
      totalActivePsychologists: totalActivePsychologists,
      totalInactivePsychologists: totalPsychologists - totalActivePsychologists, // Égal à pendingApprovalPsychologists si tous les inactifs sont en attente
    });
  } catch (error) {
    console.error("Error fetching account status rate data:", error);
    // Vérifier si l'erreur est liée à Prisma (par exemple, enum non trouvé)
    if (error instanceof Error && error.message.includes("RoleEnum")) {
      return NextResponse.json(
        {
          error:
            "Internal server error related to RoleEnum. Please check enum definitions and imports.",
          details: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch account status rate data" },
      { status: 500 }
    );
  }
}

// Définition de RoleEnum si non importable directement depuis @prisma/client dans ce contexte de fichier API simple
// Ceci est un placeholder, assurez-vous que la vraie enum est accessible par Prisma
// Si vous utilisez `import { RoleEnum } from '@prisma/client';`, cette redéfinition n'est pas nécessaire.
// enum RoleEnum {
//   ETUDIANT = "ETUDIANT",
//   PSYCHOLOGUE = "PSYCHOLOGUE",
//   ADMIN = "ADMIN"
// }
