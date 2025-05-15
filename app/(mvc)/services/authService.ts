"use server";

import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { RegisterRequest } from "../types/auth";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  inputPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

export async function findUserByEmail(email: string) {
  return await prisma.utilisateur.findUnique({
    where: { email },
    include: {
      etudiant: true,
      psychologue: true,
    },
  });
}

export async function findAdminByEmail(email: string) {
  return await prisma.administrateur.findUnique({
    where: { email },
  });
}

export async function findUserById(id: number) {
  return await prisma.utilisateur.findUnique({
    where: { id },
    include: {
      etudiant: true,
      psychologue: true,
    },
  });
}

export async function base64ToBuffer(
  base64String: string
): Promise<Buffer | null> {
  if (!base64String || !base64String.includes("base64")) {
    return null;
  }
  try {
    const base64Data = base64String.split(",")[1];
    return Buffer.from(base64Data, "base64");
  } catch (error) {
    console.error("Erreur lors de la conversion de l'image:", error);
    return null;
  }
}

export async function validateRegistrationData(data: RegisterRequest) {
  const errors: string[] = [];
  if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push("Email invalide.");
  }
  if (!data.password || data.password.length < 6) {
    errors.push("Le mot de passe doit contenir au moins 6 caractères.");
  }
  return errors;
}

export async function updateUserAvatar(userId: number, avatarBase64: string) {
  try {
    const avatarBuffer = await base64ToBuffer(avatarBase64);
    if (!avatarBuffer) {
      throw new Error("Données d'image base64 invalides");
    }

    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: { avatar: avatarBuffer },
    });

    return updatedUser;
  } catch (error) {
    console.error("Erreur de mise à jour de l'avatar:", error);
    throw error;
  }
}

export async function createUser(userData: RegisterRequest) {
  try {
    const hashedPassword = await hashPassword(userData.password);
    let avatarBuffer: Buffer | null = null;
    let diplomeBuffer: Buffer | null = null;

    if (userData.profileImage) {
      avatarBuffer = await base64ToBuffer(userData.profileImage);
    }

    if (userData.diplomeFile && userData.role === "PSYCHOLOGUE") {
      diplomeBuffer = await base64ToBuffer(userData.diplomeFile);
    }

    const newUser = await prisma.utilisateur.create({
      data: {
        role: userData.role,
        email: userData.email,
        mot_de_passe: hashedPassword,
        nom: userData.nom,
        prenom: userData.prenom,
        ville: userData.ville || "",
        adresse: userData.adresse,
        telephone: userData.telephone || "",
        date_naissance: new Date(userData.dateNaissance),
        civilite: userData.civilite,
        avatar: avatarBuffer,
        etudiant:
          userData.role === "ETUDIANT"
            ? {
                create: {
                  numero_carte_etudiant: userData.numeroCarteEtudiant!,
                  niveau: userData.niveau!,
                  etablissement: userData.etablissementEtudiant!,
                },
              }
            : undefined,
        psychologue:
          userData.role === "PSYCHOLOGUE"
            ? {
                create: {
                  cin: userData.cin!,
                  titre: userData.titre!,
                  etablissement: userData.etablissementPsy!,
                  adresse_cabinet: userData.adresseCabinet!,
                  intitule_diplome: userData.intituleDiplome!,
                  date_obtention: new Date(userData.dateObtentionDiplome!),
                  mode_consultation: userData.modeConsultation!,
                  photo_diplome: diplomeBuffer,
                },
              }
            : undefined,
      },
      include: {
        etudiant: true,
        psychologue: true,
      },
    });

    const userResponse: any = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      nom: newUser.nom,
      prenom: newUser.prenom || "",
      civilite: newUser.civilite || "",
      telephone: newUser.telephone,
      ville: newUser.ville,
      adresse: newUser.adresse,
      statut: newUser.statut ? "Actif" : "Inactif",
      etudiant: newUser.etudiant,
      psychologue: newUser.psychologue,
    };

    return userResponse;
  } catch (error) {
    console.error("Erreur dans createUser:", error);
    throw error;
  }
}

export async function handleLogin(email: string, password: string) {
  try {
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.mot_de_passe))) {
      return { success: false, error: "Email ou mot de passe incorrect." };
    }

    if (!user.statut) {
      return {
        success: false,
        error:
          "Votre compte n'est pas encore actif. Veuillez attendre l'activation par l'administrateur.",
      };
    }

    const userData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      civilite: user.civilite,
      telephone: user.telephone,
      ville: user.ville,
      adresse: user.adresse,
      statut: user.statut ? "Actif" : "Inactif",
      etudiant: user.etudiant,
      psychologue: user.psychologue,
    };

    return { success: true, user: userData };
  } catch (error) {
    console.error("Erreur dans handleLogin:", error);
    return {
      success: false,
      error: "Une erreur s'est produite. Veuillez réessayer.",
    };
  }
}

export async function updatedUser(userId: number, userData: any) {
  try {
    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        date_naissance: userData.date_naissance
          ? new Date(userData.date_naissance)
          : undefined,
        adresse: userData.adresse,
        ville: userData.ville,
        telephone: userData.telephone,
        civilite: userData.civilite,
        psychologue: userData.psychologue
          ? {
              update: {
                cin: userData.psychologue.cin,
                titre: userData.psychologue.titre,
                etablissement: userData.psychologue.etablissement,
                adresse_cabinet: userData.psychologue.adresse_cabinet,
                intitule_diplome: userData.psychologue.intitule_diplome,
                date_obtention: userData.psychologue.date_obtention
                  ? new Date(userData.psychologue.date_obtention)
                  : undefined,
                mode_consultation: userData.psychologue.mode_consultation,
              },
            }
          : undefined,
        etudiant: userData.etudiant
          ? {
              update: {
                numero_carte_etudiant: userData.etudiant.numero_carte_etudiant,
                niveau: userData.etudiant.niveau,
                etablissement: userData.etudiant.etablissement,
              },
            }
          : undefined,
      },
      include: {
        etudiant: true,
        psychologue: true,
      },
    });

    const userResponse: any = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      nom: updatedUser.nom,
      prenom: updatedUser.prenom || "",
      civilite: updatedUser.civilite || "",
      telephone: updatedUser.telephone,
      ville: updatedUser.ville,
      adresse: updatedUser.adresse,
      statut: updatedUser.statut ? "Actif" : "Inactif",
      etudiant: updatedUser.etudiant,
      psychologue: updatedUser.psychologue,
    };

    return userResponse;
  } catch (error) {
    console.error("Erreur dans updatedUser:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!user) {
      return; // Silently return for security
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000);

    await prisma.resetToken.upsert({
      where: { userId: user.id },
      update: { token: resetToken, expiresAt: tokenExpiry },
      create: { userId: user.id, token: resetToken, expiresAt: tokenExpiry },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const resetUrl = `${appUrl}api/auth/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL, // Changez EMAIL_USER à APP_EMAIL
        pass: process.env.APP_PASSWORD, // Changez EMAIL_PASSWORD à APP_PASSWORD
      },
    });

    await transporter.sendMail({
      from: `"CollPsy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <p>
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Réinitialiser votre mot de passe
            </a>
          </p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        </div>
      `,
    });

    console.log("Password reset email sent successfully to:", email);
  } catch (error) {
    console.error("Detailed error in sendPasswordResetEmail:", {
      error,
      email,
      emailUser: process.env.EMAIL_USER,
    });
    throw new Error("Échec de l'envoi de l'email de réinitialisation");
  }
}
export async function validateResetToken(
  token: string
): Promise<number | null> {
  try {
    const resetTokenRecord = await prisma.resetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
    });
    return resetTokenRecord ? resetTokenRecord.userId : null;
  } catch (error) {
    console.error("Erreur dans validateResetToken:", error);
    throw new Error("Échec de la validation du token");
  }
}

export async function updateUserPassword(userId: number, newPassword: string) {
  try {
    const hashedPassword = await hashPassword(newPassword);
    await prisma.$transaction(async (prisma) => {
      await prisma.utilisateur.update({
        where: { id: userId },
        data: { mot_de_passe: hashedPassword },
      });

      await prisma.resetToken.deleteMany({
        where: { userId },
      });
    });
  } catch (error) {
    console.error("Erreur dans updateUserPassword:", error);
    throw new Error("Échec de la mise à jour du mot de passe");
  }
}
