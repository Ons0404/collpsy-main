// app/(mvc)/utils/formatters.ts
export const dateFormatter = {
  formatDate: (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  },
};
// Fonction pour analyser les types de séance
export function getSessionTypes(mode: string): string[] {
  switch (mode) {
    case "EN_LIGNE":
      return ["EN_LIGNE"];
    case "PRESENTIEL":
      return ["PRESENTIEL"];
    case "LES_DEUX":
      return ["EN_LIGNE", "PRESENTIEL"];
    default:
      return ["LES_DEUX"];
  }
}
// Fonction pour formater les disponibilités
export function formatAvailabilities(disponibilites: any[]): any[] {
  return disponibilites.map((dispo) => {
    const date = new Date(dispo.date);
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const months = [
      "jan", "fev", "mar", "avr", "mai", "juin", 
      "juil", "aout", "sep", "oct", "nov", "dec"
    ];

    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      id: dispo.id,
      heure_debut: dispo.heure_debut,
      heure_fin: dispo.heure_fin,
      type: dispo.type,
    };
  });
}