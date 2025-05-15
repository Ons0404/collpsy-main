// /home/ubuntu/collpsy_mvc_project/app/api/conversations/[conversationId]/messages/route.ts
import { NextRequest } from "next/server";
import {
  getUserMessagesByConversationId,
  sendUserMessageToConversation,
} from "../../../../(mvc)/controllers/messageController"; // Assuming controller is in messages folder

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return getUserMessagesByConversationId(request, { params });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return sendUserMessageToConversation(request, { params });
}

