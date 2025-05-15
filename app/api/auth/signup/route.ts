import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../(mvc)/lib/prisma";
import { registerUser } from "../../../(mvc)/controllers/authController";
import { RegisterRequest } from "../../../(mvc)/types/auth";

// Fonction pour vérifier l'existence d'un email
export async function GET(req: NextRequest) {
  try {
    // Récupérer l'email depuis les paramètres de la requête
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email non fourni" }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: {
        email: email,
      },
    });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification de l'email" },
      { status: 500 }
    );
  }
}

// Fonction pour l'inscription d'un nouvel utilisateur
export async function POST(req: NextRequest) {
  try {
    // Récupérer les données de la requête
    const rawUserData: RegisterRequest = await req.json();
    console.log("Données reçues :", rawUserData);

    // Créer un nouvel objet sans les valeurs `undefined`
    const userData = Object.fromEntries(
      Object.entries({
        ...rawUserData,
        profileImage: rawUserData.profileImage || undefined,
        diplomeFile: rawUserData.diplomeFile || undefined,
        ville: rawUserData.ville || undefined,
        telephone: rawUserData.telephone || undefined,
        numeroCarteEtudiant: rawUserData.numeroCarteEtudiant || undefined,
        niveau: rawUserData.niveau || undefined,
        etablissementEtudiant: rawUserData.etablissementEtudiant || undefined,
        cin: rawUserData.cin || undefined,
        titre: rawUserData.titre || undefined,
        etablissementPsy: rawUserData.etablissementPsy || undefined,
        adresseCabinet: rawUserData.adresseCabinet || undefined,
        intituleDiplome: rawUserData.intituleDiplome || undefined,
        dateObtentionDiplome: rawUserData.dateObtentionDiplome || undefined,
        modeConsultation: rawUserData.modeConsultation || undefined,
      }).filter(([_, value]) => value !== undefined)
    );

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email existe déjà" },
        { status: 400 }
      );
    }

    // Vérifier si le numéro de téléphone existe déjà
    if (userData.telephone) {
      const existingPhoneUser = await prisma.utilisateur.findFirst({
        where: {
          telephone: userData.telephone,
        },
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          { error: "Ce numéro de téléphone est déjà utilisé." },
          { status: 400 }
        );
      }
    }

    // Vérifier si le numéro de carte étudiant existe déjà
    if (userData.numeroCarteEtudiant) {
      const existingStudentCardUser = await prisma.etudiant.findFirst({
        where: {
          numero_carte_etudiant: userData.numeroCarteEtudiant,
        },
      });

      if (existingStudentCardUser) {
        return NextResponse.json(
          { error: "Ce numéro de carte étudiant est déjà utilisé." },
          { status: 400 }
        );
      }
    }

    // Vérifier si le CIN existe déjà
    if (userData.cin) {
      const existingCinUser = await prisma.psychologue.findFirst({
        where: {
          cin: userData.cin,
        },
      });

      if (existingCinUser) {
        return NextResponse.json(
          { error: "Ce CIN est déjà utilisé." },
          { status: 400 }
        );
      }
    }

    // Si toutes les vérifications sont passées, continuer avec l'inscription
    const newUser = await registerUser(userData as any); // Using type assertion as a temporary solution

    if (newUser) {
      return NextResponse.json(
        {
          success: true,
          message: "Inscription réussie",
          user: newUser, // Retourner les données de l'utilisateur créé
        },
        { status: 201 } // Code HTTP 201 pour "Créé"
      );
    } else {
      return NextResponse.json(
        { error: "Échec de l'inscription" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur dans la route d'inscription:", error);

    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, // Retourner le message d'erreur spécifique
        { status: 500 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la demande" },
      { status: 500 }
    );
  }
}
