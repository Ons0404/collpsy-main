"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = (): JSX.Element => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Reusable styles for links
  const linkStyles = "text-gray-700 hover:text-green-600 px-3 py-2 rounded-md";
  const mobileLinkStyles = "block px-3 py-2 rounded-md";

  return (
    <nav className="bg-transparent fixed w-full z-50">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}

          <div className="flex items-center ml-6 lg:ml-12">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-[75px] mb-4 drop-shadow-md" // hauteur augmentée à 75px
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 mr-6 lg:mr-12">
            <Link href="/" className={linkStyles}>
              Accueil
            </Link>

            <Link href="/about" className={linkStyles}>
              À propos
            </Link>

            <div className="ml-6">
              <Link
                href="../auth/login"
                className="text-gray-700 hover:text-green-600 mr-6"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/signup"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md"
              >
                S'inscrire
              </Link>
            </div>
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center mr-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden bg-white shadow-md transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="/" className={`${linkStyles} ${mobileLinkStyles}`}>
            Accueil
          </Link>
          <Link
            href="/psychologists"
            className={`${linkStyles} ${mobileLinkStyles}`}
          >
            Psychologues
          </Link>
          <Link href="../tests" className={`${linkStyles} ${mobileLinkStyles}`}>
            Tests
          </Link>
          <Link href="/about" className={`${linkStyles} ${mobileLinkStyles}`}>
            À propos
          </Link>
          <Link
            href="../auth/login"
            className={`${linkStyles} ${mobileLinkStyles}`}
          >
            Se connecter
          </Link>
          <Link
            href="/auth/signup"
            className="bg-green-600 hover:bg-green-700 text-white block px-3 py-2 rounded-md"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
