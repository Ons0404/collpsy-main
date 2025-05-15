export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  civilite: "M" | "Mme";
  dateNaissance: string;
  ville?: string;
  adresse: string; // Add adresse as a required field
  telephone?: string;
  role: "ETUDIANT" | "PSYCHOLOGUE";
  profileImage?: string;
  // Champs spécifiques à l'étudiant
  numeroCarteEtudiant?: string;
  niveau?: string;
  etablissementEtudiant?: string;
  // Champs spécifiques au psychologue
  cin?: string;
  titre?: string;
  etablissementPsy?: string;
  adresseCabinet?: string;
  intituleDiplome?: string;
  dateObtentionDiplome?: string;
  modeConsultation?: string;
  diplomeFile?: string;
}
