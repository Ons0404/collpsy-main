"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Psychologist {
  id: number;
  cin: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  specialties: string[];
  establishment: string;
  cabinetAddress: string;
  address: string;
  city: string;
  postalCode: string;
  civility: string;
  consultationMode?: "EN_LIGNE" | "PRESENTIEL" | "LES_DEUX";
  sessionTypes: string[];
  diploma: string;
  diplomaDate: string;
  birthDate: string;
  avatar: string | null;
  verified: boolean;
  rating: number;
  experience: number;
  availableSlots: any[];
  photo_diplome: boolean;
}

interface PaginatedResponse {
  data: Psychologist[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const PsychologistPage = () => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPsychologistId, setExpandedPsychologistId] = useState<
    number | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<
    "PRESENTIEL" | "EN_LIGNE" | "LES_DEUX" | null
  >(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<{
    [key: number]: boolean;
  }>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        let url = `/api/psychologists?page=${currentPage}&limit=${limit}`;
        if (filterMode) {
          url += `&serviceType=${filterMode}`;
        }
        if (searchTerm) {
          url += `&searchQuery=location=${encodeURIComponent(
            searchTerm
          )}&specialty=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);

        const data: PaginatedResponse = await response.json();

        if (data && data.data && Array.isArray(data.data)) {
          setPsychologists(data.data);
          if (data.pagination) {
            setCurrentPage(data.pagination.page);
            setTotalPages(data.pagination.totalPages);
            setLimit(data.pagination.limit);
            setTotal(data.pagination.total);
          }
        } else {
          setPsychologists([]);
          throw new Error("Format de données inattendu");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur inconnue s'est produite"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologists();
  }, [currentPage, limit, filterMode, searchTerm]);

  const toggleDetails = (id: number) => {
    setExpandedPsychologistId(expandedPsychologistId === id ? null : id);
  };

  const handleImageError = (psychId: number) => {
    setImageLoadErrors((prev) => ({ ...prev, [psychId]: true }));
  };

  const getConsultationModeLabel = (
    mode?: "PRESENTIEL" | "EN_LIGNE" | "LES_DEUX"
  ) => {
    switch (mode) {
      case "EN_LIGNE":
        return "En ligne";
      case "PRESENTIEL":
        return "En présentiel";
      case "LES_DEUX":
        return "En ligne et présentiel";
      default:
        return "Non spécifié";
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-t-4 border-green-600 border-solid rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-gray-700">
              Chargement des professionnels...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative rounded-2xl bg-white shadow-xl overflow-hidden mb-12">
          {/* Background Image - Made more visible */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-transparent z-10"></div>
            <img
              src="/imagepsy.jpg"
              alt="Psychologues professionnels"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="relative z-20 p-8 md:p-12 md:w-3/5">
            <Link
              href="/"
              className="inline-flex items-center text-green-600 hover:text-green-800 mb-8 transition-colors bg-white/80 px-3 py-1 rounded-full"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour à l'accueil
            </Link>

            <div className="bg-white/90 p-6 rounded-lg shadow-sm backdrop-blur-sm">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Nos Psychologues
              </h1>
              <p className="text-xl text-gray-600">
                Des professionnels qualifiés prêts à vous accompagner dans votre
                parcours de bien-être mental
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-3/5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par nom, spécialité ou ville..."
                  className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-4 top-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2 font-medium">
                Mode de consultation
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setFilterMode(null);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    filterMode === null
                      ? "bg-green-600 text-white font-medium shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => {
                    setFilterMode("PRESENTIEL");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    filterMode === "PRESENTIEL"
                      ? "bg-green-600 text-white font-medium shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Présentiel
                </button>
                <button
                  onClick={() => {
                    setFilterMode("EN_LIGNE");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    filterMode === "EN_LIGNE"
                      ? "bg-green-600 text-white font-medium shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  En ligne
                </button>
                <button
                  onClick={() => {
                    setFilterMode("LES_DEUX");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    filterMode === "LES_DEUX"
                      ? "bg-green-600 text-white font-medium shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Les deux
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count and Pagination Controls */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600 font-medium">
            {total} professionnel{total !== 1 ? "s" : ""} trouvé
            {total !== 1 ? "s" : ""}
            {total > 0 && ` (page ${currentPage}/${totalPages})`}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Afficher</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-gray-600 text-sm">par page</span>
          </div>
        </div>

        {/* No Results Message */}
        {psychologists.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 22a10 10 0 100-20 10 10 0 000 20z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-500 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterMode(null);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {/* Psychologists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {psychologists.map((psych) => (
                <div
                  key={psych.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
                >
                  {/* Consultation Mode Header */}
                  <div className="flex justify-between items-center px-4 py-3 bg-green-600 text-white">
                    <div className="inline-flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {psych.consultationMode === "EN_LIGNE" ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        )}
                      </svg>
                      <span className="text-sm font-medium">
                        {getConsultationModeLabel(psych.consultationMode)}
                      </span>
                    </div>

                    {psych.verified && (
                      <div className="inline-flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Vérifié</span>
                      </div>
                    )}
                  </div>

                  {/* Psychologist Details */}
                  <div className="p-6">
                    <div className="flex items-start gap-5">
                      <div className="w-24 h-24 rounded-full bg-green-50 overflow-hidden flex-shrink-0 border-4 border-white shadow-lg">
                        {psych.avatar && !imageLoadErrors[psych.id] ? (
                          <img
                            src={psych.avatar}
                            alt={`${psych.firstName} ${psych.lastName}`}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                            onError={() => handleImageError(psych.id)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-green-400">
                            <svg
                              className="w-12 h-12"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {psych.civility === "M" ? "M." : "Mme"}{" "}
                          {psych.firstName} {psych.lastName}
                        </h2>
                        <p className="text-green-600 font-medium">
                          {psych.title}
                        </p>
                        <div className="flex items-center mt-1 flex-wrap gap-2">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-500 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <p className="text-gray-500">{psych.city}</p>
                          </div>
                          {psych.experience > 0 && (
                            <p className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                              {psych.experience} an
                              {psych.experience > 1 ? "s" : ""} d'expérience
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    {psych.specialties && psych.specialties.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {psych.specialties
                            .slice(0, 4)
                            .map((specialty, index) => (
                              <span
                                key={index}
                                className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
                              >
                                {specialty}
                              </span>
                            ))}
                          {psych.specialties.length > 4 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              +{psych.specialties.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-700">{psych.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="text-gray-700">
                          {psych.establishment || "Pratique indépendante"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5"
                          />
                        </svg>
                        <span className="text-gray-700">{psych.diploma}</span>
                      </div>
                    </div>

                    {/* Session Types */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {psych.sessionTypes.slice(0, 3).map((type, index) => (
                        <span
                          key={index}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                        >
                          {type}
                        </span>
                      ))}
                      {psych.sessionTypes.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          +{psych.sessionTypes.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Rating Display */}
                    {psych.rating > 0 && (
                      <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(psych.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {psych.rating.toFixed(1)}/5
                        </span>
                      </div>
                    )}

                    {/* More Details Button */}
                    <button
                      onClick={() => toggleDetails(psych.id)}
                      className="mt-6 w-full py-3 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {expandedPsychologistId === psych.id ? (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          Moins de détails
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          Plus de détails
                        </>
                      )}
                    </button>

                    {/* Expanded Details */}
                    {expandedPsychologistId === psych.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 gap-4">
                          {/* Full specialties list */}
                          {psych.specialties &&
                            psych.specialties.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                  Spécialités
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {psych.specialties.map((specialty, index) => (
                                    <span
                                      key={index}
                                      className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Full session types list */}
                          {psych.sessionTypes &&
                            psych.sessionTypes.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                  Types de séances
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {psych.sessionTypes.map((type, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Full address */}
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Adresse du cabinet
                            </h3>
                            <p className="text-gray-600">
                              {psych.cabinetAddress || psych.address}
                              <br />
                              {psych.postalCode} {psych.city}
                            </p>
                          </div>

                          {/* Contact details */}
                          <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                              Contact complet
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                <span className="text-gray-700">
                                  {psych.phone}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-gray-700">
                                  {psych.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Experience and diploma */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Diplôme
                              </h3>
                              <p className="text-gray-600">
                                {psych.diploma} ({psych.diplomaDate})
                              </p>
                              {psych.photo_diplome && (
                                <span className="inline-flex items-center text-xs text-green-600 mt-1">
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Diplôme vérifié
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Expérience
                              </h3>
                              <p className="text-gray-600">
                                {psych.experience} an
                                {psych.experience > 1 ? "s" : ""} d'expérience
                              </p>
                            </div>
                          </div>

                          {/* Book appointment button */}
                          <Link
                            href={`/appointment/${psych.id}`}
                            className="mt-4 w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Prendre rendez-vous
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      // Show all pages if total pages are 5 or less
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      // Current page is near the beginning
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // Current page is near the end
                      pageNumber = totalPages - 4 + i;
                    } else {
                      // Current page is in the middle
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          currentPage === pageNumber
                            ? "z-10 bg-green-50 border-green-500 text-green-600"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                À propos
              </h3>
              <p className="text-gray-600">
                Notre plateforme connecte les personnes avec des psychologues
                qualifiés pour leur offrir un accompagnement adapté à leurs
                besoins.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Liens utiles
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Qui sommes-nous
                  </Link>
                </li>
                <li>
                  <Link
                    href="/join"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Devenir psychologue partenaire
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Blog & Ressources
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informations légales
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500">
              © {new Date().getFullYear()} Psy Connect. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PsychologistPage;