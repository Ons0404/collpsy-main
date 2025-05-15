import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologueId = parseInt(params.id);

    if (isNaN(psychologueId)) {
      return NextResponse.json(
        { error: "ID de psychologue invalide" },
        { status: 400 }
      );
    }

    // Vérifier que le psychologue existe
    const psychologue = await prisma.psychologue.findUnique({
      where: { id_psychologue: psychologueId },
    });

    if (!psychologue) {
      return NextResponse.json(
        { error: "Psychologue non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les patients ayant pris rendez-vous avec ce psychologue
    const patients = await prisma.utilisateur.findMany({
      where: {
        role: "ETUDIANT",
        rendezVous: {
          some: {
            id_psychologue: psychologueId,
          },
        },
      },
      include: {
        rendezVous: {
          where: {
            id_psychologue: psychologueId,
          },
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
        etudiant: true,
      },
    });

    // Formater les données pour la réponse
    const formattedPatients = patients.map((patient) => ({
      id: patient.id,
      nom: patient.nom,
      prenom: patient.prenom,
      email: patient.email,
      date_naissance: patient.date_naissance,
      telephone: patient.telephone,
      rendezVous: patient.rendezVous.map((rdv) => ({
        id: rdv.id,
        date: rdv.date,
        heure_debut: rdv.heure_debut,
        statut: rdv.statut,
      })),
    }));

    return NextResponse.json(formattedPatients);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur interne",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
