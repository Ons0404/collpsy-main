import { NextResponse } from "next/server";
import { generateMeetLink } from "../../(mvc)/controllers/consultationController";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startTime, endTime, studentId, psychologueId, rendezVousId } = body;

    console.log("API Route - Données reçues:", {
      startTime,
      endTime,
      studentId,
      psychologueId,
      rendezVousId,
    });

    // Vérifier si les dates sont définies
    if (!startTime || !endTime) {
      throw new Error("Les dates de début et de fin sont requises");
    }

    // Corriger le format de date si nécessaire
    const formattedStartTime = fixDateFormat(startTime);
    const formattedEndTime = fixDateFormat(endTime);

    console.log("API Route - Dates formatées:", {
      formattedStartTime,
      formattedEndTime,
    });

    // Appel au contrôleur
    const meetLink = await generateMeetLink(
      formattedStartTime,
      formattedEndTime
    );

    return NextResponse.json({ meetLink });
  } catch (error) {
    console.error("Erreur dans l'API route:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to generate Google Meet link",
          details: error.message,
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          error: "Failed to generate Google Meet link",
          details: "Une erreur inconnue s'est produite",
        },
        { status: 500 }
      );
    }
  }
}

// Fonction améliorée pour corriger le format de date
function fixDateFormat(dateTimeString: string): string {
  // Vérifier si la chaîne est définie
  if (!dateTimeString) {
    throw new Error("La date fournie est undefined");
  }

  // Vérifions si la chaîne est une date valide
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      throw new Error(`Format de date invalide: ${dateTimeString}`);
    }
  } catch (e) {
    throw new Error(
      `Erreur lors de la conversion de la date: ${dateTimeString}`
    );
  }

  // Si la chaîne contient déjà deux 'T', c'est probablement un format incorrect
  if ((dateTimeString.match(/T/g) || []).length > 1) {
    // Extraire la date et l'heure
    const parts = dateTimeString.split("T");
    // Si nous avons plus de 2 parties, reconstruire correctement
    if (parts.length > 2) {
      const datePart = parts[0];
      const timePart = parts[parts.length - 1].split("+")[0]; // Prendre la dernière partie pour l'heure
      return `${datePart}T${timePart}+01:00`;
    }
  }

  // Si nous avons reçu une date sans fuseau horaire, ajouter un fuseau horaire par défaut
  if (!dateTimeString.includes("+") && !dateTimeString.includes("Z")) {
    return `${dateTimeString}+01:00`;
  }

  // Si le format semble déjà correct, retourner la chaîne d'origine
  return dateTimeString;
}
