import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma"; // Ajustez le chemin relatif
import { TypeConsultation } from "@prisma/client"; // Assurez-vous que TypeConsultation est importé

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Compter les consultations par type sur les 30 derniers jours
    // On se base sur le modèle Consultation et son champ type (enum TypeConsultation)
    const consultationsByType = await prisma.consultation.groupBy({
      by: ["type"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo, // Filtrer par les consultations créées/planifiées récemment
        },
        // On pourrait aussi filtrer par statut, par exemple, uniquement les consultations "CONFIRMED" ou "COMPLETED"
        // status: { in: [ConsultationStatus.CONFIRMED, ConsultationStatus.COMPLETED] } // Assurez-vous que ConsultationStatus est importé
      },
      _count: {
        id: true,
      },
    });

    let totalConsultations = 0;
    const typeCounts: { [key: string]: number } = {
      EN_LIGNE: 0,
      PRESENTIEL: 0,
      // Ajoutez d'autres types si votre enum TypeConsultation en a plus
    };

    consultationsByType.forEach((group) => {
      const count = group._count.id;
      typeCounts[group.type] = count;
      totalConsultations += count;
    });

    const typePercentages: { [key: string]: string | number } = {};
    if (totalConsultations > 0) {
      for (const type in typeCounts) {
        typePercentages[type] = parseFloat(
          ((typeCounts[type] / totalConsultations) * 100).toFixed(2)
        );
      }
    } else {
      for (const type in typeCounts) {
        typePercentages[type] = 0;
      }
    }

    return NextResponse.json({
      totalConsultationsLast30Days: totalConsultations,
      consultationsByTypeLast30Days: typeCounts, // e.g., { EN_LIGNE: 50, PRESENTIEL: 20 }
      consultationTypePercentagesLast30Days: typePercentages, // e.g., { EN_LIGNE: 71.43, PRESENTIEL: 28.57 }
      dateRange: {
        startDate: thirtyDaysAgo.toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error fetching consultation types rate data:", error);
    if (
      error instanceof Error &&
      (error.message.includes("TypeConsultation") ||
        error.message.includes("ConsultationStatus"))
    ) {
      return NextResponse.json(
        {
          error:
            "Internal server error related to Enum types. Please check enum definitions and imports.",
          details: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch consultation types rate data" },
      { status: 500 }
    );
  }
}

// Placeholder pour TypeConsultation si non importable directement.
// Normalement, `import { TypeConsultation } from '@prisma/client';` devrait fonctionner.
// enum TypeConsultation {
//   EN_LIGNE = "EN_LIGNE",
//   PRESENTIEL = "PRESENTIEL",
// }

// enum ConsultationStatus {
//   REQUESTED = "REQUESTED",
//   CONFIRMED = "CONFIRMED",
//   IN_PROGRESS = "IN_PROGRESS", // Note: L'enum dans schema.prisma est IN_PROGRE
//   COMPLETED = "COMPLETED",
//   CANCELLED = "CANCELLED"
// }
