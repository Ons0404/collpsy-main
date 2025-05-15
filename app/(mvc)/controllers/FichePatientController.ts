// /home/ubuntu/collpsy_mvc_project/app/controllers/fichePatient/fichePatientController.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Note: It seems the prisma client instance was potentially imported from a different path
// in the original [id]/route.ts (../../../(mvc)/lib/prisma).
// Ensure the prisma client is correctly initialized and accessible here.
// Using a new instance for now, but centralizing prisma client is recommended.
const prisma = new PrismaClient();

// Handler for GET /api/FichePatient - Seems misplaced, fetches tests?
export const getAllTestsFromFichePatientRoute = async () => {
  try {
    // This logic was originally in /api/FichePatient/route.ts
    // It fetches TestPsychologique, not FichePatient. Consider moving this to a test controller.
    const tests = await prisma.testPsychologique.findMany({
      include: {
        questions: {
          include: {
            optionsReponse: true,
          },
        },
      },
    });
    return NextResponse.json(tests);
  } catch (error) {
    console.error("Error fetching tests from FichePatient route:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for POST /api/FichePatient/[id] (using etudiantId as id)
export const createFichePatient = async (req: NextRequest) => {
  try {
    const body = await req.json();
    console.log("Controller: Creating fiche patient with data:", body);

    if (!body.etudiantId) {
      console.log("Controller Error: etudiantId missing");
      return NextResponse.json(
        { message: "Le champ etudiantId est requis" },
        { status: 400 }
      );
    }

    // Check if fiche already exists for this student
    const existingFiche = await prisma.fichePatient.findUnique({
      where: { etudiantId: body.etudiantId },
    });

    if (existingFiche) {
      console.log(
        "Controller Info: Fiche patient already exists for etudiantId:",
        body.etudiantId
      );
      return NextResponse.json(
        { message: "Une fiche patient existe déjà pour cet étudiant" },
        { status: 409 } // Conflict status code
      );
    }

    const fichePatient = await prisma.fichePatient.create({
      data: {
        etudiantId: body.etudiantId,
        antecedentsMedicaux: body.antecedentsMedicaux ?? null,
        antecedentsPsychologiques: body.antecedentsPsychologiques ?? null,
        allergies: body.allergies ?? null,
        medicamentsActuels: body.medicamentsActuels ?? null,
        traitementsEnCours: body.traitementsEnCours ?? null,
        symptomesActuels: body.symptomesActuels ?? null,
        objectifsTherapie: body.objectifsTherapie ?? null,
        notesPsychologue: body.notesPsychologue ?? null,
        historiqueConsultations: body.historiqueConsultations ?? null,
      },
      include: {
        etudiant: {
          include: {
            utilisateur: true,
          },
        },
      },
    });

    console.log(
      "Controller: Fiche patient created successfully:",
      fichePatient
    );
    return NextResponse.json(fichePatient, { status: 201 });
  } catch (error) {
    console.error("Controller Error creating fiche patient:", error);
    return NextResponse.json(
      {
        message: "Erreur serveur lors de la création",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for GET /api/FichePatient/[id] (using etudiantId as id)
export const getFichePatientByEtudiantId = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log(
      "Controller: Fetching fiche patient with etudiantId:",
      params.id
    );
    const etudiantId = parseInt(params.id);

    if (isNaN(etudiantId)) {
      console.log("Controller Error: Invalid ID");
      return NextResponse.json(
        { message: "ID d'étudiant invalide" },
        { status: 400 }
      );
    }

    const fichePatient = await prisma.fichePatient.findUnique({
      where: { etudiantId },
      include: {
        etudiant: {
          include: {
            utilisateur: true,
          },
        },
      },
    });

    if (!fichePatient) {
      console.log("Controller Info: Fiche not found");
      return NextResponse.json(
        { message: "Fiche patient non trouvée" },
        { status: 404 }
      );
    }

    console.log("Controller: Fiche patient found:", fichePatient);
    return NextResponse.json(fichePatient, { status: 200 });
  } catch (error) {
    console.error("Controller Error fetching fiche patient:", error);
    return NextResponse.json(
      {
        message: "Erreur serveur lors de la récupération",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for PUT /api/FichePatient/[id] (using etudiantId as id)
export const updateOrCreareFichePatientByEtudiantId = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log(
      "Controller: Updating/Creating fiche patient with etudiantId:",
      params.id
    );
    const etudiantId = parseInt(params.id);
    const body = await req.json();
    console.log("Controller: Received data:", body);

    if (isNaN(etudiantId)) {
      console.log("Controller Error: Invalid ID");
      return NextResponse.json(
        { message: "ID d'étudiant invalide" },
        { status: 400 }
      );
    }

    // Use upsert for cleaner create/update logic
    const fichePatient = await prisma.fichePatient.upsert({
      where: { etudiantId },
      update: {
        antecedentsMedicaux: body.antecedentsMedicaux,
        antecedentsPsychologiques: body.antecedentsPsychologiques,
        allergies: body.allergies,
        medicamentsActuels: body.medicamentsActuels,
        traitementsEnCours: body.traitementsEnCours,
        symptomesActuels: body.symptomesActuels,
        objectifsTherapie: body.objectifsTherapie,
        notesPsychologue: body.notesPsychologue,
        historiqueConsultations: body.historiqueConsultations,
      },
      create: {
        etudiantId,
        antecedentsMedicaux: body.antecedentsMedicaux ?? null,
        antecedentsPsychologiques: body.antecedentsPsychologiques ?? null,
        allergies: body.allergies ?? null,
        medicamentsActuels: body.medicamentsActuels ?? null,
        traitementsEnCours: body.traitementsEnCours ?? null,
        symptomesActuels: body.symptomesActuels ?? null,
        objectifsTherapie: body.objectifsTherapie ?? null,
        notesPsychologue: body.notesPsychologue ?? null,
        historiqueConsultations: body.historiqueConsultations ?? null,
      },
      include: {
        etudiant: {
          include: {
            utilisateur: true,
          },
        },
      },
    });

    // Determine if it was created or updated for the status code
    // Note: Upsert doesn't directly tell us if it created or updated.
    // We could query before upsert, but that's less efficient.
    // Returning 200 for update and 201 for create is standard, but upsert complicates this.
    // Let's return 200 for simplicity, or check creation timestamp if needed.
    console.log(
      "Controller: Fiche patient upserted successfully:",
      fichePatient
    );
    return NextResponse.json(fichePatient, { status: 200 }); // Or 201 if creation is confirmed
  } catch (error) {
    console.error("Controller Error upserting fiche patient:", error);
    return NextResponse.json(
      {
        message: "Erreur serveur lors de la mise à jour/création",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for DELETE /api/FichePatient/[id] (using etudiantId as id)
export const deleteFichePatientByEtudiantId = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log(
      "Controller: Deleting fiche patient with etudiantId:",
      params.id
    );
    const etudiantId = parseInt(params.id);

    if (isNaN(etudiantId)) {
      console.log("Controller Error: Invalid ID");
      return NextResponse.json(
        { message: "ID d'étudiant invalide" },
        { status: 400 }
      );
    }

    // Check if the record exists before attempting deletion
    const existingFile = await prisma.fichePatient.findUnique({
      where: { etudiantId },
    });

    if (!existingFile) {
      console.log("Controller Info: Fiche not found for deletion");
      return NextResponse.json(
        { message: "Fiche patient non trouvée" },
        { status: 404 }
      );
    }

    await prisma.fichePatient.delete({
      where: { etudiantId }, // Use etudiantId directly as it's unique
    });

    console.log("Controller: Fiche patient deleted successfully");
    return NextResponse.json(
      { message: "Fiche patient supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Controller Error deleting fiche patient:", error);
    // Handle potential foreign key constraints or other deletion errors
    return NextResponse.json(
      {
        message: "Erreur serveur lors de la suppression",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};
