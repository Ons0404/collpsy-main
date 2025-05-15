// components/ChatConversation.tsx
"use client";

import React,{ useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface Message {
  id: string;
  content: string;
  sentAt: Date;
  senderId: number;
  sender: {
    prenom: string;
    nom: string;
    avatar?: string | null;
  };
}

export default function ChatConversation({
  conversationId,
  currentUserId,
  otherUser,
}: {
  conversationId: number;
  currentUserId: number;
  otherUser: {
    id: number;
    prenom: string;
    nom: string;
    avatar?: string | null;
  };
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages`
        );
        const data = await res.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content: newMessage,
          senderId: currentUserId,
          recipientId: otherUser.id,
        }),
      });

      if (res.ok) {
        const sentMessage = await res.json();
        setMessages([...messages, sentMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-4 flex items-center space-x-4">
        <Avatar>
          {otherUser.avatar ? (
            <AvatarImage src={`data:image/jpeg;base64,${otherUser.avatar}`} />
          ) : (
            <AvatarFallback>
              {otherUser.prenom[0]}
              {otherUser.nom[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="font-semibold">
            {otherUser.prenom} {otherUser.nom}
          </h3>
          <p className="text-sm text-gray-500">
            {otherUser.id === currentUserId ? "Vous" : "En ligne"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === currentUserId
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.sentAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
