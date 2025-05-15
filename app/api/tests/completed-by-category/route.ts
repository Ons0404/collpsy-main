import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!userId) {
      return NextResponse.json({ error: "userId est requis" }, { status: 400 });
    }

    const etudiantId = parseInt(userId);
    if (isNaN(etudiantId)) {
      return NextResponse.json(
        { error: "userId doit être un nombre valide" },
        { "status": 400 }
      );
    }

    // Construire la clause where avec les filtres de date
    const whereClause = {
      etudiantId: etudiantId,
      ...(dateFrom && { datePassation: { gte: new Date(dateFrom) } }),
      ...(dateTo && { datePassation: { lte: new Date(dateTo) } }),
    };

    // Récupérer les tests complétés groupés par testId
    const testCounts = await prisma.resultatTest.groupBy({
      by: ["testId"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Récupérer les informations des tests pour obtenir les catégories
    const testIds = testCounts.map((item) => item.testId);
    const tests = await prisma.testPsychologique.findMany({
      where: {
        id: { in: testIds },
      },
      select: {
        id: true,
        categorie: true,
      },
    });

    // Mapper les catégories et compter les tests complétés
    const categoryMap: { [key: string]: number } = {};
    testCounts.forEach((count) => {
      const test = tests.find((t) => t.id === count.testId);
      if (test && test.categorie) {
        categoryMap[test.categorie] =
          (categoryMap[test.categorie] || 0) + count._count.id;
      }
    });

    // Formater les données pour la réponse
    const data = Object.entries(categoryMap).map(([category, completed]) => ({
      category,
      completed,
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des tests par catégorie:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
