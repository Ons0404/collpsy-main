// /home/ubuntu/collpsy_mvc_project/app/api/notifications/admin/read-all/route.ts
import { NextRequest } from "next/server";
import { markAllAdminNotificationsAsRead } from "../../../../(mvc)/controllers/notificationController";

export async function PUT(req: NextRequest) {
  return markAllAdminNotificationsAsRead(req);
}

