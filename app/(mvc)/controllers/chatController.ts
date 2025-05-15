import { PrismaClient } from "@prisma/client";
import { AIService } from "../services/aiService";

// app/(mvc)/controllers/chatController.ts
export class ChatController {
  private apiUrl: string;

  constructor() {
    this.apiUrl = '/api/chat';
  }

  async createConversation(userId: number, consultationId?: number) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        consultationId,
        message: '' // Empty initial message
      }),
    });
    return response.json();
  }

  async saveMessage(conversationId: number, content: string, senderId: number, isAiMessage: boolean = false) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        message: content,
        userId: senderId,
        isAiMessage
      }),
    });
    return response.json();
  }

  async processMessage(conversationId: number, userMessage: string, userId: number) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        message: userMessage,
        userId
      }),
    });
    return response.json();
  }

  async getConversationMessages(conversationId: number) {
    const response = await fetch(`${this.apiUrl}?conversationId=${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
}