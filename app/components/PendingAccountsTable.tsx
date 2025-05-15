"use client";
import React, { useState } from "react";
import { Users, UserCheck, Eye, X, Trash2 } from "lucide-react";

interface PendingAccountsTableProps {
  accounts: {
    name: string;
    email: string;
    role: string;
    statut: boolean;
    avatar?: string | null;
    adresse?: string;
  }[];
  refresh: () => void;
  onStatusChange: (email: string, action: "activate" | "deactivate") => void;
  onDelete: (email: string) => void;
  getUserDetails: (email: string) => Promise<any>;
  darkMode: boolean;
}

const PendingAccountsTable: React.FC<PendingAccountsTableProps> = ({
  accounts,
  refresh,
  onStatusChange,
  onDelete,
  getUserDetails,
  darkMode,
}) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const handleViewDetails = async (email: string) => {
    try {
      setLoadingDetails(true);
      setDetailsError(null);
      const userDetails = await getUserDetails(email);
      console.log("User Details:", userDetails); // Debug log to verify data
      setSelectedUser(userDetails);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
      setDetailsError("Impossible de récupérer les détails de l'utilisateur.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setDetailsError(null);
  };

  const getFirstChar = (name?: string) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
      } shadow-lg rounded-lg overflow-hidden`}
    >
      <div
        className={`px-6 py-4 ${
          darkMode
            ? "bg-gray-700 border-gray-600"
            : "bg-gray-50 border-gray-200"
        } border-b flex items-center justify-between`}
      >
        <h3
          className={`text-lg font-semibold flex items-center ${
            darkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          <Users
            className={`mr-2 ${darkMode ? "text-blue-400" : "text-blue-500"}`}
          />{" "}
          Gestion des Comptes
        </h3>
        <span
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Total: {accounts.length} comptes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
            <tr>
              {["AVATAR", "NOM", "EMAIL", "TYPE", "STATUT", "ACTIONS"].map(
                (header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody
            className={`${
              darkMode ? "divide-gray-700" : "divide-gray-200"
            } divide-y`}
          >
            {accounts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className={`px-6 py-4 text-center ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Aucun compte en attente
                </td>
              </tr>
            ) : (
              accounts.map((account, index) => (
                <tr
                  key={index}
                  className={`${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  } transition-colors duration-200`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex-shrink-0 h-10 w-10">
                      {account.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={`data:image/jpeg;base64,${account.avatar}`}
                          alt={`Avatar de ${account.name}`}
                        />
                      ) : (
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            darkMode
                              ? "bg-gray-600 text-gray-300"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {getFirstChar(account.name)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>
                    <div
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {account.name}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>
                    <div
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {account.email}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        darkMode
                          ? "bg-blue-900 text-blue-300"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {account.role}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        account.statut
                          ? darkMode
                            ? "bg-green-900 text-green-300"
                            : "bg-green-100 text-green-800"
                          : darkMode
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {account.statut ? "Actif" : "En attente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex space-x-2 justify-end">
                    <button
                      onClick={() => handleViewDetails(account.email)}
                      className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-full shadow-sm transition-colors duration-200 ${
                        darkMode
                          ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                          : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                      }`}
                    >
                      <Eye
                        className={`mr-1 h-3 w-3 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />{" "}
                      Détails
                    </button>
                    {!account.statut && (
                      <button
                        onClick={() =>
                          onStatusChange(account.email, "activate")
                        }
                        className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm transition-colors duration-200 ${
                          darkMode
                            ? "bg-green-700 text-green-200 hover:bg-green-600"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        <UserCheck className="mr-1 h-3 w-3" /> Activer
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (typeof onDelete === "function") {
                          onDelete(account.email);
                        } else {
                          console.error("onDelete is not a function");
                        }
                      }}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        darkMode
                          ? "bg-red-700 text-red-200 hover:bg-red-600"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${
              darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
            } rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto`}
          >
            <div
              className={`flex justify-between items-center p-6 border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold">
                Détails de l'utilisateur
              </h3>
              <button
                onClick={closeModal}
                className={
                  darkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <p className="text-center">Chargement des détails...</p>
              ) : detailsError ? (
                <p className={darkMode ? "text-red-400" : "text-red-500"}>
                  {detailsError}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    {selectedUser.avatar ? (
                      <img
                        className={`h-20 w-20 rounded-full object-cover border-2 ${
                          darkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                        src={`data:image/jpeg;base64,${selectedUser.avatar}`}
                        alt={`Avatar de ${selectedUser.name || "Utilisateur"}`}
                      />
                    ) : (
                      <div
                        className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                          darkMode
                            ? "bg-gray-600 text-gray-300"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {getFirstChar(selectedUser.name)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedUser.name || "Utilisateur sans nom"}
                      </h2>
                      <p
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        {selectedUser.email || "Email non disponible"}
                      </p>
                      <p className="mt-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedUser.statut
                              ? darkMode
                                ? "bg-green-900 text-green-300"
                                : "bg-green-100 text-green-800"
                              : darkMode
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedUser.statut ? "Actif" : "En attente"}
                        </span>
                        <span
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            darkMode
                              ? "bg-blue-900 text-blue-300"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selectedUser.role || "Rôle non défini"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Date d'inscription
                      </h4>
                      <p
                        className={darkMode ? "text-gray-200" : "text-gray-900"}
                      >
                        {selectedUser.createdAt
                          ? new Date(selectedUser.createdAt).toLocaleDateString(
                              "fr-FR"
                            )
                          : "Non disponible"}
                      </p>
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Dernière connexion
                      </h4>
                      <p
                        className={darkMode ? "text-gray-200" : "text-gray-900"}
                      >
                        {selectedUser.lastLogin
                          ? new Date(selectedUser.lastLogin).toLocaleDateString(
                              "fr-FR"
                            )
                          : "Non disponible"}
                      </p>
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Téléphone
                      </h4>
                      <p
                        className={darkMode ? "text-gray-200" : "text-gray-900"}
                      >
                        {selectedUser.phone || "Non disponible"}
                      </p>
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Adresse
                      </h4>
                      <p
                        className={darkMode ? "text-gray-200" : "text-gray-900"}
                      >
                        {selectedUser.address || "Non disponible"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-6 border-t pt-4 ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <h4
                      className={`font-medium mb-2 ${
                        darkMode ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      Informations personnelles
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Civilité
                        </h4>
                        <p
                          className={
                            darkMode ? "text-gray-200" : "text-gray-900"
                          }
                        >
                          {selectedUser.civilite || "Non disponible"}
                        </p>
                      </div>
                      <div>
                        <h4
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Date de naissance
                        </h4>
                        <p
                          className={
                            darkMode ? "text-gray-200" : "text-gray-900"
                          }
                        >
                          {selectedUser.dateNaissance
                            ? new Date(
                                selectedUser.dateNaissance
                              ).toLocaleDateString("fr-FR")
                            : "Non disponible"}
                        </p>
                      </div>
                      <div>
                        <h4
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Ville
                        </h4>
                        <p
                          className={
                            darkMode ? "text-gray-200" : "text-gray-900"
                          }
                        >
                          {selectedUser.city || "Non disponible"}
                        </p>
                      </div>
                      <div>
                        <h4
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Code postal
                        </h4>
                        <p
                          className={
                            darkMode ? "text-gray-200" : "text-gray-900"
                          }
                        >
                          {selectedUser.postalCode || "Non disponible"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedUser.role === "PSYCHOLOGUE" && (
                    <div
                      className={`mt-6 border-t pt-4 ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h4
                        className={`font-medium mb-2 ${
                          darkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        Informations professionnelles
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Titre
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.titre || "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Spécialité
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.speciality || "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            CIN
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.cin || "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Établissement
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.etablissement || "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Adresse cabinet
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.adresseCabinet || "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Mode de consultation
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.modeConsultation || "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Intitulé du diplôme
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.intituleDiplome || "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Date d'obtention
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.dateObtention
                              ? new Date(
                                  selectedUser.dateObtention
                                ).toLocaleDateString("fr-FR")
                              : "Non disponible"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4
                          className={`text-sm font-medium mb-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Diplôme
                        </h4>
                        {selectedUser.photoDiplome ? (
                          <div
                            className={`mt-2 border rounded-lg overflow-hidden ${
                              darkMode ? "border-gray-700" : "border-gray-300"
                            }`}
                          >
                            <img
                              src={`data:image/jpeg;base64,${selectedUser.photoDiplome}`}
                              alt="Diplôme"
                              className="w-full object-contain max-h-64"
                            />
                          </div>
                        ) : (
                          <p
                            className={
                              darkMode
                                ? "text-gray-400 italic"
                                : "text-gray-500 italic"
                            }
                          >
                            Aucun diplôme téléchargé
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedUser.role === "ETUDIANT" && (
                    <div
                      className={`mt-6 border-t pt-4 ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h4
                        className={`font-medium mb-2 ${
                          darkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        Informations académiques
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Université
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.university || "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Numéro de carte étudiant
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.numeroCarteEtudiant ||
                              "Non disponible"}
                          </p>
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Niveau
                          </h4>
                          <p
                            className={
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }
                          >
                            {selectedUser.niveau || "Non disponible"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className={`px-6 py-3 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              } flex justify-end space-x-3 border-t`}
            >
              <button
                onClick={closeModal}
                className={`px-3 py-1.5 text-sm font-medium rounded-md shadow-sm ${
                  darkMode
                    ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-100"
                } border`}
              >
                Fermer
              </button>
              {!selectedUser.statut && (
                <button
                  onClick={() => onStatusChange(selectedUser.email, "activate")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md shadow-sm ${
                    darkMode
                      ? "bg-green-700 text-green-200 hover:bg-green-600"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Activer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingAccountsTable;
