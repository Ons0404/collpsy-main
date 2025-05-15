import prisma from "../lib/prisma";

interface EvaluationData {
  consultationId: number;
  etudiantId: number;
  satisfaction: number;
  empathie?: number;
  ecoute?: number;
  comprehension?: number;
  recommandation?: number;
  commentaires?: string;
}

const evaluationService = {
  createEvaluation: async (data: EvaluationData) => {
    return await prisma.evaluation.create({
      data: {
        consultationId: data.consultationId,
        etudiantId: data.etudiantId,
        satisfaction: data.satisfaction,
        empathie: data.empathie,
        ecoute: data.ecoute,
        comprehension: data.comprehension,
        recommandation: data.recommandation,
        commentaires: data.commentaires,
      },
    });
  },

  getEvaluationByConsultationId: async (consultationId: number) => {
    return await prisma.evaluation.findFirst({
      where: { consultationId },
      include: {
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
        consultation: {
          select: { startTime: true },
        },
      },
    });
  },
};

export default evaluationService;
