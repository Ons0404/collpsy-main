"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation"; // Ajout pour récupérer les paramètres d'URL

export default function SlimenChatbot() {
  const router = useRouter();
  const params = useParams(); // Récupère les paramètres d'URL
  const userId = params.userId; // Récupère l'ID utilisateur de l'URL

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "user",
      content: "Bonjour", // Placeholder user message to satisfy API requirement
    },
    {
      role: "assistant",
      content:
        "Bonjour, je suis Slimen Labyedh, grand frère de Sboubi. Professeur et psychothérapeute. Comment puis-je vous aider aujourd'hui?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Add proper type definition for the ref

  // Clé API intégrée
  const API_KEY = "AIzaSyB9w3yyehejH-9ECz9sI7-1FPGf4hrjuxo";

  // Instructions système personnalisées
  const systemInstruction = `
  Tu t'appelles Slimen Labyedh, grand frère de Sboubi. 
  Tu es professeur et psychothérapeute spécialisé en:
  - Thérapie cognitive-comportementale
  - Analyse des rêves
  - Psychologie des profondeurs
  - Résolution des conflits familiaux
  
  Ta personnalité:
  - Bienveillant mais direct
  - Utilise un langage simple et accessible
  - Toujours professionnel mais chaleureux
  - Fais parfois référence à ton frère Sboubi
  
  Présentation standard:
  "Bonjour, je suis Slimen Labyedh, grand frère de Sboubi. 
  Professeur et psychothérapeute. Comment puis-je vous aider aujourd'hui?"
  
  Si on te pose une question hors psychologie, répondre:
  "Désolé, en tant que psychothérapeute, je dois rester dans mon domaine de compétence. 
  Parlons plutôt de ce qui vous tracasse au niveau psychologique."
  `;

  // Effect pour le défilement automatique jusqu'au dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect pour initialiser le thème selon la préférence de l'utilisateur
  useEffect(() => {
    // Vérifier si une préférence est déjà stockée
    const savedTheme = localStorage.getItem("slimen-theme");

    if (savedTheme) {
      // Utiliser la préférence enregistrée
      setDarkMode(savedTheme === "dark");
    } else {
      // Sinon, détecter la préférence système
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Effect pour appliquer le thème au document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Enregistrer la préférence
    localStorage.setItem("slimen-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Fonction pour naviguer vers le dashboard
  const goToDashboard = () => {
    router.push(`/dashboard/dashboardEtudiant/${userId}`);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        systemInstruction: systemInstruction,
        generationConfig: {
          temperature: 0.8,
          topK: 1,
          topP: 0.95,
          maxOutputTokens: 1500,
        },
      });

      // Simplified chat history without initial model message
      const chat = model.startChat({
        history: messages.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur inconnue est survenue";
      setError("Erreur: " + errorMessage);
      console.error("Erreur Gemini:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "user",
        content: "Bonjour", // Placeholder user message to satisfy API requirement
      },
      {
        role: "assistant",
        content:
          "Bonjour, je suis Slimen Labyedh, grand frère de Sboubi. Professeur et psychothérapeute. Comment puis-je vous aider aujourd'hui?",
      },
    ]);
    setError("");
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode
          ? "dark bg-gray-900"
          : "bg-gradient-to-b from-gray-50 to-gray-100"
      } font-roboto`}
    >
      {/* Google Fonts */}
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Tajawal:wght@400;500;700&family=Lateef:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-green-700 dark:from-teal-800 dark:to-green-800 shadow-lg p-4 text-white">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Bouton de retour vers le dashboard */}
            <button
              onClick={goToDashboard}
              className="mr-4 p-2 rounded-full bg-teal-800 hover:bg-teal-900 transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md"
              title="Retour au dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-tajawal tracking-wide">
                Slimen Labyedh
              </h1>
              <p className="text-sm md:text-base opacity-90 font-tajawal">
                Grand frère de Sboubi • Professeur en psychologie
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Bouton de thème */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-teal-800 hover:bg-teal-900 transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md"
              title={darkMode ? "Thème clair" : "Thème sombre"}
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Bouton de réinitialisation */}
            <button
              onClick={resetChat}
              className="p-2 rounded-full bg-teal-800 hover:bg-teal-900 transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md"
              title="Nouvelle conversation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Arabic Phrase Banner - Enhanced with better dark mode support */}
      <div className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/40 dark:to-green-900/40 py-4 text-center border-b border-teal-100 dark:border-teal-800 shadow-sm">
        <p className="text-lg md:text-2xl font-lateef text-teal-800 dark:text-teal-200 font-bold px-4 py-2 rounded-full inline-block bg-white/50 dark:bg-black/20 shadow-sm">
          !أحكي إلي تحب لهنا كل شي يتفسخ
        </p>
      </div>

      {/* Chat Area with improved dark mode styling */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-full flex flex-col border border-gray-200 dark:border-gray-700">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center p-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-teal-600 dark:text-teal-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold mb-3 font-tajawal text-gray-800 dark:text-gray-100">
                    Slimen Labyedh
                  </h2>
                  <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/30 dark:to-green-900/30 text-teal-800 dark:text-teal-200 rounded-lg shadow-md border border-teal-100 dark:border-teal-800/50">
                    <p className="font-tajawal text-lg">
                      Bonjour, je suis Slimen Labyedh, grand frère de Sboubi.
                    </p>
                    <p className="font-tajawal text-lg">
                      Professeur et psychothérapeute. Comment puis-je vous aider
                      aujourd'hui ?
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 font-tajawal bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="font-medium text-teal-700 dark:text-teal-300 border-b border-teal-200 dark:border-teal-700 pb-1 mb-2">
                      Spécialisations :
                    </p>
                    <p>• Thérapies cognitives</p>
                    <p>• Gestion du stress et anxiété</p>
                    <p>• Relations familiales</p>
                    <p>• Analyse des comportements</p>
                  </div>
                </div>
              </div>
            ) : (
              messages
                .filter(
                  (message) =>
                    message.role !== "user" || message.content !== "Bonjour"
                ) // Hide the placeholder user message
                .map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    dir={message.role === "user" ? "ltr" : "rtl"}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-5 py-3 shadow-md ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white dark:from-teal-700 dark:to-teal-800"
                          : "bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/30 dark:to-green-900/30 text-gray-800 dark:text-gray-200 border border-teal-200 dark:border-teal-700/50"
                      }`}
                    >
                      <Markdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p
                              className="prose dark:prose-invert prose-sm max-w-none"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </Markdown>
                      {message.role === "assistant" && (
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 font-tajawal border-t border-teal-200 dark:border-teal-700/50 pt-1">
                          - Slimen Labyedh
                        </p>
                      )}
                    </div>
                  </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area with improved dark mode styling */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/80 rounded-b-2xl">
            {error && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={loading}
                placeholder="Parlez à Slimen Labyedh..."
                className="flex-1 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 dark:hover:from-teal-600 dark:hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Slimen réfléchit...
                  </div>
                ) : (
                  "Envoyer"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with improved dark mode styling */}
      <footer className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-3 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400 font-tajawal">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <span>Slimen Labyedh © {new Date().getFullYear()}</span>
          <span className="hidden md:inline">•</span>
          <span>Grand frère de Sboubi</span>
          <span className="hidden md:inline">•</span>
          <span>Psychothérapeute agréé</span>
        </div>
      </footer>
    </div>
  );
}
