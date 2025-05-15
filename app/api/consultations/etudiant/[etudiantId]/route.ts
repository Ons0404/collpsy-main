import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { etudiantId: string } }
) {
  try {
    console.log("Full params object:", params);
    console.log("userId:", params.etudiantId);
    console.log("userId type:", typeof params.etudiantId);

    if (
      !params.etudiantId ||
      typeof params.etudiantId !== "string" ||
      params.etudiantId.trim() === ""
    ) {
      return NextResponse.json(
        { error: "User ID is missing, empty, or invalid" },
        { status: 400 }
      );
    }

    const userId = parseInt(params.etudiantId, 10);
    console.log("Parsed userId:", userId);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "User ID must be a valid number" },
        { status: 400 }
      );
    }

    const etudiant = await prisma.etudiant.findUnique({
      where: { id_etudiant: userId },
      select: { id_etudiant: true },
    });

    if (!etudiant) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        etudiantId: etudiant.id_etudiant,
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
                civilite: true,
              },
            },
          },
        },
        rendezVous: {
          select: {
            id: true,
            date: true,
            heure_debut: true,
            heure_fin: true,
            type: true,
            statut: true,
          },
        },
        fichePatient: {
          select: {
            id: true,
            antecedentsMedicaux: true,
            antecedentsPsychologiques: true,
            allergies: true,
            medicamentsActuels: true,
            traitementsEnCours: true,
            symptomesActuels: true,
            objectifsTherapie: true,
            notesPsychologue: true,
            historiqueConsultations: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    const formattedConsultations = consultations.map((consultation) => ({
      id: consultation.id,
      etudiantId: consultation.etudiantId,
      psychologueId: consultation.psychologueId,
      status: consultation.status,
      type: consultation.type,
      startTime: consultation.startTime.toISOString(),
      endTime: consultation.endTime.toISOString(),
      notes: consultation.notes,
      summary: consultation.summary,
      roomId: consultation.roomId,
      createdAt: consultation.createdAt.toISOString(),
      updatedAt: consultation.updatedAt.toISOString(),
      fichePatientId: consultation.fichePatientId,
      rendezVousId: consultation.rendezVousId,
      psychologue: {
        utilisateur: {
          id: consultation.psychologue.utilisateur.id,
          nom: consultation.psychologue.utilisateur.nom,
          prenom: consultation.psychologue.utilisateur.prenom,
          email: consultation.psychologue.utilisateur.email,
          civilite: consultation.psychologue.utilisateur.civilite,
        },
      },
      rendezVous: {
        id: consultation.rendezVous.id,
        date: consultation.rendezVous.date.toISOString(),
        heure_debut: consultation.rendezVous.heure_debut,
        heure_fin: consultation.rendezVous.heure_fin,
        type: consultation.rendezVous.type,
        statut: consultation.rendezVous.statut,
      },
      fichePatient: consultation.fichePatient
        ? {
            id: consultation.fichePatient.id,
            antecedentsMedicaux: consultation.fichePatient.antecedentsMedicaux,
            antecedentsPsychologiques:
              consultation.fichePatient.antecedentsPsychologiques,
            allergies: consultation.fichePatient.allergies,
            medicamentsActuels: consultation.fichePatient.medicamentsActuels,
            traitementsEnCours: consultation.fichePatient.traitementsEnCours,
            symptomesActuels: consultation.fichePatient.symptomesActuels,
            objectifsTherapie: consultation.fichePatient.objectifsTherapie,
            notesPsychologue: consultation.fichePatient.notesPsychologue,
            historiqueConsultations:
              consultation.fichePatient.historiqueConsultations,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedConsultations,
    });
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
