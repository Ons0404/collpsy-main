// /home/ubuntu/collpsy_mvc_project/app/api/notifications/admin/route.ts
import { NextRequest } from "next/server";
import { 
  createAdminNotification, 
  getNotificationsByAdminId 
} from "../../../(mvc)/controllers/notificationController";

export async function POST(req: NextRequest) {
  return createAdminNotification(req);
}

export async function GET(req: NextRequest) {
  return getNotificationsByAdminId(req);
}

