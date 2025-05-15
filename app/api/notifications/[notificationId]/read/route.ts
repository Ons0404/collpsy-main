// /home/ubuntu/collpsy_mvc_project/app/api/notifications/[notificationId]/read/route.ts
import { NextRequest } from "next/server";
import { markUserNotificationAsRead } from "../../../../(mvc)/controllers/notificationController";

export async function PUT(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  return markUserNotificationAsRead(request, { params });
}
