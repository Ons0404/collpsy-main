// app/api/etudiants/by-utilisateur/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const utilisateurId = parseInt(params.id, 10);

    if (isNaN(utilisateurId)) {
      console.log(`Invalid utilisateurId: ${params.id}`);
      return NextResponse.json(
        { error: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    const etudiant = await prisma.etudiant.findFirst({
      where: {
        utilisateur: { id: utilisateurId }, // Correction : Utilisation de la relation utilisateur
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            mot_de_passe: true, // Attention : éviter de renvoyer le mot de passe en production
            date_inscription: true,
            date_naissance: true,
            adresse: true,
            ville: true,
            code_postal: true,
            telephone: true,
            civilite: true,
            role: true,
            statut: true,
            avatar: true,
          },
        },
      },
    });

    if (!etudiant) {
      console.log(`No student found for utilisateurId: ${utilisateurId}`);
      return NextResponse.json(
        { error: "Aucun étudiant trouvé pour cet utilisateur" },
        { status: 404 }
      );
    }

    console.log(`Student found: ${JSON.stringify(etudiant)}`);
    return NextResponse.json(etudiant, { status: 200 });
  } catch (error) {
    console.error("Error fetching etudiant:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";

    return NextResponse.json(
      { error: "Erreur serveur", details: errorMessage },
      { status: 500 }
    );
  }
}
