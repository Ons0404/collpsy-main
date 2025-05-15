import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma"; // Ajustez le chemin selon votre structure de projet

/**
 * Récupère les disponibilités d'un psychologue
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; disponibiliteId?: string } }
) {
  try {
    const userId = parseInt(params.id);

    // Si un ID de disponibilité spécifique est fourni
    if (params.disponibiliteId) {
      const disponibiliteId = parseInt(params.disponibiliteId);

      const disponibilite = await prisma.disponibilite.findFirst({
        where: {
          id: disponibiliteId,
          id_psychologue: userId,
        },
      });

      if (!disponibilite) {
        return NextResponse.json(
          { error: "Disponibilité non trouvée" },
          { status: 404 }
        );
      }

      return NextResponse.json(disponibilite);
    }

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const heure_debut = searchParams.get("heure_debut");
    const heure_fin = searchParams.get("heure_fin");

    // Construire la clause where
    const whereClause: any = {
      id_psychologue: userId,
    };

    // Ajouter les filtres optionnels
    if (date) {
      const parsedDate = new Date(date);
      whereClause.date = parsedDate;
    }

    if (heure_debut) {
      whereClause.heure_debut = heure_debut;
    }

    if (heure_fin) {
      whereClause.heure_fin = heure_fin;
    }

    // Récupérer les disponibilités filtrées
    const disponibilites = await prisma.disponibilite.findMany({
      where: whereClause,
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(disponibilites);
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
/**
 * Crée une nouvelle disponibilité pour un psychologue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const data = await request.json();

    // Validation des données
    if (!data.date || !data.heure_debut || !data.heure_fin) {
      return NextResponse.json(
        { error: "La date, l'heure de début et l'heure de fin sont requises" },
        { status: 400 }
      );
    }

    // Convertir la date en objet Date
    const dateString = data.date; // Format attendu: "2025-03-11"
    const parsedDate = new Date(dateString);

    // Vérifier si la date est valide
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Format de date invalide" },
        { status: 400 }
      );
    }

    // Combiner date et heures pour créer des DateTime complètes
    // Format attendu pour les heures: "09:00" (hh:mm)
    const [heureDebut, minuteDebut] = data.heure_debut.split(":").map(Number);
    const [heureFin, minuteFin] = data.heure_fin.split(":").map(Number);

    const dateTimeDebut = new Date(parsedDate);
    dateTimeDebut.setHours(heureDebut, minuteDebut, 0, 0);

    const dateTimeFin = new Date(parsedDate);
    dateTimeFin.setHours(heureFin, minuteFin, 0, 0);

    // Vérifier que l'heure de début est antérieure à l'heure de fin
    if (dateTimeDebut >= dateTimeFin) {
      return NextResponse.json(
        { error: "L'heure de début doit être antérieure à l'heure de fin" },
        { status: 400 }
      );
    }

    // Créer la disponibilité
    // Créer la disponibilité
    const nouvelleDisponibilite = await prisma.disponibilite.create({
      data: {
        id_psychologue: userId,
        date: parsedDate,
        heure_debut: data.heure_debut,
        heure_fin: data.heure_fin,
        est_disponible: true,
        type: data.type || "standard", // Ajoutez le champ type avec une valeur par défaut
      },
    });

    return NextResponse.json(nouvelleDisponibilite, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la disponibilité:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * Supprime une disponibilité spécifique
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; disponibiliteId: string } }
) {
  try {
    const userId = parseInt(params.id);
    const disponibiliteId = parseInt(params.disponibiliteId);

    // Vérifier que la disponibilité existe et appartient au psychologue
    const disponibilite = await prisma.disponibilite.findFirst({
      where: {
        id: disponibiliteId,
        id_psychologue: userId,
      },
    });

    if (!disponibilite) {
      return NextResponse.json(
        { error: "Disponibilité non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la disponibilité
    await prisma.disponibilite.delete({
      where: {
        id: disponibiliteId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la disponibilité:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
