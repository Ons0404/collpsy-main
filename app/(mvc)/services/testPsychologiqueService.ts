import { PrismaClient } from "@prisma/client";
import {
  TestPsychologique,
  ResultatTest,
  ReponseUtilisateur,
  Question,
  OptionReponse,
  CategorieTest,
  TypeQuestion,
} from "../types/test-psychologique";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function saveTestResult(
  data: ResultatTest
): Promise<ResultatTest> {
  try {
    if (!data.testId || !data.etudiantId || !data.reponses) {
      throw new Error("Données manquantes pour enregistrer le résultat");
    }

    return await prisma.$transaction(async (tx) => {
      const resultat = await tx.resultatTest.create({
        data: {
          testId: data.testId,
          etudiantId: data.etudiantId,
          score: data.score,
          interpretation: data.interpretation || null,
          datePassation: new Date(),
        },
      });

      const reponsesCreees = await Promise.all(
        data.reponses.map((reponse: ReponseUtilisateur) => {
          if (!reponse.questionId) {
            throw new Error("ID de question manquant dans une réponse");
          }

          return tx.reponseUtilisateur.create({
            data: {
              resultatId: resultat.id,
              questionId: reponse.questionId,
              optionId: reponse.optionId || null,
              texteLibre: reponse.texteLibre || null,
            },
          });
        })
      );

      return {
        ...resultat,
        reponses: reponsesCreees.map((r) => ({
          questionId: r.questionId,
          optionId: r.optionId ?? undefined,
          texteLibre: r.texteLibre ?? undefined,
        })),
      };
    });
  } catch (error) {
    console.error("Erreur dans saveTestResult:", error);
    throw error;
  }
}

export function evaluateTest(
  reponses: ReponseUtilisateur[],
  questions: Question[],
  category: CategorieTest
): { score: number; interpretation: string } {
  const score = reponses.reduce((total, reponse) => {
    if (!reponse.optionId) return total;

    const question = questions.find((q) => q.id === reponse.questionId);
    const option = question?.optionsReponse.find(
      (opt) => opt.id === reponse.optionId
    );

    return total + (option?.valeur || 0);
  }, 0);

  const interpretation = getInterpretation(score, category);

  return { score, interpretation };
}

function getInterpretation(score: number, category: CategorieTest): string {
  switch (category) {
    case CategorieTest.ANXIETE:
      if (score >= 15) return "Anxiété sévère";
      if (score >= 10) return "Anxiété modérée";
      if (score >= 5) return "Anxiété légère";
      return "Anxiété minimale";

    case CategorieTest.DEPRESSION:
      if (score >= 20) return "Dépression sévère";
      if (score >= 15) return "Dépression modérément sévère";
      if (score >= 10) return "Dépression modérée";
      if (score >= 5) return "Dépression légère";
      return "Dépression minimale ou absente";

    case CategorieTest.TDAH:
      if (score >= 24) return "TDAH probable";
      if (score >= 17) return "TDAH possible";
      return "TDAH peu probable";

    case CategorieTest.BIEN_ETRE:
      if (score >= 24) return "Bien-être élevé";
      if (score >= 16) return "Bien-être modéré";
      if (score >= 8) return "Bien-être faible";
      return "Bien-être très faible";

    case CategorieTest.ORIENTATION_PROFESSIONNELLE:
      // Pour ce test, le score pourrait être interprété différemment selon les domaines
      // Ici, une interprétation générique basée sur le score total
      if (score >= 30) return "Forte orientation professionnelle identifiée";
      if (score >= 20) return "Orientation professionnelle modérée";
      if (score >= 10) return "Orientation professionnelle faible";
      return "Aucune orientation claire";

    default:
      return `Score: ${score} - Interprétation non spécifiée`;
  }
}

export function evaluateAnxietyTest(
  reponses: ReponseUtilisateur[],
  questions: Question[]
): { score: number; interpretation: string } {
  return evaluateTest(reponses, questions, CategorieTest.ANXIETE);
}

export function evaluateDepressionTest(
  reponses: ReponseUtilisateur[],
  questions: Question[]
): { score: number; interpretation: string } {
  return evaluateTest(reponses, questions, CategorieTest.DEPRESSION);
}

export function evaluateTDAHTest(
  reponses: ReponseUtilisateur[],
  questions: Question[]
): { score: number; interpretation: string } {
  return evaluateTest(reponses, questions, CategorieTest.TDAH);
}

export function evaluateWellBeingTest(
  reponses: ReponseUtilisateur[],
  questions: Question[]
): { score: number; interpretation: string } {
  return evaluateTest(reponses, questions, CategorieTest.BIEN_ETRE);
}

export function evaluateProfessionalOrientationTest(
  reponses: ReponseUtilisateur[],
  questions: Question[]
): { score: number; interpretation: string } {
  return evaluateTest(
    reponses,
    questions,
    CategorieTest.ORIENTATION_PROFESSIONNELLE
  );
}

export async function getTestById(
  id: string
): Promise<TestPsychologique | null> {
  const test = await prisma.testPsychologique.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          optionsReponse: true,
        },
        orderBy: {
          ordre: "asc",
        },
      },
    },
  });

  if (!test) return null;

  return {
    id: test.id,
    titre: test.titre,
    description: test.description ?? undefined,
    categorie: test.categorie as CategorieTest,
    questions: test.questions.map((q) => ({
      id: q.id,
      testId: q.testId,
      texte: q.texte,
      ordre: q.ordre,
      type: q.type as TypeQuestion,
      optionsReponse: q.optionsReponse,
    })),
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
    dureeEstimee: test.dureeEstimee,
  };
}

export async function getTestResultsByStudent(
  etudiantId: number
): Promise<
  Array<
    Omit<ResultatTest, "test"> & { test: Omit<TestPsychologique, "questions"> }
  >
> {
  const resultats = await prisma.resultatTest.findMany({
    where: { etudiantId },
    include: {
      test: true,
      reponses: {
        include: {
          question: {
            include: {
              optionsReponse: true,
            },
          },
          option: true,
        },
      },
    },
    orderBy: {
      datePassation: "desc",
    },
  });

  return resultats.map((r) => ({
    id: r.id,
    testId: r.testId,
    etudiantId: r.etudiantId,
    score: r.score,
    interpretation: r.interpretation ?? undefined,
    datePassation: r.datePassation,
    reponses: r.reponses.map((res) => ({
      questionId: res.questionId,
      optionId: res.optionId ?? undefined,
      texteLibre: res.texteLibre ?? undefined,
      question: {
        id: res.question.id,
        testId: res.question.testId,
        texte: res.question.texte,
        ordre: res.question.ordre,
        type: res.question.type as TypeQuestion,
        optionsReponse: res.question.optionsReponse,
      },
      option: res.option
        ? {
            id: res.option.id,
            questionId: res.option.questionId,
            texte: res.option.texte,
            valeur: res.option.valeur,
          }
        : undefined,
    })),
    test: {
      id: r.test.id,
      titre: r.test.titre,
      description: r.test.description ?? undefined,
      categorie: r.test.categorie as CategorieTest,
      createdAt: r.test.createdAt,
      updatedAt: r.test.updatedAt,
      dureeEstimee: r.test.dureeEstimee,
    },
  }));
}

export async function getAllTests(): Promise<TestPsychologique[]> {
  const tests = await prisma.testPsychologique.findMany({
    include: {
      questions: {
        include: {
          optionsReponse: true,
        },
        orderBy: {
          ordre: "asc",
        },
      },
    },
  });

  return tests.map((test) => ({
    id: test.id,
    titre: test.titre,
    description: test.description ?? undefined,
    categorie: test.categorie as CategorieTest,
    questions: test.questions.map((question) => ({
      id: question.id,
      testId: question.testId,
      texte: question.texte,
      ordre: question.ordre,
      type: question.type as TypeQuestion,
      optionsReponse: question.optionsReponse,
    })),
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
    dureeEstimee: test.dureeEstimee,
  }));
}

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const etudiantId = parseInt(params.id);

    if (isNaN(etudiantId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const resultats = await getTestResultsByStudent(etudiantId);
    return NextResponse.json(resultats);
  } catch (error) {
    console.error("Error fetching student test results:", error);
    return NextResponse.json(
      { error: "Failed to fetch student test results" },
      { status: 500 }
    );
  }
}
