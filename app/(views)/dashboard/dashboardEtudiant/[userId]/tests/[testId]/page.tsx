"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Question {
  id: string;
  texte: string;
  type: string;
  optionsReponse: { id: string; texte: string; valeur: number }[];
}

interface Test {
  id: string;
  titre: string;
  description?: string;
  questions: Question[];
}

export default function TestPage({
  params,
}: {
  params: { userId: string; testId: string };
}) {
  const [test, setTest] = useState<Test | null>(null);
  const [reponses, setReponses] = useState<
    { questionId: string; optionId: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  console.log("TestPage params:", params);

  // Fetch test data on mount
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/tests/${params.testId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Erreur lors de la récupération du test"
          );
        }

        setTest(data);

        // Initialize reponses with empty values for each question
        const initialReponses = data.questions.map((question: Question) => ({
          questionId: question.id,
          optionId: "",
        }));
        setReponses(initialReponses);
      } catch (error) {
        console.error("Erreur lors de la récupération du test:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération du test"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [params.testId]);

  // Update progress when reponses change
  useEffect(() => {
    if (!test) return;

    const answeredCount = reponses.filter((r) => r.optionId !== "").length;
    const newProgress = Math.round(
      (answeredCount / test.questions.length) * 100
    );
    setProgress(newProgress);
  }, [reponses, test]);

  // Handle option selection for a question
  const handleOptionChange = (questionId: string, optionId: string) => {
    setReponses((prevReponses) =>
      prevReponses.map((reponse) =>
        reponse.questionId === questionId ? { ...reponse, optionId } : reponse
      )
    );
  };

  // Navigate to next or previous question
  const navigateQuestion = (direction: "next" | "prev") => {
    if (
      direction === "next" &&
      currentQuestionIndex < (test?.questions.length || 0) - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (direction === "prev" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Jump to a specific question
  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Submit the test
  const submitTest = async () => {
    try {
      setSubmitting(true);

      // Validate that all questions have been answered
      const unansweredQuestions = reponses.filter(
        (reponse) => !reponse.optionId
      );
      if (unansweredQuestions.length > 0) {
        throw new Error(
          "Veuillez répondre à toutes les questions avant de soumettre."
        );
      }

      const etudiantId = parseInt(params.userId);
      console.log("etudiantId:", etudiantId);

      if (isNaN(etudiantId)) {
        throw new Error(
          "ID d'étudiant invalide dans les paramètres de la page"
        );
      }

      const payload = {
        etudiantId,
        reponses,
      };

      const response = await fetch(`/api/tests/${params.testId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erreur API:", data);
        throw new Error(
          `Échec de la soumission du test: ${data.details || data.error}`
        );
      }

      // Check if rapportId is present in the response
      if (!data.rapportId) {
        throw new Error(
          "Rapport non trouvé dans la réponse. Veuillez réessayer ou contacter le support."
        );
      }

      toast.success("Test soumis avec succès !");

      // Attempt to redirect to the results page
      try {
        console.log(
          "Redirecting to:",
          `/dashboard/dashboardEtudiant/${etudiantId}/results/${data.rapportId}`
        );
        await router.push(
          `/dashboard/dashboardEtudiant/${etudiantId}/results/${data.rapportId}`
        );
      } catch (redirectError) {
        console.error("Erreur lors de la redirection:", redirectError);
        toast.error(
          "Erreur lors de la redirection vers les résultats. Redirection vers les tests..."
        );
        // Redirect back to tests page if the redirect fails
        setTimeout(() => {
          router.push(`/dashboard/dashboardEtudiant/${etudiantId}/tests`);
        }, 3000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la soumission"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18.001 0A9 9 0 0121 12z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Erreur</h2>
          <p className="text-center text-gray-600">
            Test non trouvé. Veuillez vérifier l'URL ou contacter le support.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const currentResponse = reponses.find(
    (r) => r.questionId === currentQuestion.id
  );
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <span className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                ></path>
              </svg>
            </span>
            {test.titre}
          </h1>
          {test.description && (
            <p className="text-gray-600 ml-12">{test.description}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progression
            </span>
            <span className="text-sm font-medium text-blue-600">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question navigator */}
          <div className="mt-4 flex flex-wrap gap-2">
            {test.questions.map((q, idx) => {
              const isAnswered =
                reponses.find((r) => r.questionId === q.id)?.optionId !== "";
              const isCurrent = currentQuestionIndex === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={`w-8 h-8 rounded-full text-sm flex items-center justify-center font-medium transition-all
                    ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : isAnswered
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div key={currentQuestion.id} className="mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white text-xl font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                {currentQuestionIndex + 1}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {currentQuestion.texte}
              </h2>
            </div>

            <div className="space-y-3 pl-14">
              {currentQuestion.optionsReponse.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all
                    ${
                      currentResponse?.optionId === option.id
                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-300"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={currentResponse?.optionId === option.id}
                    onChange={() =>
                      handleOptionChange(currentQuestion.id, option.id)
                    }
                    className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{option.texte}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigateQuestion("prev")}
              disabled={isFirstQuestion}
              className={`px-4 py-2 rounded-lg font-medium flex items-center
                ${
                  isFirstQuestion
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              Question précédente
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={submitTest}
                disabled={submitting || progress < 100}
                className={`px-6 py-2 rounded-lg font-semibold flex items-center
                  ${
                    submitting || progress < 100
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Soumission...
                  </>
                ) : (
                  <>
                    Terminer le test
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateQuestion("next")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
              >
                Question suivante
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Submit button (always visible as fixed footer) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-4 bg-gray-200 rounded-full mr-3">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {progress}% complété
              </span>
            </div>

            <button
              type="button"
              onClick={submitTest}
              disabled={submitting || progress < 100}
              className={`px-6 py-2 rounded-lg font-semibold
                ${
                  submitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : progress < 100
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              {submitting
                ? "Soumission en cours..."
                : progress < 100
                ? `Répondez à toutes les questions (${
                    test.questions.length -
                    reponses.filter((r) => r.optionId !== "").length
                  } restantes)`
                : "Soumettre le test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
