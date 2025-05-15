import prisma from "../lib/prisma";
import { TypeConsultation } from "@prisma/client";

export interface DisponibiliteData {
  id?: number;
  date: string | Date;
  heure_debut: string;
  heure_fin: string;
  type: TypeConsultation;
  est_disponible?: boolean;
}

export class DisponibiliteModel {
  static async findByPsychologueId(
    psychologueId: number,
    startDate?: string | Date,
    endDate?: string | Date
  ) {
    const whereClause: any = { id_psychologue: psychologueId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    return await prisma.disponibilite.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });
  }

  static async findById(id: number) {
    return await prisma.disponibilite.findUnique({
      where: { id },
    });
  }

  static async create(psychologueId: number, data: DisponibiliteData) {
    return await prisma.disponibilite.create({
      data: {
        id_psychologue: psychologueId,
        date: new Date(data.date),
        heure_debut: data.heure_debut,
        heure_fin: data.heure_fin,
        type: this.mapTypeConsultation(data.type),
        est_disponible: data.est_disponible ?? true,
      },
    });
  }

  static async update(id: number, data: Partial<DisponibiliteData>) {
    return await prisma.disponibilite.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        heure_debut: data.heure_debut,
        heure_fin: data.heure_fin,
        type: data.type ? this.mapTypeConsultation(data.type) : undefined,
        est_disponible: data.est_disponible,
      },
    });
  }

  static async delete(id: number) {
    return await prisma.disponibilite.delete({
      where: { id },
    });
  }

  static mapTypeConsultation(
    type: string | TypeConsultation
  ): TypeConsultation {
    if (typeof type !== "string") return type; // If already a TypeConsultation, return it
    switch (type) {
      case "Présentiel":
        return TypeConsultation.PRESENTIEL;
      case "En ligne":
        return TypeConsultation.EN_LIGNE;
      default:
        throw new Error("Type de consultation invalide");
    }
  }
}
