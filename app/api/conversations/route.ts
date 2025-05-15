// /home/ubuntu/collpsy_mvc_project/app/api/conversations/route.ts
import { NextRequest } from "next/server";
import {
  getConversations,
  createConversation,
} from "../../(mvc)/controllers/conversationController";

export async function GET(request: NextRequest) {
  return getConversations(request);
}

export async function POST(request: NextRequest) {
  return createConversation(request);
}

