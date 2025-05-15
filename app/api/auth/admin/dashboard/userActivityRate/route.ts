import { NextResponse } from "next/server";
import prisma from "../../../../../(mvc)/lib/prisma"; // Ajustez le chemin relatif

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const thirtyDaysAgoStart = new Date(new Date().setDate(now.getDate() - 30));
    thirtyDaysAgoStart.setHours(0, 0, 0, 0);

    // Daily Active Users (DAU)
    // Users who have a session that expires today or in the future,
    // OR whose session expired very recently (e.g., within the last 24h from now, indicating activity yesterday or today)
    // A simpler approach: users with sessions that were active at any point today.
    // Let's consider users with sessions that expire after the start of today.
    const dauSessions = await prisma.session.findMany({
      where: {
        expiresAt: {
          gte: todayStart,
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });
    const dauCount = dauSessions.length;

    // Monthly Active Users (MAU)
    // Users with sessions that expire after the start of the last 30 day period.
    const mauSessions = await prisma.session.findMany({
      where: {
        expiresAt: {
          gte: thirtyDaysAgoStart,
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });
    const mauCount = mauSessions.length;

    // Stickiness Ratio (DAU/MAU)
    let stickinessRatio = 0;
    if (mauCount > 0) {
      stickinessRatio = (dauCount / mauCount) * 100;
    }

    return NextResponse.json({
      dailyActiveUsers: dauCount,
      monthlyActiveUsers: mauCount,
      stickinessRatio: parseFloat(stickinessRatio.toFixed(2)), // DAU/MAU percentage
      dateRange: {
        dauDate: todayStart.toISOString().split("T")[0],
        mauStartDate: thirtyDaysAgoStart.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error fetching user activity rate data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity rate data" },
      { status: 500 }
    );
  }
}
