import { NextResponse } from "next/server";
import {
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  getUserDisponibilities,
  createDisponibility,
  updateDisponibility,
  deleteDisponibility,
  getUserAppointments,
  updateAppointmentStatus,
} from "../services/dashboardService";

// Pour récupérer le profil utilisateur
export async function getUserById(userId: number) {
  try {
    const user = await getUserProfile(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé." },
        { status: 404 }
      );
    }

    // Formater les données pour le frontend
    const formattedUser = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      date_naissance: user.date_naissance
        ? user.date_naissance.toISOString()
        : undefined,
      adresse: user.adresse || "",
      ville: user.ville || "",
      code_postal: user.code_postal || "",
      telephone: user.telephone || "",
      role: user.role,
      civilite: user.civilite,
      avatar: user.avatar ? Buffer.from(user.avatar).toString("base64") : null,
      statut: user.statut,
      etudiant: user.etudiant
        ? {
            id_etudiant: user.etudiant.id_etudiant,
            numero_carte_etudiant: user.etudiant.numero_carte_etudiant,
            niveau: user.etudiant.niveau,
            etablissement: user.etudiant.etablissement,
          }
        : undefined,
      psychologue: user.psychologue
        ? {
            id_psychologue: user.psychologue.id_psychologue,
            cin: user.psychologue.cin,
            titre: user.psychologue.titre,
            etablissement: user.psychologue.etablissement,
            adresse_cabinet: user.psychologue.adresse_cabinet || "",
            intitule_diplome: user.psychologue.intitule_diplome,
            date_obtention: user.psychologue.date_obtention
              ? user.psychologue.date_obtention.toISOString()
              : undefined,
            mode_consultation: user.psychologue.mode_consultation || "",
          }
        : undefined,
    };

    return NextResponse.json({ user: formattedUser }, { status: 200 });
  } catch (err) {
    console.error("Erreur lors de la récupération de l'utilisateur:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// Pour mettre à jour le profil utilisateur
export async function updateUser(userId: number, userData: any) {
  try {
    // Vérifier si nous mettons à jour l'avatar ou le profil complet
    if (userData.avatar && Object.keys(userData).length === 1) {
      const updatedUserProfile = await updateUserAvatar(
        userId,
        userData.avatar
      );

      if (!updatedUserProfile) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé." },
          { status: 404 }
        );
      }

      // Formater l'utilisateur mis à jour
      const formattedUser = {
        id: updatedUserProfile.id,
        nom: updatedUserProfile.nom,
        prenom: updatedUserProfile.prenom,
        email: updatedUserProfile.email,
        avatar: updatedUserProfile.avatar
          ? Buffer.from(updatedUserProfile.avatar).toString("base64")
          : null,
        date_naissance: updatedUserProfile.date_naissance
          ? updatedUserProfile.date_naissance.toISOString()
          : undefined,
        adresse: updatedUserProfile.adresse || "",
        ville: updatedUserProfile.ville || "",
        code_postal: updatedUserProfile.code_postal || "",
        telephone: updatedUserProfile.telephone || "",
        role: updatedUserProfile.role,
        civilite: updatedUserProfile.civilite,
        statut: updatedUserProfile.statut,
      };

      return NextResponse.json({ user: formattedUser }, { status: 200 });
    } else {
      // Gérer la structure spécifique du frontend pour les données du psychologue
      if (userData.psychologue) {
        // S'assurer que le tarif est converti en nombre (si applicable)
        if (userData.psychologue.tarif) {
          userData.psychologue.tarif = Number(userData.psychologue.tarif);
        }
      }

      // Mise à jour du profil complet
      const updatedUserProfile = await updateUserProfile(userId, userData);

      if (!updatedUserProfile) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé." },
          { status: 404 }
        );
      }

      // Formater les données de la même manière que dans la méthode GET
      const formattedUser = {
        id: updatedUserProfile.id,
        nom: updatedUserProfile.nom,
        prenom: updatedUserProfile.prenom,
        email: updatedUserProfile.email,
        date_naissance: updatedUserProfile.date_naissance
          ? updatedUserProfile.date_naissance.toISOString()
          : undefined,
        adresse: updatedUserProfile.adresse || "",
        ville: updatedUserProfile.ville || "",
        code_postal: updatedUserProfile.code_postal || "",
        telephone: updatedUserProfile.telephone || "",
        role: updatedUserProfile.role,
        civilite: updatedUserProfile.civilite,
        avatar: updatedUserProfile.avatar
          ? Buffer.from(updatedUserProfile.avatar).toString("base64")
          : null,
        statut: updatedUserProfile.statut,
        etudiant: updatedUserProfile.etudiant
          ? {
              id_etudiant: updatedUserProfile.etudiant.id_etudiant,
              numero_carte_etudiant:
                updatedUserProfile.etudiant.numero_carte_etudiant,
              niveau: updatedUserProfile.etudiant.niveau,
              etablissement: updatedUserProfile.etudiant.etablissement,
            }
          : undefined,
        psychologue: updatedUserProfile.psychologue
          ? {
              id_psychologue: updatedUserProfile.psychologue.id_psychologue,
              cin: updatedUserProfile.psychologue.cin,
              titre: updatedUserProfile.psychologue.titre,
              etablissement: updatedUserProfile.psychologue.etablissement,
              adresse_cabinet:
                updatedUserProfile.psychologue.adresse_cabinet || "",
              intitule_diplome: updatedUserProfile.psychologue.intitule_diplome,
              date_obtention: updatedUserProfile.psychologue.date_obtention
                ? updatedUserProfile.psychologue.date_obtention.toISOString()
                : undefined,
              mode_consultation:
                updatedUserProfile.psychologue.mode_consultation || "",
            }
          : undefined,
      };

      return NextResponse.json({ user: formattedUser }, { status: 200 });
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour du profil:", err);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

// Pour récupérer les disponibilités d'un psychologue
export async function getDisponibilities(psychologueId: number) {
  try {
    const disponibilities = await getUserDisponibilities(psychologueId);

    // Formater les disponibilités pour le frontend
    const formattedDisponibilities = disponibilities.map((dispo) => ({
      id: dispo.id,
      date: dispo.date.toISOString().split("T")[0],
      heure_debut: dispo.heure_debut,
      heure_fin: dispo.heure_fin,
      type: dispo.type,
      est_disponible: dispo.est_disponible,
    }));

    return NextResponse.json(
      { disponibilities: formattedDisponibilities },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la récupération des disponibilités:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// Pour créer une nouvelle disponibilité
export async function addDisponibility(
  psychologueId: number,
  disponibilityData: any
) {
  try {
    const newDisponibility = await createDisponibility(
      psychologueId,
      disponibilityData
    );

    if (!newDisponibility) {
      return NextResponse.json(
        { error: "Erreur lors de la création de la disponibilité." },
        { status: 400 }
      );
    }

    const formattedDisponibility = {
      id: newDisponibility.id,
      date: newDisponibility.date.toISOString().split("T")[0],
      heure_debut: newDisponibility.heure_debut,
      heure_fin: newDisponibility.heure_fin,
      type: newDisponibility.type,
      est_disponible: newDisponibility.est_disponible,
    };

    return NextResponse.json(
      { disponibility: formattedDisponibility },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erreur lors de la création de la disponibilité:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// Pour mettre à jour une disponibilité
export async function modifyDisponibility(
  disponibilityId: number,
  disponibilityData: any
) {
  try {
    const updatedDisponibility = await updateDisponibility(
      disponibilityId,
      disponibilityData
    );

    if (!updatedDisponibility) {
      return NextResponse.json(
        { error: "Disponibilité non trouvée." },
        { status: 404 }
      );
    }

    const formattedDisponibility = {
      id: updatedDisponibility.id,
      date: updatedDisponibility.date.toISOString().split("T")[0],
      heure_debut: updatedDisponibility.heure_debut,
      heure_fin: updatedDisponibility.heure_fin,
      type: updatedDisponibility.type,
      est_disponible: updatedDisponibility.est_disponible,
    };

    return NextResponse.json(
      { disponibility: formattedDisponibility },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// Pour supprimer une disponibilité
export async function removeDisponibility(disponibilityId: number) {
  try {
    const deleted = await deleteDisponibility(disponibilityId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Disponibilité non trouvée." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Disponibilité supprimée avec succès." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la suppression de la disponibilité:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// Pour récupérer les rendez-vous d'un utilisateur (psychologue ou étudiant)
export async function getAppointments(userId: number, userRole: string) {
  try {
    const appointments = await getUserAppointments(userId, userRole);

    // Formater les rendez-vous pour le frontend
    const formattedAppointments = appointments.map((rdv) => ({
      id: rdv.id,
      date: rdv.date.toISOString().split("T")[0],
      heure_debut: rdv.heure_debut,
      heure_fin: rdv.heure_fin,
      type: rdv.type,
      statut: rdv.statut,
      createdAt: rdv.createdAt.toISOString(),
      updatedAt: rdv.updatedAt.toISOString(),
      psychologue: {
        id: rdv.psychologue.id_psychologue,
        nom: rdv.psychologue.utilisateur.nom,
        prenom: rdv.psychologue.utilisateur.prenom,
      },
      patient: {
        id: rdv.utilisateur.id,
        nom: rdv.utilisateur.nom,
        prenom: rdv.utilisateur.prenom,
      },
    }));

    return NextResponse.json(
      { appointments: formattedAppointments },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la récupération des rendez-vous:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// Pour mettre à jour le statut d'un rendez-vous
export async function updateAppointment(appointmentId: number, status: string) {
  try {
    const updatedAppointment = await updateAppointmentStatus(
      appointmentId,
      status
    );

    if (!updatedAppointment) {
      return NextResponse.json(
        { error: "Rendez-vous non trouvé." },
        { status: 404 }
      );
    }

    const formattedAppointment = {
      id: updatedAppointment.id,
      date: updatedAppointment.date.toISOString().split("T")[0],
      heure_debut: updatedAppointment.heure_debut,
      heure_fin: updatedAppointment.heure_fin,
      type: updatedAppointment.type,
      statut: updatedAppointment.statut,
      createdAt: updatedAppointment.createdAt.toISOString(),
      updatedAt: updatedAppointment.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { appointment: formattedAppointment },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
