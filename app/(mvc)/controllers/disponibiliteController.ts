import { NextResponse } from "next/server";
import prisma from "../lib/prisma"; // Ajuste ce chemin selon ton projet

// Interface pour typer les données de mise à jour
interface DisponibiliteData {
  id: number;
  date?: string;
  heure_debut?: string;
  heure_fin?: string;
  type?: "PRESENTIEL" | "EN_LIGNE" | "LES_DEUX";
  est_disponible?: boolean;
}

export class DisponibiliteController {
  static async getDisponibilites(
    userId: number,
    startDate: string | null,
    endDate: string | null
  ) {
    try {
      // Validation des paramètres
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: "startDate and endDate are required" },
          { status: 400 }
        );
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 }
        );
      }

      // Récupérer les disponibilités
      const availabilities = await prisma.disponibilite.findMany({
        where: {
          id_psychologue: userId,
          date: {
            gte: start,
            lte: end,
          },
          est_disponible: true,
        },
        select: {
          id: true,
          date: true,
          heure_debut: true,
          heure_fin: true,
          type: true,
          est_disponible: true,
        },
      });

      return NextResponse.json(availabilities, { status: 200 });
    } catch (error: unknown) {
      console.error(`Error in getDisponibilites for user ${userId}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "Failed to fetch availabilities", details: errorMessage },
        { status: 500 }
      );
    }
  }

  static async createDisponibilite(userId: number, body: any) {
    try {
      const { date, heure_debut, heure_fin, type } = body;

      if (!date || !heure_debut || !heure_fin || !type) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Validation du type
      if (!["PRESENTIEL", "EN_LIGNE", "LES_DEUX"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid consultation type" },
          { status: 400 }
        );
      }

      const disponibilite = await prisma.disponibilite.create({
        data: {
          id_psychologue: userId,
          date: new Date(date),
          heure_debut,
          heure_fin,
          type,
          est_disponible: true,
        },
      });

      return NextResponse.json(disponibilite, { status: 201 });
    } catch (error: unknown) {
      console.error(`Error in createDisponibilite for user ${userId}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "Failed to create availability", details: errorMessage },
        { status: 500 }
      );
    }
  }

  static async updateDisponibilite(userId: number, data: DisponibiliteData) {
    try {
      const { id, date, heure_debut, heure_fin, type, est_disponible } = data;

      if (!id) {
        return NextResponse.json(
          { error: "Missing availability ID" },
          { status: 400 }
        );
      }

      // Vérifier que la disponibilité existe
      const disponibilite = await prisma.disponibilite.findUnique({
        where: { id },
      });

      if (!disponibilite) {
        return NextResponse.json(
          { error: "Availability not found" },
          { status: 404 }
        );
      }

      // Vérifier que l'utilisateur est autorisé (id_psychologue correspond)
      if (disponibilite.id_psychologue !== userId) {
        return NextResponse.json(
          { error: "You are not authorized to update this availability" },
          { status: 403 }
        );
      }

      // Validation que l'heure de fin est après l'heure de début (si fournie)
      if (heure_debut && heure_fin && heure_debut >= heure_fin) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }

      // Validation du type si fourni
      if (type && !["PRESENTIEL", "EN_LIGNE", "LES_DEUX"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid consultation type" },
          { status: 400 }
        );
      }

      const updatedDisponibilite = await prisma.disponibilite.update({
        where: { id },
        data: {
          date: date ? new Date(date) : undefined,
          heure_debut: heure_debut || undefined,
          heure_fin: heure_fin || undefined,
          type: type || undefined,
          est_disponible:
            est_disponible !== undefined ? est_disponible : undefined,
        },
      });

      return NextResponse.json(updatedDisponibilite, { status: 200 });
    } catch (error: unknown) {
      console.error(`Error in updateDisponibilite for user ${userId}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "Failed to update availability", details: errorMessage },
        { status: 500 }
      );
    }
  }

  static async deleteDisponibilite(userId: number, disponibiliteId: number) {
    try {
      // Vérifier que la disponibilité existe
      const disponibilite = await prisma.disponibilite.findUnique({
        where: { id: disponibiliteId },
      });

      if (!disponibilite) {
        return NextResponse.json(
          { error: "Availability not found" },
          { status: 404 }
        );
      }

      // Vérifier que l'utilisateur est autorisé (id_psychologue correspond)
      if (disponibilite.id_psychologue !== userId) {
        return NextResponse.json(
          { error: "You are not authorized to delete this availability" },
          { status: 403 }
        );
      }

      await prisma.disponibilite.delete({
        where: { id: disponibiliteId },
      });

      return NextResponse.json(
        { message: "Availability deleted successfully" },
        { status: 200 }
      );
    } catch (error: unknown) {
      console.error(`Error in deleteDisponibilite for user ${userId}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "Failed to delete availability", details: errorMessage },
        { status: 500 }
      );
    }
  }
}
