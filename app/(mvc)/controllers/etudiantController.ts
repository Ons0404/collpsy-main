import { NextRequest, NextResponse } from "next/server";
import {
  findEtudiantById,
  findEtudiantByUtilisateurId,
  findEtudiantByNumeroCarteEtudiant,
  findAllEtudiants,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant,
} from "../models/etudiant.model";

// Récupérer un étudiant par son ID
export async function getEtudiant(id: number) {
  try {
    const etudiant = await findEtudiantById(id);

    if (!etudiant) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(etudiant, { status: 200 });
  } catch (err) {
    console.error("Erreur lors de la récupération de l'étudiant:", err);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

// Récupérer un étudiant par l'ID utilisateur associé
export async function getEtudiantByUtilisateurId(utilisateurId: number) {
  try {
    const etudiant = await findEtudiantByUtilisateurId(utilisateurId);

    if (!etudiant) {
      return NextResponse.json(
        { error: "Étudiant non trouvé pour cet utilisateur" },
        { status: 404 }
      );
    }

    return NextResponse.json(etudiant, { status: 200 });
  } catch (err) {
    console.error("Erreur lors de la récupération de l'étudiant:", err);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

// Récupérer un étudiant par son numéro de carte
export async function getEtudiantByNumeroCarteEtudiant(
  numeroCarteEtudiant: string
) {
  try {
    const etudiant = await findEtudiantByNumeroCarteEtudiant(
      numeroCarteEtudiant
    );

    if (!etudiant) {
      return NextResponse.json(
        { error: "Étudiant non trouvé avec ce numéro de carte" },
        { status: 404 }
      );
    }

    return NextResponse.json(etudiant, { status: 200 });
  } catch (err) {
    console.error("Erreur lors de la récupération de l'étudiant:", err);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

// Récupérer tous les étudiants
export async function getAllEtudiants() {
  try {
    const etudiants = await findAllEtudiants();
    return NextResponse.json(etudiants, { status: 200 });
  } catch (err) {
    console.error("Erreur lors de la récupération des étudiants:", err);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

// Créer un nouvel étudiant
export async function addEtudiant(data: any) {
  try {
    // Validation des données requises
    if (
      !data.numero_carte_etudiant ||
      !data.niveau ||
      !data.etablissement ||
      !data.utilisateurId
    ) {
      return NextResponse.json(
        { error: "Données incomplètes pour la création de l'étudiant" },
        { status: 400 }
      );
    }

    const nouvelEtudiant = await createEtudiant({
      numero_carte_etudiant: data.numero_carte_etudiant,
      niveau: data.niveau,
      etablissement: data.etablissement,
      utilisateurId: data.utilisateurId,
    });

    return NextResponse.json(nouvelEtudiant, { status: 201 });
  } catch (err) {
    console.error("Erreur lors de la création de l'étudiant:", err);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

// Mettre à jour un étudiant
export async function updateEtudiantInfo(id: number, data: any) {
  try {
    const updatedEtudiant = await updateEtudiant(id, data);
    return NextResponse.json(updatedEtudiant, { status: 200 });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'étudiant:", err);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

// Supprimer un étudiant
export async function removeEtudiant(id: number) {
  try {
    await deleteEtudiant(id);
    return NextResponse.json(
      { message: "Étudiant supprimé avec succès" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la suppression de l'étudiant:", err);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
