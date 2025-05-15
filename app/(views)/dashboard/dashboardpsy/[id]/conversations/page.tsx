"use client";

import React, { useEffect, useState, FormEvent, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Loader2,
  Search,
  MessageSquare,
  ArrowLeft,
  PlusCircle,
  AlertCircle,
  FilterX,
} from "lucide-react";
import Input from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { Textarea } from "../../../../../components/ui/textarea";
import { useToast } from "../../../../../(mvc)/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../../components/ui/avatar";

// Interfaces
interface Patient {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  date_naissance: string;
  telephone: string;
  rendezVous: {
    id: number;
    date: string;
    heure_debut: string;
    statut: string;
  }[];
}

interface Conversation {
  id: number;
  userId: number;
  psychologistId: number;
  utilisateur: {
    id: number;
    prenom: string;
    nom: string;
    avatar?: string | null;
  };
  latestMessage?: {
    content: string;
    sentAt: string;
    read: boolean;
  };
  unreadCount: number;
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

export default function ConversationsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [creatingConversation, setCreatingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch initial data (patients and conversations)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch patients
        const patientsResponse = await fetch(
          `/api/psychologists/${params.id}/patients`
        );
        if (!patientsResponse.ok)
          throw new Error("Erreur lors de la récupération des patients");
        const patientsData = await patientsResponse.json();
        setPatients(Array.isArray(patientsData) ? patientsData : []);

        // Fetch conversations
        const conversationsResponse = await fetch(
          `/api/conversations?psychologistId=${params.id}&t=${Date.now()}`,
          { cache: "no-store" }
        );
        if (!conversationsResponse.ok)
          throw new Error("Erreur lors de la récupération des conversations");
        const conversationsData = await conversationsResponse.json();
        console.log("Initial conversations:", conversationsData);
        setConversations(
          Array.isArray(conversationsData) ? conversationsData : []
        );
        setFilteredConversations(
          Array.isArray(conversationsData) ? conversationsData : []
        );

        if (conversationsData.length > 0) {
          setSelectedConversation(conversationsData[0].id);
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

    fetchData();
  }, [params.id, toast]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        setLoadingMessages(true);
        const res = await fetch(
          `/api/conversations/${selectedConversation}/messages`
        );
        if (!res.ok)
          throw new Error("Erreur lors de la récupération des messages");
        const data = await res.json();
        console.log("Fetched messages:", data);
        setMessages(data);

        if (data.length > 0) {
          await markMessagesAsRead(selectedConversation);
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

  // Mark messages as read and refresh conversations
  const markMessagesAsRead = async (conversationId: number) => {
    try {
      console.log(
        `Marking messages as read for conversation ${conversationId}`
      );
      const response = await fetch(
        `/api/conversations/${conversationId}/messages/read`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: parseInt(params.id as string) }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors du marquage des messages comme lus"
        );
      }

      const result = await response.json();
      console.log("Mark read response:", result);

      // Refresh conversations to ensure unreadCount is updated
      const conversationsResponse = await fetch(
        `/api/conversations?psychologistId=${params.id}&t=${Date.now()}`,
        { cache: "no-store" }
      );
      if (!conversationsResponse.ok)
        throw new Error("Erreur lors de la récupération des conversations");
      const conversationsData = await conversationsResponse.json();
      console.log("Refreshed conversations:", conversationsData);
      setConversations(
        Array.isArray(conversationsData) ? conversationsData : []
      );
      setFilteredConversations(
        Array.isArray(conversationsData) ? conversationsData : []
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors du marquage des messages comme lus",
        variant: "destructive",
      });
    }
  };

  // Send a new message
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
            senderId: parseInt(params.id as string),
            recipientId: conversation.userId,
            content: newMessage.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("Erreur lors de l'envoi du message");

      const newMessageData = await response.json();
      setMessages((prev) => [...prev, newMessageData]);
      setNewMessage("");

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === selectedConversation
            ? {
                ...conv,
                latestMessage: {
                  content: newMessage.trim(),
                  sentAt: new Date().toISOString(),
                  read: false,
                },
              }
            : conv
        )
      );

      if (textareaRef.current) textareaRef.current.focus();
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

  // Format message timestamp
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

  // Navigate back to dashboard
  const handleGoBack = () => {
    router.push(`/dashboard/dashboardpsy/${params.id}`);
  };

  // Clear search term
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Filter conversations based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conversation) => {
        const patient = patients.find((p) => p.id === conversation.userId);
        return (
          patient &&
          (patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations, patients]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Skeleton for loading conversations
  const ConversationSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
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
              Conversations
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
            Conversations
          </h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouvelle conversation
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Nouvelle Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sélectionnez un patient pour démarrer une nouvelle conversation.
              </p>
              <Select
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <SelectItem
                        key={patient.id}
                        value={patient.id.toString()}
                      >
                        {patient.prenom} {patient.nom}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Aucun patient disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={async () => {
                  if (!selectedPatientId) {
                    toast({
                      title: "Erreur",
                      description: "Veuillez sélectionner un patient",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    setCreatingConversation(true);
                    const response = await fetch(`/api/conversations`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: parseInt(selectedPatientId),
                        psychologistId: parseInt(params.id as string),
                      }),
                    });

                    if (!response.ok)
                      throw new Error(
                        "Erreur lors de la création de la conversation"
                      );

                    const newConversation = await response.json();
                    setConversations((prev) => [...prev, newConversation]);
                    setFilteredConversations((prev) => [
                      ...prev,
                      newConversation,
                    ]);
                    setIsDialogOpen(false);
                    setSelectedPatientId("");
                    setSelectedConversation(newConversation.id);
                    toast({
                      title: "Succès",
                      description: "Conversation créée avec succès",
                    });
                  } catch (err) {
                    toast({
                      title: "Erreur",
                      description:
                        err instanceof Error
                          ? err.message
                          : "Une erreur est survenue",
                      variant: "destructive",
                    });
                  } finally {
                    setCreatingConversation(false);
                  }
                }}
                disabled={creatingConversation || !selectedPatientId}
              >
                {creatingConversation ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Créer la conversation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des patients disponibles */}
        <Card className="border border-gray-200 dark:border-gray-700 lg:col-span-1 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg px-4 py-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Patients disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={async () => {
                      const existingConversation = conversations.find(
                        (conv) => conv.userId === patient.id
                      );

                      if (existingConversation) {
                        setSelectedConversation(existingConversation.id);
                      } else {
                        try {
                          const res = await fetch(`/api/conversations`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId: patient.id,
                              psychologistId: parseInt(params.id as string),
                            }),
                          });

                          if (!res.ok)
                            throw new Error(
                              "Erreur lors de la création de la conversation"
                            );

                          const newConversation = await res.json();
                          setConversations((prev) => [
                            ...prev,
                            newConversation,
                          ]);
                          setFilteredConversations((prev) => [
                            ...prev,
                            newConversation,
                          ]);
                          setSelectedConversation(newConversation.id);
                        } catch (err) {
                          toast({
                            title: "Erreur",
                            description:
                              err instanceof Error
                                ? err.message
                                : "Une erreur est survenue",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/20 text-primary font-medium">
                          {patient.prenom[0]}
                          {patient.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {patient.prenom} {patient.nom}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun patient disponible pour la messagerie.
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Liste des conversations */}
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
                placeholder="Rechercher un patient..."
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
                        {conversation.utilisateur?.avatar ? (
                          <AvatarImage
                            src={`data:image/jpeg;base64,${conversation.utilisateur.avatar}`}
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {conversation.utilisateur?.prenom?.[0] || "?"}
                            {conversation.utilisateur?.nom?.[0] || "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.utilisateur?.prenom || "Inconnu"}{" "}
                            {conversation.utilisateur?.nom || ""}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="ml-2 bg-primary">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.latestMessage?.content || "Patient"}
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
                          )?.utilisateur.prenom[0]
                        }
                        {
                          conversations.find(
                            (c) => c.id === selectedConversation
                          )?.utilisateur.nom[0]
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {
                          conversations.find(
                            (c) => c.id === selectedConversation
                          )?.utilisateur.prenom
                        }{" "}
                        {
                          conversations.find(
                            (c) => c.id === selectedConversation
                          )?.utilisateur.nom
                        }
                      </CardTitle>
                      <p className="text-sm text-gray-500">Patient</p>
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
                              message.senderId === parseInt(params.id as string)
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-md p-3 rounded-lg ${
                                message.senderId ===
                                parseInt(params.id as string)
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatMessageTime(message.sentAt)}
                                {message.readAt
                                  ? " (Lu)"
                                  : message.senderId ===
                                    parseInt(params.id as string)
                                  ? ""
                                  : " (Non lu)"}
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
                        rows={3}
                      />
                      <Button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                      >
                        {sendingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Envoyer"
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
                  Sélectionnez un patient ou une conversation.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
