// /home/ubuntu/collpsy_mvc_project/app/api/conversations/[conversationId]/messages/read/route.ts
import { NextRequest } from "next/server";
import { markMessagesAsRead } from "../../../../../(mvc)/controllers/messageController";

export async function PUT(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return markMessagesAsRead(request, { params });
}

