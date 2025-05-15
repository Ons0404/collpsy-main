// /home/ubuntu/collpsy_mvc_project/app/(mvc)/controllers/rendezVousController.ts
import {
  createRendezVousService,
  updateRendezVousService,
} from "../services/rendezvousService";
import { emailService } from "../services/emailService";
import { dateFormatter } from "../lib/formatters";
import prisma from "../lib/prisma"; // Assurez-vous que prisma est importé
import { NextRequest, NextResponse } from "next/server"; // Import NextRequest/Response for handlers

// Interface for the formatted response
interface RendezVousResponse {
  id: number;
  date: Date;
  heure_debut: string;
  heure_fin: string;
  type: string;
  statut: string;
  notes: string | null;
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
  };
  psychologue: {
    id_psychologue: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
  };
}

// Service function called by POST /api/rendezvous
export async function createRendezVous(data: {
  id_psychologue: number;
  id_utilisateur: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  statut?: string;
  notes?: string;
}) {
  const requiredFields = [
    "id_psychologue",
    "id_utilisateur",
    "date",
    "heure_debut",
    "heure_fin",
    "type",
  ];
  for (const field of requiredFields) {
    if (!data[field as keyof typeof data]) {
      return { error: "Champs obligatoires manquants", status: 400 };
    }
  }

  try {
    const rendezVous = await createRendezVousService(data);
    return { data: rendezVous };
  } catch (error) {
    console.error("Error in createRendezVous controller:", error);
    return { error: "Erreur lors de la création du rendez-vous", status: 500 };
  }
}

// Service function called by PATCH /api/rendezvous/[id]
export async function updateRendezVousStatus(
  id: number,
  data: { statut: string }
) {
  const { statut } = data;
  if (!statut || !["confirmé", "rejeté", "en attente"].includes(statut)) {
    return { error: "Statut invalide", status: 400 };
  }

  try {
    const rendezVous = await updateRendezVousService(id, { statut });
    if (!rendezVous) {
      return { error: "Rendez-vous non trouvé", status: 404 };
    }

    let emailResult = { success: false };
    if (statut === "confirmé" && rendezVous.utilisateur?.email) {
      const formattedDate = dateFormatter.formatDate(rendezVous.date);
      emailResult = await emailService.sendAppointmentConfirmation(
        rendezVous.utilisateur,
        {
          date: formattedDate,
          heureDebut: rendezVous.heure_debut,
          heureFin: rendezVous.heure_fin,
          type: rendezVous.type,
        }
      );
    }

    return { data: { ...rendezVous, emailSent: emailResult.success } };
  } catch (error) {
    console.error("Error in updateRendezVousStatus controller:", error);
    return { error: "Erreur lors de la mise à jour du statut", status: 500 };
  }
}

// Handler for GET /api/rendezvous?userId=...
export async function getRendezVousByUserIdQueryHandler(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl; // Use req.nextUrl for NextRequest
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Le paramètre userId est requis" },
        { status: 400 }
      );
    }

    const id_utilisateur = parseInt(userId);
    if (isNaN(id_utilisateur)) {
      return NextResponse.json(
        { error: 'ID d"utilisateur invalide' },
        { status: 400 }
      );
    }

    // Fetch appointments for the user
    const rendezVous = await prisma.rendezVous.findMany({
      where: {
        id_utilisateur,
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
          },
        },
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
        date: "asc",
      },
    });

    if (!rendezVous || rendezVous.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Format the response data
    const formattedRendezVous: RendezVousResponse[] = rendezVous.map((rdv) => {
      const normalizedType = rdv.type.toLowerCase().trim();
      const type =
        normalizedType === "en ligne" ||
        normalizedType === "en_ligne" ||
        normalizedType === "online"
          ? "en ligne"
          : "présentiel";

      return {
        id: rdv.id,
        date: rdv.date,
        heure_debut: rdv.heure_debut,
        heure_fin: rdv.heure_fin,
        type,
        statut: rdv.statut,
        notes: rdv.notes,
        utilisateur: {
          id: rdv.utilisateur.id,
          nom: rdv.utilisateur.nom,
          prenom: rdv.utilisateur.prenom,
          email: rdv.utilisateur.email,
          telephone: rdv.utilisateur.telephone,
        },
        psychologue: {
          id_psychologue: rdv.psychologue.id_psychologue,
          nom: rdv.psychologue.utilisateur.nom,
          prenom: rdv.psychologue.utilisateur.prenom,
          email: rdv.psychologue.utilisateur.email,
          telephone: rdv.psychologue.utilisateur.telephone,
        },
      };
    });

    return NextResponse.json({ data: formattedRendezVous }, { status: 200 });
  } catch (error) {
    console.error(
      "Controller Error fetching appointments by userId query:",
      error
    );
    return NextResponse.json(
      {
        error: "Erreur serveur interne lors de la récupération des rendez-vous",
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
}

// Handler for GET /api/rendezvous/etudiant/[id]
export async function getRendezVousByEtudiantIdHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id_utilisateur = parseInt(params.id);

    if (isNaN(id_utilisateur)) {
      return NextResponse.json(
        { error: 'ID d"utilisateur invalide' },
        { status: 400 }
      );
    }

    // Consider authorization check here

    const rendezVous = await prisma.rendezVous.findMany({
      where: {
        id_utilisateur,
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
          },
        },
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
        date: "asc", // Or \"desc\" depending on desired order
      },
    });

    // Check if rendezVous is empty and return 404 if needed, or just an empty array
    if (!rendezVous || rendezVous.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 }); // Return empty array instead of 404
    }

    // Format the response data
    const formattedRendezVous: RendezVousResponse[] = rendezVous.map((rdv) => {
      // Normalize type (ensure this logic is robust)
      const normalizedType = rdv.type.toLowerCase().trim();
      const type =
        normalizedType === "en ligne" ||
        normalizedType === "en_ligne" ||
        normalizedType === "online"
          ? "en ligne"
          : "présentiel";

      return {
        id: rdv.id,
        date: rdv.date,
        heure_debut: rdv.heure_debut,
        heure_fin: rdv.heure_fin,
        type,
        statut: rdv.statut,
        notes: rdv.notes,
        utilisateur: {
          id: rdv.utilisateur.id,
          nom: rdv.utilisateur.nom,
          prenom: rdv.utilisateur.prenom,
          email: rdv.utilisateur.email,
          telephone: rdv.utilisateur.telephone,
        },
        psychologue: {
          id_psychologue: rdv.psychologue.id_psychologue,
          nom: rdv.psychologue.utilisateur.nom,
          prenom: rdv.psychologue.utilisateur.prenom,
          email: rdv.psychologue.utilisateur.email,
          telephone: rdv.psychologue.utilisateur.telephone,
        },
      };
    });

    return NextResponse.json({ data: formattedRendezVous }, { status: 200 });
  } catch (error) {
    console.error(
      "Controller Error fetching rendez-vous by etudiant ID:",
      error
    );
    return NextResponse.json(
      {
        error: "Erreur serveur interne lors de la récupération des rendez-vous",
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
}

// Handler for GET /api/rendezvous/prochain/[userId]
export async function getProchainRendezVousByUserIdHandler(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    // Fetch the next upcoming appointment
    const now = new Date();
    const rendezVous = await prisma.rendezVous.findFirst({
      where: {
        // Assuming userId in params refers to psychologist ID based on previous logic
        id_psychologue: userId,
        date: {
          gte: now, // Only future appointments
        },
        statut: {
          not: "annulé", // Exclude cancelled appointments
        },
      },
      orderBy: {
        date: "asc", // Earliest first
      },
      include: {
        utilisateur: {
          select: {
            prenom: true,
            nom: true,
          },
        },
      },
    });

    if (!rendezVous) {
      return NextResponse.json(null, { status: 200 }); // No upcoming appointment
    }

    return NextResponse.json({
      id: rendezVous.id,
      date: rendezVous.date.toISOString(),
      heure_debut: rendezVous.heure_debut,
      utilisateur: {
        prenom: rendezVous.utilisateur.prenom,
        nom: rendezVous.utilisateur.nom,
      },
    });
  } catch (error) {
    console.error(
      `Controller Error fetching next rendez-vous for userId ${params.userId}:`,
      error
    );
    return NextResponse.json(
      { error: "Échec de la récupération du prochain rendez-vous" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
}

// Handler for GET /api/rendezvous/psychologue/[id]
export async function getRendezVousByPsychologueIdHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id_psychologue = parseInt(params.id);

    if (isNaN(id_psychologue)) {
      return NextResponse.json(
        { error: "ID de psychologue invalide" },
        { status: 400 }
      );
    }

    // Récupérer tous les rendez-vous pour ce psychologue avec Prisma
    const rendezVous = await prisma.rendezVous.findMany({
      where: {
        id_psychologue,
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
          },
        },
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
        date: "asc", // Optionnel: trier par date
      },
    });

    // Transformation des données pour le frontend
    const formattedRendezVous: RendezVousResponse[] = rendezVous.map((rdv) => ({
      id: rdv.id,
      date: rdv.date,
      heure_debut: rdv.heure_debut,
      heure_fin: rdv.heure_fin,
      type: rdv.type,
      statut: rdv.statut,
      notes: rdv.notes,
      utilisateur: {
        id: rdv.utilisateur.id,
        nom: rdv.utilisateur.nom,
        prenom: rdv.utilisateur.prenom,
        email: rdv.utilisateur.email,
        telephone: rdv.utilisateur.telephone,
      },
      psychologue: {
        id_psychologue: rdv.psychologue.id_psychologue,
        nom: rdv.psychologue.utilisateur.nom,
        prenom: rdv.psychologue.utilisateur.prenom,
        email: rdv.psychologue.utilisateur.email,
        telephone: rdv.psychologue.utilisateur.telephone,
      },
    }));

    return NextResponse.json({ data: formattedRendezVous }, { status: 200 });
  } catch (error) {
    console.error(
      "Controller Error fetching rendez-vous by psychologue ID:",
      error
    );
    return NextResponse.json(
      {
        error: "Erreur serveur interne lors de la récupération des rendez-vous",
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
}


// Note: The original controller had a getRendezVousByEtudiantId function that returned { data } or { error, status }.
// The new handler getRendezVousByEtudiantIdHandler directly returns NextResponse.
// The POST /api/rendezvous route still uses the old createRendezVous function.
// For consistency, consider refactoring createRendezVous and updateRendezVousStatus
// into handlers that directly return NextResponse, similar to getRendezVousByEtudiantIdHandler.
