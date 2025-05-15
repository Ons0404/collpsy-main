import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../(mvc)/lib/prisma";

// Interface pour typer les données renvoyées
interface PsychologistResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  rendezVous: {
    id: number;
    date: string;
    heure_debut: string;
    statut: string;
  }[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("API Etudiants - Paramètres reçus:", params);
    const userId = parseInt(params.id);

    console.log("API Etudiants - UserId après parse:", userId);
    if (isNaN(userId)) {
      console.error("API Etudiants - ID utilisateur invalide:", params.id);
      return NextResponse.json(
        { error: "ID d'utilisateur invalide" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    console.log("API Etudiants - Utilisateur trouvé:", utilisateur);
    if (!utilisateur || utilisateur.role !== "ETUDIANT") {
      console.error(
        "API Etudiants - Utilisateur non trouvé ou n'est pas étudiant pour userId:",
        userId
      );
      return NextResponse.json(
        { error: "Utilisateur non trouvé ou n'est pas un étudiant" },
        { status: 404 }
      );
    }

    // Vérifier si l'étudiant existe
    const etudiant = await prisma.etudiant.findUnique({
      where: { id_etudiant: userId },
    });

    console.log("API Etudiants - Étudiant trouvé:", etudiant);
    if (!etudiant) {
      console.warn("API Etudiants - Aucun étudiant lié pour userId:", userId);
      return NextResponse.json([], { status: 200 }); // Retourner une liste vide
    }

    // Récupérer les rendez-vous de l'étudiant avec les détails des psychologues
    const rendezVous = await prisma.rendezVous.findMany({
      where: {
        id_utilisateur: userId,
        statut: "confirmé",
      },
      include: {
        psychologue: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log("API Etudiants - Rendez-vous récupérés:", rendezVous);

    // Regrouper les rendez-vous par psychologue
    const psychologistsMap = new Map<number, PsychologistResponse>();

    rendezVous.forEach((rdv) => {
      const psychologue = rdv.psychologue;
      const psychologueId = psychologue.id_psychologue;

      if (!psychologistsMap.has(psychologueId)) {
        psychologistsMap.set(psychologueId, {
          id: psychologueId,
          nom: psychologue.utilisateur.nom,
          prenom: psychologue.utilisateur.prenom,
          email: psychologue.utilisateur.email,
          rendezVous: [],
        });
      }

      psychologistsMap.get(psychologueId)!.rendezVous.push({
        id: rdv.id,
        date: rdv.date.toISOString(),
        heure_debut: rdv.heure_debut,
        statut: rdv.statut,
      });
    });

    const formattedPsychologists: PsychologistResponse[] = Array.from(
      psychologistsMap.values()
    );

    console.log(
      "API Etudiants - Psychologues formatés:",
      formattedPsychologists
    );
    return NextResponse.json(formattedPsychologists, { status: 200 });
  } catch (error) {
    console.error("API Etudiants - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
