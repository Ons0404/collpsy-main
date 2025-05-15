// app/(mvc)/controllers/evaluationController.ts
import { NextRequest, NextResponse } from "next/server";
import evaluationService from "../services/evaluationService";
import { PrismaClient } from "@prisma/client";
export class EvaluationController {
  static async createEvaluation(request: NextRequest) {
    try {
      const body = await request.json();

      const {
        consultationId,
        etudiantId,
        satisfaction,
        empathie,
        ecoute,
        comprehension,
        recommandation,
        commentaires,
      } = body;

      if (!consultationId || !etudiantId || satisfaction === undefined) {
        return NextResponse.json(
          { error: "Champs obligatoires manquants" },
          { status: 400 }
        );
      }

      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
      });
      if (!consultation) {
        return NextResponse.json(
          { error: `Consultation avec l'ID ${consultationId} non trouvée` },
          { status: 404 }
        );
      }

      const etudiant = await prisma.etudiant.findUnique({
        where: { id_etudiant: etudiantId },
      });
      if (!etudiant) {
        return NextResponse.json(
          { error: `Étudiant avec l'ID ${etudiantId} non trouvé` },
          { status: 404 }
        );
      }

      const evaluation = await evaluationService.createEvaluation({
        consultationId,
        etudiantId,
        satisfaction,
        empathie,
        ecoute,
        comprehension,
        recommandation,
        commentaires,
      });

      return NextResponse.json(
        { message: "Évaluation créée avec succès", evaluation },
        { status: 201 }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Erreur dans createEvaluation:", error);
      return NextResponse.json(
        {
          error: "Échec de la création de l'évaluation",
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  }

  static async getEvaluationsByPsychologue(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const psychologueId = Number(searchParams.get("psychologueId")); // Convert string to number here

      if (!psychologueId || isNaN(psychologueId)) {
        return NextResponse.json(
          { error: "psychologueId est requis et doit être un nombre valide" },
          { status: 400 }
        );
      }

      const evaluations = await prisma.evaluation.findMany({
        where: {
          consultation: {
            psychologueId: psychologueId, // Now it's a number
          },
        },
        include: {
          etudiant: {
            include: {
              utilisateur: {
                select: { prenom: true, nom: true },
              },
            },
          },
          consultation: {
            select: { startTime: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(evaluations);
    } catch (error) {
      console.error("Erreur lors de la récupération des évaluations:", error);
      return NextResponse.json(
        { error: "Erreur interne du serveur" },
        { status: 500 }
      );
    }
  }
}
const prisma = new PrismaClient();

// Handler for POST /api/evaluation
export const createEvaluation = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      consultationId,
      etudiantId,
      satisfaction,
      empathie,
      ecoute,
      comprehension,
      recommandation,
      commentaires,
    } = body;

    // Validate input
    if (!consultationId || !etudiantId || satisfaction === undefined) {
      return NextResponse.json(
        { error: "consultationId, etudiantId, et satisfaction sont requis" },
        { status: 400 }
      );
    }

    const consultationIdNum = Number(consultationId);
    const etudiantIdNum = Number(etudiantId);
    if (isNaN(consultationIdNum) || isNaN(etudiantIdNum)) {
      return NextResponse.json(
        {
          error:
            "consultationId et etudiantId doivent être des nombres valides",
        },
        { status: 400 }
      );
    }

    // Check if consultation exists
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationIdNum },
    });
    if (!consultation) {
      return NextResponse.json(
        { error: `Consultation avec l\'ID ${consultationIdNum} non trouvée` },
        { status: 404 }
      );
    }

    // Create evaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        consultationId: consultationIdNum,
        etudiantId: etudiantIdNum,
        satisfaction,
        empathie,
        ecoute,
        comprehension,
        recommandation,
        commentaires,
      },
    });

    // Format response (Consider fetching related data if needed for frontend)
    const formattedEvaluation = {
      ...evaluation,
      // Example: Fetch etudiant data if needed
      // etudiant: await prisma.etudiant.findUnique({ where: { id: etudiantIdNum }, select: { prenom: true, nom: true } }),
      // consultation: { startTime: consultation.startTime.toISOString() },
    };

    return NextResponse.json(formattedEvaluation, { status: 201 });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'évaluation" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for GET /api/evaluation?psychologueId=...
export const getEvaluationsByPsychologue = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const psychologueId = searchParams.get("psychologueId");

    if (!psychologueId) {
      return NextResponse.json(
        { error: "Le paramètre psychologueId est requis" },
        { status: 400 }
      );
    }

    const psychologueIdNum = Number(psychologueId);
    if (isNaN(psychologueIdNum) || psychologueIdNum <= 0) {
      return NextResponse.json(
        { error: "psychologueId doit être un nombre valide" },
        { status: 400 }
      );
    }

    const evaluations = await prisma.evaluation.findMany({
      where: {
        consultation: {
          psychologueId: psychologueIdNum,
        },
      },
      include: {
        consultation: {
          select: {
            id: true,
            rendezVousId: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        },
        etudiant: {
          include: {
            utilisateur: {
              select: {
                prenom: true,
                nom: true,
              },
            },
          },
        },
      },
    });

    if (!evaluations.length) {
      // Returning empty array might be better than 404 for lists
      return NextResponse.json([], { status: 200 });
      // return NextResponse.json(
      //   { message: "Aucune évaluation trouvée pour ce psychologue" },
      //   { status: 404 }
      // );
    }

    // Format evaluations
    const formattedEvaluations = evaluations.map((evaluation) => ({
      ...evaluation,
      etudiant: {
        prenom: evaluation.etudiant.utilisateur?.prenom || "Inconnu",
        nom: evaluation.etudiant.utilisateur?.nom || "Inconnu",
      },
      // Remove nested etudiant object if not needed
      // etudiant: undefined,
    }));

    return NextResponse.json(formattedEvaluations, { status: 200 });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des évaluations" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Placeholder for GET /api/evaluation/[consultationId]
export const getEvaluationByConsultationId = async (
  request: NextRequest,
  { params }: { params: { consultationId: string } }
) => {
  // Logic for fetching evaluation by consultationId will be added here
  return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
};

