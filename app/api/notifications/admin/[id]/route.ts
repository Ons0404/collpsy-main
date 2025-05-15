// /home/ubuntu/collpsy_mvc_project/app/api/notifications/admin/[id]/route.ts
import { NextRequest } from "next/server";
import { updateNotificationReadStatus } from "../../../../(mvc)/controllers/notificationController";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateNotificationReadStatus(req, { params });
}

