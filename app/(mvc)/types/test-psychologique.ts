// src/types/test-psychologique.ts

export enum CategorieTest {
  ANXIETE = "ANXIETE",
  DEPRESSION = "DEPRESSION",
  STRESS = "STRESS",
  PERSONNALITE = "PERSONNALITE",
  ORIENTATION_PROFESSIONNELLE = "ORIENTATION_PROFESSIONNELLE",
  APPRENTISSAGE = "APPRENTISSAGE",
  TDAH = "TDAH",
  BIEN_ETRE = "BIEN_ETRE",
}

export enum TypeQuestion {
  CHOIX_UNIQUE = "CHOIX_UNIQUE",
  CHOIX_MULTIPLE = "CHOIX_MULTIPLE",
  ECHELLE_LIKERT = "ECHELLE_LIKERT",
  TEXTE_LIBRE = "TEXTE_LIBRE",
}

export interface OptionReponse {
  id: string;
  questionId: string;
  texte: string;
  valeur: number;
}

export interface Question {
  id: string;
  testId: string;
  texte: string;
  ordre: number;
  type: TypeQuestion;
  optionsReponse: OptionReponse[];
}

export interface TestPsychologique {
  id: string;
  titre: string;
  description?: string;
  categorie: CategorieTest;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
  dureeEstimee: number;
}

// Updated types/test-psychologique.ts file
export interface ReponseUtilisateur {
  id?: string;
  resultatId?: string;
  questionId: string;
  optionId?: string | null; // Changed to accept null
  texteLibre?: string | null; // Changed to accept null
  question?: Question;
  option?: OptionReponse | null; // Changed to accept null
}

export interface ResultatTest {
  id: string;
  testId: string;
  etudiantId: number;
  score: number;
  interpretation?: string | null; // Changed to accept null
  datePassation: Date;
  reponses: ReponseUtilisateur[];
  test?: TestPsychologique;
}
