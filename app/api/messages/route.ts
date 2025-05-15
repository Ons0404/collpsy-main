// /home/ubuntu/collpsy_mvc_project/app/api/messages/route.ts
import { NextRequest } from "next/server";
import { 
  sendMessage, 
  getMessagesByConversation 
} from "../../(mvc)/controllers/messageController";

// Envoyer un message
export async function POST(req: NextRequest) {
  return sendMessage(req);
}

// Récupérer les messages d'une conversation
export async function GET(req: NextRequest) {
  return getMessagesByConversation(req);
}

