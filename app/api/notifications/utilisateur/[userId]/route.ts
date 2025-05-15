// /home/ubuntu/collpsy_mvc_project/app/api/notifications/utilisateur/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRecentNotificationsByUserId } from "../../../../(mvc)/controllers/notificationController";

export async function GET(
  request: NextRequest, // Changed from Request to NextRequest for consistency
  { params }: { params: { userId: string } }
) {
  return getRecentNotificationsByUserId(request, { params });
}

