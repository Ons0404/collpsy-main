"use client";

import React, { useEffect, useState, FormEvent, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../components/ui/card";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  Clock,
  Search,
  FilterX,
} from "lucide-react";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { Textarea } from "../../../../../components/ui/textarea";
import { useToast } from "../../../../../(mvc)/hooks/use-toast";
import Input from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { Skeleton } from "../../../../../components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../../components/ui/avatar";

// Interfaces existantes
interface Conversation {
  id: number;
  userId: number;
  psychologistId: number;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  psychologue: {
    id_psychologue: number;
    utilisateur: {
      nom: string;
      prenom: string;
      avatar?: string | null;
    };
  };
}

interface UserMessage {
  id: string;
  senderId: number;
  recipientId: number;
  content: string;
  sentAt: string;
  readAt?: string;
  sender: {
    id: number;
    nom: string;
    prenom: string;
    avatar?: string | null;
  };
  recipient: {
    id: number;
    nom: string;
    prenom: string;
    avatar?: string | null;
  };
}

// Nouvelle interface pour les psychologues
interface PsychologistResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  rendezVous: {
    id: number;
    date: string;
    heure_debut: string;
    statut: string;
  }[];
}

export default function StudentMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Nouvel état pour les psychologues
  const [psychologists, setPsychologists] = useState<PsychologistResponse[]>(
    []
  );

  // Fetch des conversations (comme dans le code original)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/etudiants/${params.userId}/conversations`
        );
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des conversations");
        }
        const data = await res.json();
        setConversations(data.conversations);
        setFilteredConversations(data.conversations);

        if (data.conversations.length > 0) {
          setSelectedConversation(data.conversations[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        toast({
          title: "Erreur",
          description:
            err instanceof Error ? err.message : "Une erreur est survenue",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [params.userId, toast]);

  // Fetch des psychologues avec rendez-vous confirmés
  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const res = await fetch(
          `/api/etudiants/${params.userId}/psychologists`
        );
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des psychologues");
        }
        const data = await res.json();
        setPsychologists(data);
      } catch (err) {
        toast({
          title: "Erreur",
          description:
            err instanceof Error ? err.message : "Une erreur est survenue",
          variant: "destructive",
        });
      }
    };

    fetchPsychologists();
  }, [params.userId, toast]);

  // Fetch des messages (comme dans le code original)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        setLoadingMessages(true);
        const res = await fetch(
          `/api/conversations/${selectedConversation}/messages`
        );
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des messages");
        }
        const data = await res.json();
        setMessages(data);

        if (data.length > 0) {
          markMessagesAsRead(selectedConversation);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        toast({
          title: "Erreur",
          description:
            err instanceof Error ? err.message : "Une erreur est survenue",
          variant: "destructive",
        });
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, toast]);

  // Gestion de la sélection d'un psychologue
  const handleSelectPsychologist = async (psychologistId: number) => {
    const existingConversation = conversations.find(
      (conv) => conv.psychologistId === psychologistId
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation.id);
    } else {
      try {
        const res = await fetch(`/api/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: parseInt(params.userId as string),
            psychologistId,
          }),
        });

        if (!res.ok) {
          throw new Error("Erreur lors de la création de la conversation");
        }

        const newConversation = await res.json();
        setConversations((prev) => [...prev, newConversation]);
        setFilteredConversations((prev) => [...prev, newConversation]);
        setSelectedConversation(newConversation.id);
      } catch (err) {
        toast({
          title: "Erreur",
          description:
            err instanceof Error ? err.message : "Une erreur est survenue",
          variant: "destructive",
        });
      }
    }
  };

  // Autres fonctions inchangées (markMessagesAsRead, handleSendMessage, etc.)
  const markMessagesAsRead = async (conversationId: number) => {
    try {
      await fetch(`/api/conversations/${conversationId}/messages/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(params.userId as string),
        }),
      });

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    const conversation = conversations.find(
      (conv) => conv.id === selectedConversation
    );
    if (!conversation) return;

    try {
      setSendingMessage(true);
      const response = await fetch(
        `/api/conversations/${selectedConversation}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: parseInt(params.userId as string),
            recipientId: conversation.psychologue.id_psychologue,
            content: newMessage.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      const newMessageData = await response.json();
      setMessages((prev) => [...prev, newMessageData]);
      setNewMessage("");

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === selectedConversation
            ? {
                ...conv,
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date().toISOString(),
              }
            : conv
        )
      );

      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Échec de l'envoi du message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Fonctions de formatage (inchangées)
  const formatMessageTime = (dateString: string) => {
    try {
      const messageDate = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (messageDate.toDateString() === today.toDateString()) {
        return messageDate.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      if (messageDate.toDateString() === yesterday.toDateString()) {
        return `Hier, ${messageDate.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      return messageDate.toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Heure invalide";
    }
  };

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return `Dernier message: ${formatMessageTime(dateString)}`;
    } catch (e) {
      return "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as FormEvent);
    }
  };

  const handleGoBack = () => {
    router.push(`/dashboard/dashboardEtudiant/${params.userId}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conversation) => {
        const fullName =
          `${conversation.psychologue.utilisateur.prenom} ${conversation.psychologue.utilisateur.nom}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const ConversationSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="mr-4"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <ConversationSkeleton />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent>
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span>Chargement...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="p-6 text-destructive bg-destructive/10 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Erreur : {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nouvelle section : Liste des psychologues */}
        <Card className="border border-gray-200 dark:border-gray-700 lg:col-span-1 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg px-4 py-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Psychologues disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              {psychologists.length > 0 ? (
                psychologists.map((psychologist) => (
                  <div
                    key={psychologist.id}
                    className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={() => handleSelectPsychologist(psychologist.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/20 text-primary font-medium">
                          {psychologist.prenom[0]}
                          {psychologist.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {psychologist.prenom} {psychologist.nom}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {psychologist.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun psychologue disponible pour la messagerie.
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Liste des conversations existantes */}
        <Card className="border border-gray-200 dark:border-gray-700 lg:col-span-1 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg px-4 py-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex justify-between items-center">
              <span>Conversations</span>
              <Badge variant="outline" className="text-xs">
                {filteredConversations.length}
              </Badge>
            </CardTitle>
            <div className="mt-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un psychologue..."
                className="pl-9 pr-9 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 p-0"
                  onClick={clearSearch}
                >
                  <FilterX className="h-4 w-4 text-gray-500" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[560px]">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      selectedConversation === conversation.id
                        ? "bg-primary/10"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {conversation.psychologue?.utilisateur?.avatar ? (
                          <AvatarImage
                            src={`data:image/jpeg;base64,${conversation.psychologue.utilisateur.avatar}`}
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {conversation.psychologue?.utilisateur
                              ?.prenom?.[0] || "?"}
                            {conversation.psychologue?.utilisateur?.nom?.[0] ||
                              "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.psychologue?.utilisateur?.prenom ||
                              "Inconnu"}{" "}
                            {conversation.psychologue?.utilisateur?.nom || ""}
                          </p>
                          {conversation.unreadCount &&
                            conversation.unreadCount > 0 && (
                              <Badge className="ml-2 bg-primary">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage || "Psychologue"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400 mt-4">
                    Aucune conversation trouvée.
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Conversation sélectionnée */}
        <Card className="border border-gray-200 dark:border-gray-700 lg:col-span-1 shadow-sm">
          {selectedConversation ? (
            <>
              <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {
                          conversations.find(
                            (c) => c.id === selectedConversation
                          )?.psychologue.utilisateur.prenom[0]
                        }
                        {
                          conversations.find(
                            (c) => c.id === selectedConversation
                          )?.psychologue.utilisateur.nom[0]
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {
                          conversations.find(
                            (c) => c.id === selectedConversation
                          )?.psychologue.utilisateur.prenom
                        }{" "}
                        {
                          conversations.find(
                            (c) => c.id === selectedConversation
                          )?.psychologue.utilisateur.nom
                        }
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Psychologue
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-[500px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg text-gray-500">
                      Chargement des messages...
                    </span>
                  </div>
                ) : (
                  <div className="p-6">
                    <ScrollArea className="h-[460px] mb-4 p-2">
                      {messages.length > 0 ? (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`mb-4 flex ${
                              message.senderId ===
                              parseInt(params.userId as string)
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-md p-3 rounded-lg ${
                                message.senderId ===
                                parseInt(params.userId as string)
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatMessageTime(message.sentAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <MessageSquare className="h-12 w-12 text-gray-400" />
                          <p className="text-gray-500 dark:text-gray-400 mt-4">
                            Aucun message dans cette conversation.
                          </p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </ScrollArea>
                    <form
                      onSubmit={handleSendMessage}
                      className="flex space-x-2 mt-4"
                    >
                      <Textarea
                        ref={textareaRef}
                        className="flex-1 p-3 border rounded-lg"
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={3}
                      />
                      <Button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                      >
                        {sendingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-20 text-center h-[600px]">
                <MessageSquare className="h-16 w-16 text-gray-400" />
                <h3 className="text-2xl font-medium text-gray-900 dark:text-white mt-6">
                  Aucune conversation sélectionnée
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Sélectionnez un psychologue ou une conversation.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
