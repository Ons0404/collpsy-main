// /home/ubuntu/collpsy_mvc_project/app/controllers/tests/testController.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client"; // Import Prisma
// Assuming service functions exist and are correctly located
import {
  getAllTests,
  getTestById, // Service function to get a test by ID
  // Removed unused/missing imports: submitTestResult, createResultatTest, getResultatById, getResultatsByEtudiantId, updateResultatTest
} from "../../(mvc)/services/testPsychologiqueService"; // Adjust path as needed

const prisma = new PrismaClient(); // Centralize Prisma Client if possible

// Define type for MBTI dichotomies
type Dichotomy = "E_I" | "S_N" | "T_F" | "J_P";

// Define type for OptionReponse (assuming structure based on usage)
interface OptionReponse {
  id: string;
  valeur: number;
  texte: string;
}

// Helper function to calculate MBTI personality type (moved from route.ts)
function calculateMBTIPersonality(
  reponses: { questionId: string; optionId: string }[],
  options: OptionReponse[]
) {
  // Map questions to MBTI dichotomies (ensure this mapping is correct and complete)
  const questionDichotomyMap: { [key: string]: Dichotomy } = {
    "mbti-q1": "E_I", // "Je préfère passer du temps avec un grand groupe" → E (high score) vs. I (low score)
    "mbti-q2": "J_P", // "Je préfère suivre un plan établi" → J (high score) vs. P (low score)
    "mbti-q3": "T_F", // "Je prends mes décisions en fonction de mes émotions" → F (high score) vs. T (low score)
    "mbti-q4": "J_P", // "Je préfère garder mes options ouvertes" → P (high score) vs. J (low score)
    "mbti-q5": "S_N", // "Je m\"intéresse plus aux faits concrets" → S (high score) vs. N (low score)
    // Add mappings for all MBTI questions
  };

  // Initialize scores and counts for each dichotomy
  const scores: { [key in Dichotomy]: number } = {
    E_I: 0,
    S_N: 0,
    T_F: 0,
    J_P: 0,
  };
  const counts: { [key in Dichotomy]: number } = {
    E_I: 0,
    S_N: 0,
    T_F: 0,
    J_P: 0,
  };

  // Calculate scores based on responses
  for (const reponse of reponses) {
    const dichotomy = questionDichotomyMap[reponse.questionId];
    if (!dichotomy) continue;

    const option = options.find((opt) => opt.id === reponse.optionId);
    if (option) {
      scores[dichotomy] += option.valeur;
      counts[dichotomy] += 1;
    }
  }

  // Determine dominant traits (adjust threshold/logic as needed)
  const dichotomies: { [key in Dichotomy]: string } = {
    E_I: "",
    S_N: "",
    T_F: "",
    J_P: "",
  };
  const threshold = 3; // Example threshold, adjust based on scoring system

  const eiAvg = counts.E_I > 0 ? scores.E_I / counts.E_I : threshold;
  dichotomies.E_I = eiAvg >= threshold ? "Extraversion" : "Introversion";

  const snAvg = counts.S_N > 0 ? scores.S_N / counts.S_N : threshold;
  dichotomies.S_N = snAvg >= threshold ? "Sensing" : "Intuition";

  const tfAvg = counts.T_F > 0 ? scores.T_F / counts.T_F : threshold;
  dichotomies.T_F = tfAvg >= threshold ? "Feeling" : "Thinking"; // Note: Original logic was F for high score

  const jpAvg = counts.J_P > 0 ? scores.J_P / counts.J_P : threshold;
  dichotomies.J_P = jpAvg >= threshold ? "Judging" : "Perceiving"; // Note: Original logic was J for high score

  // Construct personality type (e.g., INTJ)
  const personalityType =
    (dichotomies.E_I === "Extraversion" ? "E" : "I") +
    (dichotomies.S_N === "Sensing" ? "S" : "N") +
    (dichotomies.T_F === "Thinking" ? "T" : "F") + // Adjusted based on common MBTI notation
    (dichotomies.J_P === "Judging" ? "J" : "P");

  return { personalityType, dichotomies };
}

// Handler for GET /api/tests
export const getAllTestsHandler = async (req: NextRequest) => {
  try {
    // Consider adding authorization/authentication checks if needed
    const tests = await getAllTests(); // Use service function

    // Basic validation
    if (!Array.isArray(tests)) {
      console.error(
        "Controller Error: getAllTests did not return an array:",
        tests
      );
      return NextResponse.json(
        { error: "Format de données invalide retourné par le serveur" },
        { status: 500 }
      );
    }

    return NextResponse.json(tests, { status: 200 });
  } catch (error) {
    console.error("Controller Error fetching tests:", error);
    return NextResponse.json(
      { error: "Échec de la récupération des tests" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for GET /api/tests/[testId]
export const getTestByIdHandler = async (
  request: NextRequest, // Changed from Request to NextRequest
  { params }: { params: { testId: string } }
) => {
  try {
    const testId = params.testId;
    // Vérifier que le testId est valide
    if (!testId) {
      return NextResponse.json({ error: "ID de test requis" }, { status: 400 });
    }

    // Consider adding authorization checks

    // Use the service function to get the test
    const test = await getTestById(testId);

    if (!test) {
      return NextResponse.json({ error: "Test non trouvé" }, { status: 404 });
    }

    return NextResponse.json(test, { status: 200 });
  } catch (error) {
    console.error(`Controller Error fetching test ${params.testId}:`, error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du test" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for POST /api/tests/[testId]/submit
export const submitTestHandler = async (
  request: NextRequest, // Changed from Request to NextRequest
  { params }: { params: { testId: string } }
) => {
  try {
    const { etudiantId, reponses } = await request.json();
    const testId = params.testId;

    // Validate input
    if (!etudiantId || isNaN(parseInt(etudiantId))) {
      return NextResponse.json(
        { error: "ID étudiant invalide" },
        { status: 400 }
      );
    }
    const etudiantIdNum = parseInt(etudiantId);

    if (!Array.isArray(reponses) || reponses.length === 0) {
      return NextResponse.json(
        { error: "Réponses invalides ou absentes" },
        { status: 400 }
      );
    }
    if (!testId) {
      return NextResponse.json(
        { error: "ID de test manquant" },
        { status: 400 }
      );
    }

    // Verify test exists using Prisma directly (or use getTestById service function)
    const test = await prisma.testPsychologique.findUnique({
      where: { id: testId },
      include: { questions: { include: { optionsReponse: true } } },
    });
    if (!test) {
      return NextResponse.json({ error: "Test non trouvé" }, { status: 404 });
    }

    // Validate responses against test questions
    const questionIds = test.questions.map((q) => q.id);
    const invalidResponses = reponses.filter(
      (r: { questionId: string; optionId: string }) =>
        !questionIds.includes(r.questionId) || !r.optionId
    );
    if (invalidResponses.length > 0) {
      return NextResponse.json(
        { error: "Certaines réponses sont invalides" },
        { status: 400 }
      );
    }

    // Calculate score
    let score = 0;
    const allOptions = test.questions.flatMap((q) => q.optionsReponse);
    for (const reponse of reponses) {
      const option = allOptions.find((opt) => opt.id === reponse.optionId);
      if (option) {
        score += option.valeur;
      }
    }

    // Calculate test-specific results and interpretation
    let results: any = {};
    let interpretation = "";

    if (testId === "mbti-test") {
      // Use test.id or a specific identifier
      const mbtiResults = calculateMBTIPersonality(reponses, allOptions);
      results = {
        personalityType: mbtiResults.personalityType,
        dichotomies: mbtiResults.dichotomies,
      };
      interpretation = `Votre type de personnalité est ${mbtiResults.personalityType}. Basé sur vos réponses, vos préférences sont : ${mbtiResults.dichotomies.E_I}, ${mbtiResults.dichotomies.S_N}, ${mbtiResults.dichotomies.T_F}, ${mbtiResults.dichotomies.J_P}.`;
    } else if (testId === "test_anx_001") {
      // Anxiety test: Sum of Likert scale (0-3 per question, 10 questions, max 30)
      results = { anxietyScore: score };
      if (score <= 4) {
        interpretation = `Score: ${score}/30. Anxiété minime ou inexistante.`;
      } else if (score <= 9) {
        interpretation = `Score: ${score}/30. Anxiété légère.`;
      } else if (score <= 14) {
        interpretation = `Score: ${score}/30. Anxiété modérée.`;
      } else {
        interpretation = `Score: ${score}/30. Anxiété sévère, une évaluation professionnelle est recommandée.`;
      }
    } else if (testId === "test_dep_001") {
      // Depression test: Sum of intensity scale (0-3 per question)
      results = { depressionScore: score };
      if (score <= 13) {
        interpretation = `Score: ${score}. Dépression minime.`;
      } else if (score <= 19) {
        interpretation = `Score: ${score}. Dépression légère.`;
      } else if (score <= 28) {
        interpretation = `Score: ${score}. Dépression modérée.`;
      } else {
        interpretation = `Score: ${score}. Dépression sévère, une consultation professionnelle est fortement recommandée.`;
      }
    } else if (testId === "test_str_001") {
      // Stress test: Sum of frequency scale (0-4 per question)
      results = { stressScore: score };
      if (score <= 13) {
        interpretation = `Score: ${score}. Stress faible.`;
      } else if (score <= 26) {
        interpretation = `Score: ${score}. Stress modéré.`;
      } else {
        interpretation = `Score: ${score}. Stress élevé, des stratégies de gestion du stress sont recommandées.`;
      }
    } else if (testId === "test_per_001") {
      // Big Five test: Calculate scores for each trait
      const traitScores = {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
      };
      const traitCounts = {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
      };
      const questionTraitMap: { [key: string]: keyof typeof traitScores } = {
        // Example mapping, adjust based on actual questions
        per_q01: "openness",
        // Add mappings for all Big Five questions
      };
      for (const reponse of reponses) {
        const trait = questionTraitMap[reponse.questionId];
        if (trait) {
          const option = allOptions.find((opt) => opt.id === reponse.optionId);
          if (option) {
            traitScores[trait] += option.valeur;
            traitCounts[trait] += 1;
          }
        }
      }
      // Normalize scores (example: average per trait)
      results = {
        openness:
          traitCounts.openness > 0
            ? traitScores.openness / traitCounts.openness
            : 0,
        conscientiousness:
          traitCounts.conscientiousness > 0
            ? traitScores.conscientiousness / traitCounts.conscientiousness
            : 0,
        extraversion:
          traitCounts.extraversion > 0
            ? traitScores.extraversion / traitCounts.extraversion
            : 0,
        agreeableness:
          traitCounts.agreeableness > 0
            ? traitScores.agreeableness / traitCounts.agreeableness
            : 0,
        neuroticism:
          traitCounts.neuroticism > 0
            ? traitScores.neuroticism / traitCounts.neuroticism
            : 0,
      };
      interpretation = `Scores Big Five : Ouverture (${results.openness.toFixed(
        1
      )}), Conscienciosité (${results.conscientiousness.toFixed(
        1
      )}), Extraversion (${results.extraversion.toFixed(
        1
      )}), Agréabilité (${results.agreeableness.toFixed(
        1
      )}), Neuroticisme (${results.neuroticism.toFixed(1)}).`;
    } else if (testId === "test_car_001") {
      // Career Interests: Sum of interest scale (1-5 per question)
      results = { careerInterestScore: score };
      interpretation = `Score: ${score}. Vos intérêts suggèrent une inclination vers des carrières dans [INSÉRER SUGGESTIONS BASÉES SUR RÉPONSES].`;
    } else if (testId === "test_app_001") {
      // Learning Styles: Sum of agreement scale
      results = { learningStyleScore: score };
      interpretation = `Score: ${score}. Votre style d'apprentissage dominant est [INSÉRER STYLE BASÉ SUR RÉPONSES].`;
    } else if (testId === "test_tda_001") {
      // ADHD test: Sum of frequency scale (0-4 per question)
      results = { adhdScore: score };
      if (score <= 20) {
        interpretation = `Score: ${score}. Symptômes de TDAH minimes.`;
      } else {
        interpretation = `Score: ${score}. Symptômes de TDAH significatifs, une évaluation professionnelle est recommandée.`;
      }
    } else if (testId === "test_bie_001") {
      // Well-being: Sum of agreement scale (1-5 per question)
      results = { wellbeingScore: score };
      if (score >= 48) {
        interpretation = `Score: ${score}. Niveau élevé de bien-être psychologique.`;
      } else if (score >= 36) {
        interpretation = `Score: ${score}. Niveau modéré de bien-être psychologique.`;
      } else {
        interpretation = `Score: ${score}. Niveau faible de bien-être, des interventions pourraient être bénéfiques.`;
      }
    } else {
      interpretation = `Score total pour le test ${test.titre}: ${score}.`; // Default interpretation
    }

    // --- Database Operations ---
    // It might be better to wrap these in a transaction
    // await prisma.$transaction(async (tx) => { ... });

    // Create Rapport
    const rapport = await prisma.rapport.create({
      data: {
        etudiantId: etudiantIdNum,
        // psychologueId: ??? // Need to determine the psychologist, maybe from session or context
        titre: `Résultats du test ${test.titre} pour étudiant ${etudiantIdNum}`,
        description: `Résultats du test "${
          test.titre
        }" soumis le ${new Date().toLocaleDateString("fr-FR")}`,
        // Store detailed results in a structured way if possible, or JSON in commentaires
        commentaires: JSON.stringify(results),
      },
    });

    // Create ResultatTest
    const resultatTest = await prisma.resultatTest.create({
      data: {
        testId: test.id,
        etudiantId: etudiantIdNum,
        score,
        interpretation,
        rapportId: rapport.id, // Link to the created rapport
        // datePassation is handled by default value in schema or set here
      },
    });

    // Create ReponseUtilisateur records
    const reponseUtilisateurData = reponses.map(
      (reponse: { questionId: string; optionId: string }) => ({
        resultatId: resultatTest.id,
        questionId: reponse.questionId,
        optionId: reponse.optionId,
      })
    );
    await prisma.reponseUtilisateur.createMany({
      data: reponseUtilisateurData,
    });

    // Create RapportEntry (optional, depends on requirements)
    await prisma.rapportEntry.create({
      data: {
        rapportId: rapport.id,
        dateconsultation: new Date(),
        resume: `Test "${test.titre}" soumis par étudiant ${etudiantIdNum}.`,
        observations: `Score: ${score}\nInterprétation: ${interpretation}`,
      },
    });

    // Return detailed response
    return NextResponse.json(
      {
        message: "Test soumis avec succès",
        resultatId: resultatTest.id,
        rapportId: rapport.id,
        score,
        interpretation,
        results, // Include detailed results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Controller Error submitting test ${params.testId}:`, error);
    return NextResponse.json(
      {
        error: "Échec de la soumission du test",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Disconnect after operation
  }
};

// Handler for POST /api/tests/resultats
export const createResultatTestHandler = async (request: NextRequest) => {
  try {
    const data = await request.json();

    // Validation approfondie
    if (!data.testId || !data.etudiantId) {
      return NextResponse.json(
        { error: "testId et etudiantId sont requis" },
        { status: 400 }
      );
    }
    const etudiantIdNum = Number(data.etudiantId);
    if (isNaN(etudiantIdNum)) {
      return NextResponse.json(
        { error: "etudiantId doit être un nombre valide" },
        { status: 400 }
      );
    }

    if (typeof data.score !== "number") {
      return NextResponse.json(
        { error: "Le score doit être un nombre" },
        { status: 400 }
      );
    }

    // Vérification de l'existence des entités référencées
    const [testExists, etudiantExists] = await Promise.all([
      prisma.testPsychologique.findUnique({
        where: { id: data.testId },
      }),
      prisma.etudiant.findUnique({
        where: {
          id_etudiant: etudiantIdNum, // Ensure 'id_etudiant' is correct per your schema
        },
      }),
    ]);

    if (!testExists) {
      return NextResponse.json(
        { error: `Test avec ID ${data.testId} non trouvé` },
        { status: 404 }
      );
    }

    if (!etudiantExists) {
      return NextResponse.json(
        { error: `Étudiant avec ID ${etudiantIdNum} non trouvé` },
        { status: 404 }
      );
    }

    // Vérification des questions/options référencées si des réponses sont fournies
    if (data.reponses && Array.isArray(data.reponses)) {
      // Add validation logic for questionIds and optionIds if necessary
      // This might involve fetching questions/options and checking existence
    }

    // Données pour la création du résultat
    const resultatData: Prisma.ResultatTestCreateInput = {
      test: {
        connect: {
          id: data.testId,
        },
      },
      etudiant: {
        connect: {
          id_etudiant: etudiantIdNum, // Ensure 'id_etudiant' is correct
        },
      },
      score: data.score,
      interpretation: data.interpretation || "Non spécifié",
      datePassation: data.datePassation
        ? new Date(data.datePassation)
        : new Date(), // Use provided date or now
      // Include rapportId if provided and valid
      ...(data.rapportId && { rapport: { connect: { id: data.rapportId } } }),
      // Include reponses if provided
      reponses:
        data.reponses && data.reponses.length > 0
          ? {
              createMany: {
                data: data.reponses.map(
                  (reponse: {
                    questionId: string;
                    optionId?: string;
                    texteLibre?: string;
                  }) => ({
                    questionId: reponse.questionId,
                    optionId: reponse.optionId || null,
                    texteLibre: reponse.texteLibre || null,
                  })
                ),
              },
            }
          : undefined,
    };

    // Création du résultat (peut être dans une transaction si nécessaire)
    const result = await prisma.resultatTest.create({
      data: resultatData,
      include: {
        reponses: true, // Include created responses in the result
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Controller Error creating test result:", error);
    // Handle potential Prisma errors (e.g., foreign key constraint)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        // Foreign key constraint failed
        return NextResponse.json(
          { error: "ID de rapport, test ou étudiant invalide" },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      {
        error: "Erreur lors de la création du résultat du test",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Disconnect after operation
  }
};
