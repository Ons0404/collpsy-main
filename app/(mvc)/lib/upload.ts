// utils/upload.ts
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_upload_preset"); // Remplacez par votre upload preset

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/your_cloud_name/upload", // Remplacez par votre cloud name
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur lors de l'upload: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url; // Retourne l'URL sécurisée du fichier uploadé
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error);
    throw error; // Propage l'erreur pour la gestion ultérieure
  }
};
