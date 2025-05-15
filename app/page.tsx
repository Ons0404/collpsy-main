"use client";
import React from "react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";

import {
  ArrowRight,
  MessageCircle,
  Monitor,
  FileText,
  Users,
  Check,
  Globe,
  Star,
} from "lucide-react";

export default function Home() {
  const [consultationType, setConsultationType] = useState<string>("online");
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Professional Hero Section */}
      <section className="relative bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6 pr-8">
            <div className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              Soutien Psychologique Étudiant
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Prenez Soin de Votre Santé Mentale
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Une plateforme dédiée aux étudiants, offrant un accompagnement
              psychologique personnalisé, accessible et confidentiel.
            </p>
            <div className="space-y-4">
              {[
                "Consultations individuelles",
                "Tests psychologiques adaptés",
                "Soutien en ligne 24/7",
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="text-green-600 mr-3" size={24} />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex space-x-4 pt-6">
              <Link
                href="/tests"
                className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Nos Tests <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                href="/psychologues"
                className="flex items-center border border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Nos psychologues
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 hidden md:block">
            <div className="relative">
              <div className="absolute -inset-2 bg-green-100 rounded-3xl opacity-50 blur-2xl"></div>
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/banner.jpg"
                  alt="Student Mental Health Support"
                  width={600}
                  height={400}
                  quality={90}
                  className="w-full h-auto object-cover transform hover:scale-105 transition duration-300"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/80 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Services Adaptés aux Étudiants
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des solutions complètes conçues spécifiquement pour répondre aux
              défis psychologiques uniques des étudiants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Monitor className="text-green-600" size={32} />,
                title: "Consultations en Ligne",
                description:
                  "Séances flexibles avec des psychologues spécialisés dans le soutien étudiant.",
              },
              {
                icon: <FileText className="text-green-600" size={32} />,
                title: "Évaluations Psychologiques",
                description:
                  "Tests scientifiques pour comprendre et gérer votre bien-être mental.",
              },
              {
                icon: <Users className="text-green-600" size={32} />,
                title: "Support par Groupes",
                description:
                  "Sessions de groupe pour partager et surmonter les défis communs.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-500">
                Collpsy
              </h3>
              <p className="text-gray-400 mb-4">
                Plateforme de soutien psychologique innovante pour étudiants.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-500">
                  <Globe size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500">
                  <MessageCircle size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-500">
                  <Star size={20} />
                </a>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-500">
                Navigation
              </h3>
              <ul className="space-y-2">
                {[
                  { href: "/", label: "Accueil" },
                  { href: "/about", label: "À propos" },
                  { href: "/psychologists", label: "Psychologues" },
                  {
                    href: "/tests",
                    label: "Tests",
                  },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-green-500 transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-500">
                Légal
              </h3>
              <ul className="space-y-2">
                {[
                  { href: "#", label: "Conditions d'utilisation" },
                  { href: "#", label: "Confidentialité" },
                  { href: "#", label: "Mentions légales" },
                  { href: "#", label: "Cookies" },
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-green-500 transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-500">
                Contact
              </h3>
              <ul className="space-y-2">
                {[
                  {
                    icon: <MessageCircle size={16} />,
                    text: "contact@collpsy.com",
                  },
                  {
                    icon: <Globe size={16} />,
                    text: "123 Rue de la Santé, Tunis",
                  },
                  { icon: <Star size={16} />, text: "+216 12 345 678" },
                ].map((contact, index) => (
                  <li key={index} className="flex items-center text-gray-400">
                    <span className="mr-2">{contact.icon}</span>
                    {contact.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">
              © {currentYear} Collpsy. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
