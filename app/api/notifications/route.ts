// /home/ubuntu/collpsy_mvc_project/app/api/notifications/route.ts
import { NextRequest } from "next/server";
import { 
  getNotificationsByUserId, 
  createNotification 
} from "../../(mvc)/controllers/notificationController";

export async function GET(req: NextRequest) {
  return getNotificationsByUserId(req);
}

export async function POST(req: NextRequest) {
  return createNotification(req);
}

