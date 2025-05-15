// controllers/psychologueController.ts
import { NextResponse } from "next/server";
import { PsychologueService } from "../services/psychologueService";

export class PsychologueController {
  private psychologueService: PsychologueService;

  constructor() {
    this.psychologueService = new PsychologueService();
  }

  async getPsychologues(request: Request) {
    try {
      // Extraire les paramètres de recherche
      const { searchParams } = new URL(request.url);

      // Normaliser les valeurs des paramètres en majuscules
      let serviceType = searchParams.get("serviceType");
      if (serviceType) {
        // Transformation de la valeur en format attendu
        if (serviceType.toLowerCase() === "en ligne") {
          serviceType = "EN_LIGNE";
        } else if (
          serviceType.toLowerCase() === "presentiel" ||
          serviceType.toLowerCase() === "présentiel"
        ) {
          serviceType = "PRESENTIEL";
        } else if (serviceType.toLowerCase() === "les deux") {
          serviceType = "LES_DEUX";
        }
      }

      const location = searchParams.get("location");
      const specialty = searchParams.get("specialty");

      // Valider les paramètres normalisés
      if (
        serviceType &&
        !["EN_LIGNE", "PRESENTIEL", "LES_DEUX"].includes(serviceType)
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid serviceType parameter. Must be EN_LIGNE, PRESENTIEL, or LES_DEUX",
          },
          { status: 400 }
        );
      }

      // Limiter la taille des réponses
      const limit = searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 10;
      const page = searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : 1;

      if (limit > 100) {
        return NextResponse.json(
          { error: "Limit cannot exceed 100 records per request" },
          { status: 400 }
        );
      }

      // Convertir page et limit en string
      const pageStr = page.toString();
      const limitStr = limit.toString();

      // Construire la requête de recherche pour les paramètres supplémentaires
      // Créer un nouvel objet URLSearchParams pour éviter les problèmes avec le paramètre serviceType original
      const searchParamsClone = new URLSearchParams();
      for (const [key, value] of searchParams.entries()) {
        if (key === "serviceType" && serviceType) {
          searchParamsClone.append(key, serviceType);
        } else {
          searchParamsClone.append(key, value);
        }
      }
      const query = searchParamsClone.toString();

      console.log("Normalized serviceType:", serviceType);
      console.log("Search query:", query);

      // Appeler le service pour récupérer les données avec les bons paramètres
      const psychologists = await this.psychologueService.findPsychologues(
        serviceType,
        location,
        specialty,
        pageStr,
        limitStr,
        query
      );

      // Retourner les résultats
      return NextResponse.json(psychologists);
    } catch (error) {
      console.error("Error fetching psychologists:", error);
      return NextResponse.json(
        { error: "Failed to fetch psychologists" },
        { status: 500 }
      );
    }
  }

  async getPsychologueById(request: Request, params: { id: string }) {
    try {
      const id = parseInt(params.id);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "Invalid ID format" },
          { status: 400 }
        );
      }

      // Utiliser la méthode getPsychologueById
      const psychologue = await this.psychologueService.getPsychologueById(id);

      if (!psychologue) {
        return NextResponse.json(
          { error: "Psychologue not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(psychologue);
    } catch (error) {
      console.error(`Error fetching psychologue with ID ${params.id}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch psychologue details" },
        { status: 500 }
      );
    }
  }

  async createPsychologue(request: Request) {
    try {
      const data = await request.json();

      // Normaliser mode_consultation si présent
      if (data.mode_consultation) {
        if (data.mode_consultation.toLowerCase() === "en ligne") {
          data.mode_consultation = "EN_LIGNE";
        } else if (
          data.mode_consultation.toLowerCase() === "presentiel" ||
          data.mode_consultation.toLowerCase() === "présentiel"
        ) {
          data.mode_consultation = "PRESENTIEL";
        } else if (data.mode_consultation.toLowerCase() === "les deux") {
          data.mode_consultation = "LES_DEUX";
        }
      }

      // Validation des données
      if (
        !data.nom ||
        !data.prenom ||
        !data.email ||
        !data.mot_de_passe ||
        !data.cin ||
        !data.titre ||
        !data.etablissement ||
        !data.intitule_diplome
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Vérifier le format de l'email avec une expression régulière simple
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Appeler le service pour créer le psychologue
      const result = await this.psychologueService.createPsychologue(data);
      return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
      console.error("Error creating psychologue:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create psychologue" },
        { status: 500 }
      );
    }
  }

  async updatePsychologue(request: Request, params: { id: string }) {
    try {
      const id = parseInt(params.id);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "Invalid ID format" },
          { status: 400 }
        );
      }

      const data = await request.json();

      // Normaliser mode_consultation si présent
      if (data.mode_consultation) {
        if (data.mode_consultation.toLowerCase() === "en ligne") {
          data.mode_consultation = "EN_LIGNE";
        } else if (
          data.mode_consultation.toLowerCase() === "presentiel" ||
          data.mode_consultation.toLowerCase() === "présentiel"
        ) {
          data.mode_consultation = "PRESENTIEL";
        } else if (data.mode_consultation.toLowerCase() === "les deux") {
          data.mode_consultation = "LES_DEUX";
        }
      }

      const result = await this.psychologueService.updatePsychologue(id, data);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`Error updating psychologue with ID ${params.id}:`, error);
      return NextResponse.json(
        { error: error.message || "Failed to update psychologue" },
        { status: 500 }
      );
    }
  }

  async deletePsychologue(request: Request, params: { id: string }) {
    try {
      const id = parseInt(params.id);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "Invalid ID format" },
          { status: 400 }
        );
      }

      const result = await this.psychologueService.deletePsychologue(id);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`Error deleting psychologue with ID ${params.id}:`, error);
      return NextResponse.json(
        { error: error.message || "Failed to delete psychologue" },
        { status: 500 }
      );
    }
  }
}
