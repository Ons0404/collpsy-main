import prisma from "../../(mvc)/lib/prisma";
import type {
  Consultation,
  CreateConsultationData,
} from "../../(mvc)/types/index";
import { ConsultationStatus, TypeConsultation } from "@prisma/client";

export const consultationService = {
  async getStudentConsultations(studentId: number) {
    return prisma.rendezVous.findMany({
      where: { id_utilisateur: studentId },
      include: {
        psychologue: {
          include: {
            utilisateur: {
              select: {
                prenom: true,
                nom: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  async getPsychologistConsultations(psychologistId: number) {
    return prisma.rendezVous.findMany({
      where: { id_psychologue: psychologistId },
      include: {
        utilisateur: {
          select: {
            prenom: true,
            nom: true,
            email: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  async getConsultation(consultationId: number) {
    return prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        etudiant: true,
        psychologue: {
          include: {
            utilisateur: true,
          },
        },
        messages: {
          orderBy: { sentAt: "asc" },
        },
      },
    });
  },

  async getConsultationByRendezVousId(rendezVousId: number) {
    return prisma.consultation.findFirst({
      where: { rendezVousId },
    });
  },

  async createConsultation(data: CreateConsultationData) {
    if (data.rendezVousId) {
      const existingConsultation = await this.getConsultationByRendezVousId(
        data.rendezVousId
      );
      if (existingConsultation) {
        throw new Error("A consultation already exists for this rendezVousId");
      }
    }

    return prisma.consultation.create({
      data: {
        etudiant: { connect: { id_etudiant: data.etudiantId } },
        psychologue: {
          connect: { id_psychologue: Number(data.psychologistId) },
        },
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type as TypeConsultation,
        status: (data.status as ConsultationStatus) || "REQUESTED",
        notes: data.notes,
        roomId: data.roomId || generateRoomId(),
        rendezVous: data.rendezVousId
          ? { connect: { id: Number(data.rendezVousId) } }
          : undefined,
      },
    });
  },

  async updateConsultation(rendezVousId: number, data: CreateConsultationData) {
    const existingConsultation = await this.getConsultationByRendezVousId(
      rendezVousId
    );
    if (!existingConsultation) {
      throw new Error("No consultation found for this rendezVousId");
    }

    return prisma.consultation.update({
      where: { id: existingConsultation.id },
      data: {
        etudiant: { connect: { id_etudiant: data.etudiantId } },
        psychologue: {
          connect: { id_psychologue: Number(data.psychologistId) },
        },
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type as TypeConsultation,
        status: data.status as ConsultationStatus,
        notes: data.notes,
        roomId: data.roomId || existingConsultation.roomId,
      },
    });
  },

  async updateConsultationStatus(
    consultationId: number,
    status: ConsultationStatus
  ) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: { status },
    });
  },

  async addSummary(consultationId: number, summary: string) {
    return prisma.consultation.update({
      where: { id: consultationId },
      data: { summary },
    });
  },

  async checkAvailability(
    psychologueId: number,
    startTime: Date,
    endTime: Date,
    rendezVousId?: number
  ): Promise<boolean> {
    const overlapping = await prisma.consultation.findMany({
      where: {
        psychologueId,
        OR: [{ startTime: { lte: endTime }, endTime: { gte: startTime } }],
        ...(rendezVousId
          ? {
              NOT: {
                rendezVousId,
              },
            }
          : {}),
      },
    });
    return overlapping.length === 0;
  },

  async markMessagesAsRead(consultationId: number, userId: number) {
    return prisma.message.updateMany({
      where: {
        consultationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  },
};

function generateRoomId(): string {
  return `room_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}
