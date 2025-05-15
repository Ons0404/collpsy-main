// app/(mvc)/controllers/authController.ts
import { NextResponse } from "next/server";
import prisma from "../lib/prisma";
import { compare } from "bcrypt";

interface UserData {
  id: number;
  email: string;
  role: string;
  nom: string;
  prenom: string;
  civilite: string;
  telephone: string | null;
  ville: string | null;
  adresse: string | null;
  statut: string;
  etudiant?: {
    id_etudiant: number;
    numero_carte_etudiant: string;
    niveau: string;
    etablissement: string;
  };
  psychologue?: {
    id_psychologue: number;
    cin: string;
    titre: string;
    etablissement: string;
  };
}

interface AdminData {
  id: number;
  email: string;
}

async function findAdminByEmail(email: string) {
  return prisma.administrateur.findUnique({
    where: { email },
  });
}

async function findUserByEmail(email: string) {
  return prisma.utilisateur.findUnique({
    where: { email },
    include: {
      etudiant: true,
      psychologue: true,
    },
  });
}

async function createSessionForAdmin(adminId: number): Promise<string> {
  const sessionExpiryHours = 24;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + sessionExpiryHours);

  try {
    const newSession = await prisma.session.create({
      data: {
        administrateurId: adminId,
        expiresAt,
      },
    });
    return newSession.id.toString();
  } catch (error) {
    console.error("Error creating admin session:", error);
    throw new Error("Impossible de créer une session administrateur");
  }
}

async function createSessionForUser(userId: number): Promise<string> {
  const sessionExpiryHours = 24;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + sessionExpiryHours);

  try {
    const newSession = await prisma.session.create({
      data: {
        userId,
        expiresAt,
      },
    });
    return newSession.id.toString();
  } catch (error) {
    console.error("Error creating user session:", error);
    throw new Error("Impossible de créer une session utilisateur");
  }
}

export async function loginUser(email: string, password: string) {
  try {
    // Check for admin first
    const admin = await findAdminByEmail(email);
    if (admin) {
      // Verify password (plain text for now; see Step 2 for hashing)
      if (admin.mot_de_passe !== password) {
        console.log("Admin password incorrect");
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect." },
          { status: 401 }
        );
      }

      const adminData: AdminData = { id: admin.id, email: admin.email };
      const sessionToken = await createSessionForAdmin(admin.id);

      const response = NextResponse.json(
        {
          success: true,
          user: adminData,
          role: "ADMIN",
          sessionToken,
        },
        { status: 200 }
      );

      console.log("Setting cookies for admin:", admin.id);
      response.cookies.set({
        name: "sessionToken",
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      response.cookies.set({
        name: "adminId",
        value: admin.id.toString(),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    }

    // Check for regular user
    const user = await findUserByEmail(email);
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Verify password (bcrypt for users)
    if (!(await compare(password, user.mot_de_passe))) {
      console.log("User password incorrect for email:", email);
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    if (!user.statut) {
      console.log("User account not active:", email);
      return NextResponse.json(
        {
          error:
            "Votre compte n'est pas encore actif. Veuillez attendre l'activation par l'administrateur.",
        },
        { status: 403 }
      );
    }

    const sessionToken = await createSessionForUser(user.id);

    const userData: UserData = {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom || "",
      civilite: user.civilite || "",
      telephone: user.telephone,
      ville: user.ville,
      adresse: user.adresse,
      statut: user.statut ? "Actif" : "Inactif",
      etudiant:
        user.role === "ETUDIANT" && user.etudiant
          ? {
              id_etudiant: user.etudiant.id_etudiant,
              numero_carte_etudiant: user.etudiant.numero_carte_etudiant,
              niveau: user.etudiant.niveau,
              etablissement: user.etudiant.etablissement,
            }
          : undefined,
      psychologue:
        user.role === "PSYCHOLOGUE" && user.psychologue
          ? {
              id_psychologue: user.psychologue.id_psychologue,
              cin: user.psychologue.cin,
              titre: user.psychologue.titre,
              etablissement: user.psychologue.etablissement,
            }
          : undefined,
    };

    const response = NextResponse.json(
      {
        success: true,
        user: userData,
        role: user.role,
        sessionToken,
      },
      { status: 200 }
    );

    console.log("Setting cookies for user:", user.id, "Role:", user.role);
    response.cookies.set({
      name: "sessionToken",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    response.cookies.set({
      name: "userId",
      value: user.id.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    response.cookies.set({
      name: "userRole",
      value: user.role,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
// Other functions (unchanged from previous version)
export async function updateAvatar(userId: number, avatarBase64: string) {
  try {
    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: { avatar: Buffer.from(avatarBase64, "base64") },
    });
    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

export async function registerUser(userData: any) {
  try {
    const errors = []; // Implement validation logic
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const newUser = await prisma.utilisateur.create({
      data: {
        ...userData,
        mot_de_passe: await (
          await import("bcrypt")
        ).hash(userData.mot_de_passe, 10),
      },
    });
    return NextResponse.json(
      { success: true, user: newUser, userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

export async function resetPasswordRequest(email: string) {
  try {
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Implement reset logic
    return NextResponse.json(
      {
        message:
          "Si cette adresse est associée à un compte, un email a été envoyé",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in resetPasswordRequest:", error);
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "Token de réinitialisation invalide" },
        { status: 400 }
      );
    }

    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Implement reset logic
    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return NextResponse.json(
      { message: "Erreur lors de la réinitialisation du mot de passe" },
      { status: 500 }
    );
  }
}
