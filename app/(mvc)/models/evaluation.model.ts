// models/evaluation.model.ts
export interface Evaluation {
  id: string;
  consultationId: string;
  etudiantId: number;
  satisfaction: number; // 0-5
  empathie?: number; // 0-5
  ecoute?: number; // 0-5
  comprehension?: number; // 0-5
  recommandation?: number; // 0-5
  commentaires?: string;
  createdAt: Date;
  updatedAt: Date;
}
