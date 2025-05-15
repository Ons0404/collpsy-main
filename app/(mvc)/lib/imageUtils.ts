import fs from "fs";
import path from "path";

/**
 * Convertit une image en Base64
 * @param file Fichier à convertir
 * @returns Promesse avec la chaîne Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Sauvegarde une image Base64 sur le disque
 * @param base64String Chaîne Base64 de l'image
 * @param uploadDir Répertoire où sauvegarder l'image
 * @param prefix Préfixe pour le nom de fichier
 * @returns Chemin où l'image a été sauvegardée
 */
export async function saveBase64Image(
  base64String: string,
  uploadDir: string = "public/uploads",
  prefix: string = "img"
): Promise<string> {
  // Vérifier si la chaîne est bien au format base64
  if (!base64String || !base64String.includes("base64")) {
    return "";
  }

  try {
    // Extraire le type MIME et les données
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new Error("Format Base64 invalide");
    }

    const type = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // Déterminer l'extension de fichier en fonction du type MIME
    let extension = "jpg";
    if (type.includes("jpeg")) extension = "jpg";
    else if (type.includes("png")) extension = "png";
    else if (type.includes("gif")) extension = "gif";
    else if (type.includes("pdf")) extension = "pdf";

    // Créer le répertoire de téléchargement s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileName = `${prefix}_${Date.now()}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Écrire le fichier
    fs.writeFileSync(filePath, buffer);

    // Retourner le chemin relatif
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'image:", error);
    return "";
  }
}

/**
 * Vérifie si une chaîne est une image Base64 valide
 * @param str Chaîne à vérifier
 * @returns true si la chaîne est une image Base64 valide
 */
export function isValidBase64Image(str: string): boolean {
  if (!str || typeof str !== "string") return false;

  // Expression régulière pour vérifier le format base64 d'une image
  const regex = /^data:image\/(jpeg|jpg|png|gif);base64,([A-Za-z0-9+/=])+$/;
  return regex.test(str);
}
