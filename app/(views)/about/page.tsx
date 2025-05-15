"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  Brain,
  Users,
  ArrowLeft,
  MapPin,
  Clock,
  Shield,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-green-800 py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-green-800 to-emerald-700 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              À propos de CollPsy
            </h1>
            <p className="mt-6 text-xl text-green-100">
              Une plateforme dédiée aux étudiants, offrant un accompagnement
              psychologique personnalisé, accessible et confidentiel.
            </p>
            <div className="mt-8">
              <Link href="/">
                <button className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-green-800 shadow-sm hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-green-800 sm:text-4xl">
                Notre Mission
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-7 text-gray-600">
                Chez CollPsy, nous croyons que chaque étudiant mérite un accès
                facile et confidentiel à un soutien psychologique de qualité.
                Notre plateforme est conçue pour vous accompagner dans vos défis
                quotidiens, qu'il s'agisse de stress académique, d'anxiété ou de
                recherche de bien-être.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Values */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Nos valeurs fondamentales
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Les principes qui guident notre approche du soutien psychologique
            pour les étudiants.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Confidentialité */}
          <div className="pt-6">
            <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center rounded-md bg-green-600 p-3 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                  Confidentialité totale
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  Vos informations et consultations restent strictement privées,
                  garantissant un espace sécurisé.
                </p>
              </div>
            </div>
          </div>

          {/* Accessibilité */}
          <div className="pt-6">
            <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center rounded-md bg-emerald-600 p-3 shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                  Accessibilité pour tous
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  Des services conçus pour être accessibles à tous les
                  étudiants, indépendamment de leur situation.
                </p>
              </div>
            </div>
          </div>

          {/* Flexibilité */}
          <div className="pt-6">
            <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center rounded-md bg-teal-600 p-3 shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                  Flexibilité horaire
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  Des consultations adaptées à votre emploi du temps chargé
                  d'étudiant.
                </p>
              </div>
            </div>
          </div>

          {/* Expertise */}
          <div className="pt-6">
            <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center rounded-md bg-green-700 p-3 shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                  Expertise professionnelle
                </h3>
                <p className="mt-5 text-base text-gray-500">
                  Des psychologues spécialisés dans les problématiques
                  étudiantes et universitaires.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nos services
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Des solutions complètes pour répondre à vos besoins en santé
              mentale.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Consultations en Ligne */}
            <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="h-2 bg-green-600"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Consultations en Ligne
                </h3>
                <p className="mt-4 text-gray-600">
                  Séances flexibles avec des psychologues spécialisés dans le
                  soutien étudiant, disponibles à distance pour s'adapter à
                  votre emploi du temps.
                </p>
                <div className="mt-6 flex items-center">
                  <div className="text-sm font-medium text-green-600">
                    En savoir plus
                  </div>
                  <svg
                    className="ml-1 h-4 w-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Évaluations Psychologiques */}
            <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="h-2 bg-emerald-600"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <Brain className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Évaluations Psychologiques
                </h3>
                <p className="mt-4 text-gray-600">
                  Tests scientifiques pour comprendre et gérer votre bien-être
                  mental, conçus pour vous aider à mieux vous connaître et à
                  développer des stratégies adaptées.
                </p>
                <div className="mt-6 flex items-center">
                  <div className="text-sm font-medium text-emerald-600">
                    En savoir plus
                  </div>
                  <svg
                    className="ml-1 h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Support par Groupes */}
            <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="h-2 bg-teal-600"></div>
              <div className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                  Support par Groupes
                </h3>
                <p className="mt-4 text-gray-600">
                  Sessions de groupe pour partager et surmonter les défis
                  communs, favorisant un sentiment de communauté et de soutien
                  entre étudiants confrontés à des problématiques similaires.
                </p>
                <div className="mt-6 flex items-center">
                  <div className="text-sm font-medium text-teal-600">
                    En savoir plus
                  </div>
                  <svg
                    className="ml-1 h-4 w-4 text-teal-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl py-16 px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-green-700 shadow-xl">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:py-20 lg:pl-16 lg:pr-10">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Prêt à prendre soin de votre santé mentale?
              </h2>
              <p className="mt-4 max-w-3xl text-lg text-green-100">
                Rejoignez notre communauté d'étudiants qui ont choisi de
                prioriser leur bien-être mental.
              </p>
            </div>
            <div className="mt-12 sm:w-full sm:max-w-md lg:mt-0 lg:ml-8 lg:flex-1">
              <div className="sm:flex">
                <div className="mt-4 sm:mt-0 sm:ml-3">
                  <button className="block w-full rounded-md bg-white px-5 py-3 text-base font-medium text-green-700 shadow hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700 sm:px-10">
                    Prendre rendez-vous
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
