import prisma from "../../(mvc)/lib/prisma";
import { sendMai } from "../lib/mailer"; // Fixed typo: sendMail -> sendMai
import { Consultation } from "../../(mvc)/types/index";

export const notificationService = {
  // Notifier le psychologue d'une nouvelle demande de consultation
  async notifyNewConsultation(consultationId: number) {
    const consultation = await prisma.rendezVous.findUnique({
      where: { id: consultationId },
      include: {
        utilisateur: true, // Étudiant
        psychologue: {
          include: {
            utilisateur: true, // Psychologue
          },
        },
      },
    });

    if (!consultation) return;

    // Email au psychologue
    await sendMai({
      to: consultation.psychologue.utilisateur.email,
      subject: "Nouvelle demande de consultation",
      text: `Bonjour ${consultation.psychologue.utilisateur.prenom},
      
      Vous avez reçu une nouvelle demande de consultation de la part de ${
        consultation.utilisateur.prenom
      } ${consultation.utilisateur.nom} pour le ${formatDate(
        consultation.date
      )}.
      
      Veuillez vous connecter à votre espace personnel pour confirmer ou refuser cette demande.`,
      html: `<p>Bonjour ${consultation.psychologue.utilisateur.prenom},</p>
      <p>Vous avez reçu une nouvelle demande de consultation de la part de ${
        consultation.utilisateur.prenom
      } ${consultation.utilisateur.nom} pour le ${formatDate(
        consultation.date
      )}.</p>
      <p>Veuillez vous connecter à votre espace personnel pour confirmer ou refuser cette demande.</p>`,
    });

    // Ajouter une notification dans la base de données si nécessaire
  },

  // Notifier l'étudiant de la confirmation d'une consultation
  async notifyConsultationConfirmed(consultationId: number) {
    const consultation = await prisma.rendezVous.findUnique({
      where: { id: consultationId },
      include: {
        utilisateur: true, // Étudiant
        psychologue: {
          include: {
            utilisateur: true, // Psychologue
          },
        },
      },
    });

    if (!consultation) return;

    // Email à l'étudiant
    await sendMai({
      to: consultation.utilisateur.email,
      subject: "Consultation confirmée",
      text: `Bonjour ${consultation.utilisateur.prenom},
      
      Votre consultation avec ${consultation.psychologue.utilisateur.prenom} ${
        consultation.psychologue.utilisateur.nom
      } pour le ${formatDate(consultation.date)} a été confirmée.
      
      ${getConsultationInstructions(consultation.type)}`,
      html: `<p>Bonjour ${consultation.utilisateur.prenom},</p>
      <p>Votre consultation avec ${
        consultation.psychologue.utilisateur.prenom
      } ${consultation.psychologue.utilisateur.nom} pour le ${formatDate(
        consultation.date
      )} a été confirmée.</p>
      <p>${getConsultationInstructions(consultation.type)}</p>`,
    });
  },

  // Notifier d'un rappel de consultation (24h avant)
  async sendConsultationReminder(consultationId: number) {
    const consultation = await prisma.rendezVous.findUnique({
      where: { id: consultationId },
      include: {
        utilisateur: true, // Étudiant
        psychologue: {
          include: {
            utilisateur: true, // Psychologue
          },
        },
      },
    });

    if (!consultation) return;

    // Email à l'étudiant
    await sendMai({
      to: consultation.utilisateur.email,
      subject: "Rappel de consultation",
      text: `Bonjour ${consultation.utilisateur.prenom},
      
      Nous vous rappelons votre consultation avec ${
        consultation.psychologue.utilisateur.prenom
      } ${
        consultation.psychologue.utilisateur.nom
      } prévue pour demain, le ${formatDate(consultation.date)}.
      
      ${getConsultationInstructions(consultation.type)}`,
      html: `<p>Bonjour ${consultation.utilisateur.prenom},</p>
      <p>Nous vous rappelons votre consultation avec ${
        consultation.psychologue.utilisateur.prenom
      } ${
        consultation.psychologue.utilisateur.nom
      } prévue pour demain, le ${formatDate(consultation.date)}.</p>
      <p>${getConsultationInstructions(consultation.type)}</p>`,
    });

    // Email au psychologue
    await sendMai({
      to: consultation.psychologue.utilisateur.email,
      subject: "Rappel de consultation",
      text: `Bonjour ${consultation.psychologue.utilisateur.prenom},
      
      Nous vous rappelons votre consultation avec ${
        consultation.utilisateur.prenom
      } ${consultation.utilisateur.nom} prévue pour demain, le ${formatDate(
        consultation.date
      )}.`,
      html: `<p>Bonjour ${consultation.psychologue.utilisateur.prenom},</p>
      <p>Nous vous rappelons votre consultation avec ${
        consultation.utilisateur.prenom
      } ${consultation.utilisateur.nom} prévue pour demain, le ${formatDate(
        consultation.date
      )}.</p>`,
    });
  },

  // Notifier d'une annulation de consultation
  async notifyCancellation(
    consultationId: number,
    cancelledBy: "student" | "psychologist"
  ) {
    const consultation = await prisma.rendezVous.findUnique({
      where: { id: consultationId },
      include: {
        utilisateur: true, // Étudiant
        psychologue: {
          include: {
            utilisateur: true, // Psychologue
          },
        },
      },
    });

    if (!consultation) return;

    if (cancelledBy === "student") {
      // Notifier le psychologue
      await sendMai({
        to: consultation.psychologue.utilisateur.email,
        subject: "Annulation de consultation",
        text: `Bonjour ${consultation.psychologue.utilisateur.prenom},
        
        La consultation prévue avec ${consultation.utilisateur.prenom} ${
          consultation.utilisateur.nom
        } pour le ${formatDate(
          consultation.date
        )} a été annulée par l'étudiant.`,
        html: `<p>Bonjour ${consultation.psychologue.utilisateur.prenom},</p>
        <p>La consultation prévue avec ${consultation.utilisateur.prenom} ${
          consultation.utilisateur.nom
        } pour le ${formatDate(
          consultation.date
        )} a été annulée par l'étudiant.</p>`,
      });
    } else {
      // Notifier l'étudiant
      await sendMai({
        to: consultation.utilisateur.email,
        subject: "Annulation de consultation",
        text: `Bonjour ${consultation.utilisateur.prenom},
        
        La consultation prévue avec ${
          consultation.psychologue.utilisateur.prenom
        } ${consultation.psychologue.utilisateur.nom} pour le ${formatDate(
          consultation.date
        )} a été annulée par le psychologue.
        
        Vous pouvez planifier une nouvelle consultation avec un autre psychologue disponible.`,
        html: `<p>Bonjour ${consultation.utilisateur.prenom},</p>
        <p>La consultation prévue avec ${
          consultation.psychologue.utilisateur.prenom
        } ${consultation.psychologue.utilisateur.nom} pour le ${formatDate(
          consultation.date
        )} a été annulée par le psychologue.</p>
        <p>Vous pouvez planifier une nouvelle consultation avec un autre psychologue disponible.</p>`,
      });
    }
  },
};

// Fonctions utilitaires
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getConsultationInstructions(type: string): string {
  switch (type) {
    case "VIDEO":
      return `Pour accéder à votre consultation vidéo, connectez-vous à votre espace personnel 5 minutes avant l'heure prévue et cliquez sur le lien de consultation.`;
    case "CHAT":
      return `Pour accéder à votre consultation par chat, connectez-vous à votre espace personnel à l'heure prévue et ouvrez la conversation avec votre psychologue.`;
    case "IN_PERSON":
      return `Votre consultation se déroulera en personne. Veuillez vous présenter à l'adresse indiquée 10 minutes avant l'heure prévue.`;
    default:
      return "";
  }
}
