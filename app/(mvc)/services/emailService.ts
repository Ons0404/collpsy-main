import nodemailer from "nodemailer";
import { sendMailrdv } from "../lib/mailer";
import {compileAppointmentConfirmationTemplate }from "../lib/mailer";

// Configuration de Nodemailer avec un service SMTP (ici un exemple avec Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail", // ou utilisez un autre service SMTP
  auth: {
    user: process.env.EMAIL_USER, // L'adresse email d'envoi (ex: gmail)
    pass: process.env.EMAIL_PASSWORD, // Le mot de passe de l'email (ou token si 2FA)
  },
});

// Fonction pour envoyer l'email de confirmation
export async function sendActivationEmail(email: string, userName: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // L'email d'envoi
    to: email, // L'email du destinataire
    subject: "Votre compte a été activé",
    html: `
      <p>Bonjour ${userName},</p>
      <p>Nous vous informons que votre compte a été activé avec succès.</p>
      <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.</p>
      <p>Cordialement,</p>
      <p>L'équipe</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email de confirmation envoyé");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
  }
}
export const emailService = {
  sendAppointmentConfirmation: async (
    utilisateur: { prenom: string; nom: string; email: string },
    appointmentDetails: {
      date: string;
      heureDebut: string;
      heureFin: string;
      type: string;
    }
  ) => {
    const { date, heureDebut, heureFin, type } = appointmentDetails;

    const emailBody = compileAppointmentConfirmationTemplate(
      utilisateur.prenom,
      utilisateur.nom,
      date,
      heureDebut,
      heureFin,
      type
    );

    const result = await sendMailrdv({
      to: utilisateur.email,
      subject: "Confirmation de votre rendez-vous",
      body: emailBody,
    });

    return { success: result.success };
  },
};
// services/emailService.ts

type EmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailParams): Promise<void> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}