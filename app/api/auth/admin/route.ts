import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  getAdministrateur,
  getAdministrateurByEmail,
  updateAdministrateurInfo,
} from "../../../(mvc)/controllers/administrateurController";

const prisma = new PrismaClient();

// Configuration SMTP détaillée
const transportOptions: SMTPTransport.Options = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
  logger: true,
  debug: true,
};

// Création du transporteur
const transporter = nodemailer.createTransport(transportOptions);

// Fonction de test de connexion
async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log("Connexion SMTP réussie ✅");
  } catch (error) {
    console.error("Erreur de connexion SMTP ❌:", error);
    console.log("Variables EMAIL:", {
      HOST: process.env.EMAIL_HOST,
      PORT: process.env.EMAIL_PORT,
      USER: process.env.EMAIL_USER ? "Défini ✅" : "Non défini ❌",
      SECURE: process.env.EMAIL_SECURE,
    });
  }
}

// Appel de la fonction de test
testEmailConnection();

// Fonction pour envoyer l'email d'activation
async function sendActivationEmail(email: string, userName: string) {
  try {
    const mailOptions = {
      from: `"Votre Application" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Activation de votre compte",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Activation de votre compte</h2>
          <p>Bonjour ${userName},</p>
          <p>Nous sommes ravis de vous informer que votre compte a été activé avec succès.</p>
          <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
            <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.</p>
          </div>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>Cordialement,<br>L'équipe de Support</p>
        </div>
      `,
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email de confirmation envoyé:", info.messageId);
    return true;
  } catch (error) {
    console.error(
      "Erreur détaillée lors de l'envoi de l'email de confirmation:",
      error
    );

    // Log plus détaillé de l'erreur
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    }

    return false;
  }
}

// Schéma de validation pour la requête POST
const UpdateStatusSchema = z.object({
  email: z.string().email("Email invalide"),
  action: z.enum(["activate", "deactivate"], {
    errorMap: () => ({ message: "Action invalide" }),
  }),
});

// Schéma de validation pour la requête DELETE
const DeleteSchema = z.object({
  email: z.string().email("Email invalide"),
});

// Fonction pour encoder les données binaires en Base64
function encodeBase64(data: Buffer | null | undefined): string | null {
  if (!data) return null;
  return Buffer.from(data).toString("base64");
}

// Fonction pour gérer toutes les requêtes GET
export async function GET(request: Request) {
  // Récupérer l'URL de la requête
  const url = new URL(request.url);
  const emailParam = url.searchParams.get("email");

  // Si un email est spécifié, retourner les détails de cet utilisateur
  if (emailParam) {
    return getUserDetails(emailParam);
  }

  // Sinon, retourner tous les utilisateurs
  try {
    const accounts = await prisma.utilisateur.findMany({
      select: {
        nom: true,
        prenom: true,
        email: true,
        role: true,
        statut: true,
        avatar: true, // Ajouter l'avatar
      },
    });

    // Transformer les données pour correspondre à votre interface frontend
    const formattedAccounts = accounts.map((account) => ({
      name: `${account.nom} ${account.prenom || ""}`.trim(),
      email: account.email,
      role: account.role,
      statut: account.statut,
      avatar: account.avatar ? encodeBase64(account.avatar as Buffer) : null, // Encoder l'avatar en Base64
    }));

    return NextResponse.json(formattedAccounts);
  } catch (error) {
    console.error("Erreur lors de la récupération des comptes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des comptes" },
      { status: 500 }
    );
  }
}

// Fonction pour récupérer les détails d'un utilisateur spécifique
async function getUserDetails(email: string) {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: {
        etudiant: true,
        psychologue: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Préparer les données utilisateur en fonction du rôle
    const userData = {
      id: user.id,
      name: `${user.nom} ${user.prenom || ""}`.trim(),
      email: user.email,
      role: user.role,
      statut: user.statut,
      phone: user.telephone,
      address: user.adresse,
      city: user.ville,
      postalCode: user.code_postal,
      createdAt: user.date_inscription?.toISOString(),
      dateNaissance: user.date_naissance?.toISOString(),
      civilite: user.civilite,
      avatar: user.avatar ? encodeBase64(user.avatar as Buffer) : null, // Encoder l'avatar en Base64
    };

    // Ajouter les données spécifiques à l'étudiant si disponibles
    if (user.role === "ETUDIANT" && user.etudiant) {
      Object.assign(userData, {
        numeroCarteEtudiant: user.etudiant.numero_carte_etudiant,
        niveau: user.etudiant.niveau,
        university: user.etudiant.etablissement,
      });
    }

    // Ajouter les données spécifiques au psychologue si disponibles
    if (user.role === "PSYCHOLOGUE" && user.psychologue) {
      Object.assign(userData, {
        cin: user.psychologue.cin,
        titre: user.psychologue.titre,
        speciality: user.psychologue.titre, // Utiliser le titre comme spécialité si pas disponible
        etablissement: user.psychologue.etablissement,
        adresseCabinet: user.psychologue.adresse_cabinet,
        intituleDiplome: user.psychologue.intitule_diplome,
        dateObtention: user.psychologue.date_obtention?.toISOString(),
        modeConsultation: user.psychologue.mode_consultation,
        photoDiplome: user.psychologue.photo_diplome
          ? encodeBase64(user.psychologue.photo_diplome as Buffer)
          : null, // Encoder le diplôme en Base64
      });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails utilisateur:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails utilisateur" },
      { status: 500 }
    );
  }
}

// Fonction pour mettre à jour le statut d'un utilisateur
export async function POST(request: Request) {
  try {
    // Parser et valider les données de la requête
    const body = await request.json();
    const validationResult = UpdateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, action } = validationResult.data;

    // Récupérer l'utilisateur par email
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'action est une activation
    let emailSent = false;
    if (action === "activate" && !user.statut) {
      // Envoyer l'email d'activation
      emailSent = await sendActivationEmail(
        user.email,
        `${user.nom} ${user.prenom || ""}`.trim()
      );
    }

    // Mettre à jour le statut
    const updatedUser = await prisma.utilisateur.update({
      where: { email },
      data: {
        statut: action === "activate",
      },
      select: {
        nom: true,
        prenom: true,
        email: true,
        role: true,
        statut: true,
        avatar: true, // Ajouter l'avatar
      },
    });

    return NextResponse.json({
      success: true,
      emailSent: emailSent,
      user: {
        name: `${updatedUser.nom} ${updatedUser.prenom || ""}`.trim(),
        email: updatedUser.email,
        role: updatedUser.role,
        statut: updatedUser.statut,
        avatar: updatedUser.avatar
          ? encodeBase64(updatedUser.avatar as Buffer)
          : null, // Encoder l'avatar en Base64
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut de l'utilisateur:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}

// Fonction pour supprimer un utilisateur
export async function DELETE(request: Request) {
  try {
    // Parser et valider les données de la requête
    const body = await request.json();
    const validationResult = DeleteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Vérifier si l'utilisateur existe
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.utilisateur.delete({
      where: { email },
    });

    return NextResponse.json({
      success: true,
      message: `Utilisateur avec l'email ${email} supprimé avec succès`,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
