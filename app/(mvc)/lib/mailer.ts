import nodemailer from "nodemailer";
import * as handlebars from "handlebars";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  APPOINTMENT_CONFIRMATION_TEMPLATE,
} from "../../../email/emailTemplate";

export async function sendMailrdv({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const { APP_PASSWORD, APP_EMAIL } = process.env;

  // Créer un transporteur Nodemailer pour Gmail
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // C'est parfois nécessaire pour éviter certains problèmes avec les certificats SSL
  },
});


  // Vérifier la connexion au service de messagerie
  try {
    const testResult = await transport.verify();
    console.log("Email service verified:", testResult);
  } catch (error) {
    console.error("Failed to verify email service:", error);
    return { success: false, error: "Failed to verify email service" };
  }

  // Essayer d'envoyer l'email
  try {
    const sendResult = await transport.sendMail({
      from: APP_EMAIL,
      to,
      subject,
      html: body,
    });
    console.log("Email sent successfully:", sendResult);
    return { success: true, sendResult };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export function compileForgetPasswordTemplate(resetToken: string) {
  const template = handlebars.compile(PASSWORD_RESET_REQUEST_TEMPLATE);
  const htmlBody = template({ resetURL: resetToken });
  return htmlBody;
}

export function compileEmailVerificationTemplate(verificationToken: string) {
  const template = handlebars.compile(VERIFICATION_EMAIL_TEMPLATE);
  const htmlBody = template({ verificationCode: verificationToken });
  return htmlBody;
}
// lib/mailer.ts
// Ajouter cette nouvelle fonction à votre fichier mailer.ts existant


// app/(mvc)/lib/mailer.ts

/**
 * Compile le template HTML pour l'email de confirmation de rendez-vous
 * @param prenom Prénom du patient
 * @param nom Nom du patient
 * @param date Date formatée du rendez-vous
 * @param heureDebut Heure de début du rendez-vous
 * @param heureFin Heure de fin du rendez-vous
 * @param typeConsultation Type de consultation (présentiel ou en ligne)
 * @returns Le contenu HTML du mail de confirmation
 */
export function compileAppointmentConfirmationTemplate(
  prenom: string,
  nom: string,
  date: string,
  heureDebut: string,
  heureFin: string,
  typeConsultation: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de rendez-vous - CollPsy</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #4a90e2;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .details {
          background-color: white;
          border-left: 3px solid #4a90e2;
          padding: 15px;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          padding: 10px;
          border-top: 1px solid #eee;
        }
        .button {
          background-color: #4a90e2;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Confirmation de rendez-vous</h1>
      </div>
      <div class="content">
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Nous avons le plaisir de vous confirmer votre rendez-vous :</p>
        
        <div class="details">
          <p><strong>Date :</strong> ${date}</p>
          <p><strong>Heure :</strong> de ${heureDebut} à ${heureFin}</p>
          <p><strong>Type de consultation :</strong> ${typeConsultation}</p>
        </div>
        
        ${typeConsultation.toLowerCase() === 'en ligne' ? `
        <p>Pour votre consultation en ligne, veuillez vous connecter à votre compte CollPsy 10 minutes avant l'heure prévue. Un lien pour rejoindre la consultation sera disponible dans votre espace personnel.</p>
        ` : `
        <p>Pour votre consultation en présentiel, veuillez vous présenter à l'adresse du cabinet 10 minutes avant l'heure prévue. Les informations sur le cabinet sont disponibles dans votre espace personnel.</p>
        `}
        
        <p>Si vous avez besoin d'annuler ou de reporter ce rendez-vous, veuillez le faire au moins 24 heures à l'avance via votre espace personnel ou en nous contactant directement.</p>
        
        <a href="https://www.collpsy.com/mon-compte/rendez-vous" class="button">Voir mes rendez-vous</a>
      </div>
      <div class="footer">
        <p>Ce message est généré automatiquement, merci de ne pas y répondre.</p>
        <p>© ${new Date().getFullYear()} CollPsy - Tous droits réservés</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Fonction pour envoyer un email
 * @param options Options pour l'envoi de l'email
 * @returns Résultat de l'envoi de l'email
 */
export async function sendMail(options: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    // Configuration pour l'envoi d'emails (à adapter selon votre service d'email)
    // Utilisation de Nodemailer ou autre service similaire
    // Exemple simplifié :
    
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"CollPsy" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.body,
    });
    

    // Simuler l'envoi d'un email pour cet exemple
    console.log("Email envoyé à:", options.to);
    console.log("Sujet:", options.subject);
    console.log("Contenu HTML généré avec succès");
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return { success: false, message: "Erreur lors de l'envoi de l'email" };
  }
}
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Créer un transporteur pour l'envoi des emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASSWORD || "password",
  },
});

/**
 * Envoie un email en utilisant la configuration définie
 * @param options Les options d'email (destinataire, sujet, contenu)
 * @returns Promise résolvant après l'envoi de l'email
 */
export async function sendMai(options: EmailOptions): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || "CollPsy <noreply@collpsy.com>",
    ...options,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${options.to}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}

// Pour tester la configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("Connexion SMTP réussie");
    return true;
  } catch (error) {
    console.error("Erreur de connexion SMTP:", error);
    return false;
  }
}