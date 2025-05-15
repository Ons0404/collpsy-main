import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id_utilisateur = parseInt(params.id);

    if (isNaN(id_utilisateur)) {
      return NextResponse.json(
        { error: "ID d'utilisateur invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe et est un étudiant
    const etudiant = await prisma.utilisateur.findUnique({
      where: { id: id_utilisateur, role: "ETUDIANT" },
      include: { etudiant: true },
    });

    if (!etudiant) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les rendez-vous de l'étudiant avec les informations du psychologue
    const rendezVous = await prisma.rendezVous.findMany({
      where: { id_utilisateur: id_utilisateur },
      include: {
        psychologue: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Formater la réponse
    const result = rendezVous.map((rdv) => ({
      id: rdv.id,
      date: rdv.date,
      heure_debut: rdv.heure_debut,
      heure_fin: rdv.heure_fin,
      type: rdv.type,
      statut: rdv.statut,
      notes: rdv.notes,
      psychologue: {
        id: rdv.psychologue.id_psychologue,
        nom: rdv.psychologue.utilisateur.nom,
        prenom: rdv.psychologue.utilisateur.prenom,
        email: rdv.psychologue.utilisateur.email,
        telephone: rdv.psychologue.utilisateur.telephone,
        titre: rdv.psychologue.titre,
        etablissement: rdv.psychologue.etablissement,
      },
    }));

    return NextResponse.json(result);
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
