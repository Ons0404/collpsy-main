import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user";
}

interface ChatInterfaceProps {
  userId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load previous messages when component mounts
  useEffect(() => {
    // In a real app, fetch messages from API based on userId
    const fetchPreviousMessages = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch(`/api/chat/messages?userId=${userId}`);
        // const data = await response.json();
        // setMessages(data.messages);

        // For demo purposes
        setMessages([
          {
            id: "1",
            content: `Bonjour utilisateur ${userId} ! Comment puis-je vous aider aujourd'hui ?`,
            sender: "bot",
          },
        ]);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchPreviousMessages();
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate bot response (in a real app, this would be an API call)
    // In a real app, send userId along with the message
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Je traite votre demande pour l'utilisateur ${userId}. Dans une application réelle, je ferais appel à une API avec votre ID utilisateur pour des réponses personnalisées.`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow p-4">
      <div className="text-xl font-bold mb-4">Conversation</div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.sender === "bot"
                ? "bg-blue-100 mr-12"
                : "bg-gray-100 ml-12 text-right"
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-blue-100 p-3 rounded-lg mr-12">
            <span>Typing...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <Button type="submit">Envoyer</Button>
      </form>
    </div>
  );
};
