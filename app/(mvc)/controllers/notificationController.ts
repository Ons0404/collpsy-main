// /home/ubuntu/collpsy_mvc_project/app/controllers/notifications/notificationController.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Ensure prisma client is correctly initialized and accessible.
// Using a new instance for now, but centralizing prisma client is recommended.
const prisma = new PrismaClient();

// Handler for GET /api/notifications?userId=...
export const getNotificationsByUserId = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId est requis" }, { status: 400 });
    }

    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: "userId invalide" }, { status: 400 });
    }

    // Consider adding authorization check: does the requesting user match userId or have permission?

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userIdNum,
      },
      select: {
        id: true,
        message: true,
        date: true,
        read: true,
        // Include related data if needed, e.g., conversationId, userMessageId
        conversationId: true,
        userMessageId: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Controller Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for POST /api/notifications
export const createNotification = async (req: NextRequest) => {
  try {
    const body = await req.json();
    // Destructure all potential fields for clarity
    const { userId, message, conversationId, userMessageId } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId et message sont requis" },
        { status: 400 }
      );
    }

    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: "userId invalide" }, { status: 400 });
    }

    // Correction: Handle optional IDs with proper type casting for Prisma
    // Note: Prisma schema likely expects string or null for these fields, not number
    const notificationData: any = {
      userId: userIdNum,
      message,
      date: new Date(),
      read: false,
    };

    // Only add these fields if they exist
    if (conversationId !== undefined && conversationId !== null) {
      const conversationIdNum = Number(conversationId);
      if (isNaN(conversationIdNum)) {
        return NextResponse.json(
          { error: "conversationId invalide" },
          { status: 400 }
        );
      }
      notificationData.conversationId = conversationIdNum;
    }

    if (userMessageId !== undefined && userMessageId !== null) {
      const userMessageIdNum = Number(userMessageId);
      if (isNaN(userMessageIdNum)) {
        return NextResponse.json(
          { error: "userMessageId invalide" },
          { status: 400 }
        );
      }
      notificationData.userMessageId = userMessageIdNum;
    }

    const notification = await prisma.notification.create({
      data: notificationData,
      select: {
        // Select fields to match GET response
        id: true,
        message: true,
        date: true,
        read: true,
        conversationId: true,
        userMessageId: true,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Controller Error creating notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la notification" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for GET /api/notifications/utilisateur/[userId]
export const getRecentNotificationsByUserId = async (
  request: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    // Fetch notifications with limit
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc", // Most recent first
      },
      take: 10, // Limit to 10 for performance
    });

    // Format for response
    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      message: notif.message,
      date: notif.date.toISOString(),
      read: notif.read,
    }));

    return NextResponse.json(formattedNotifications, { status: 200 });
  } catch (error) {
    console.error(
      `Controller Error fetching recent notifications for userId ${params.userId}:`,
      error
    );
    return NextResponse.json(
      { error: "Échec de la récupération des notifications" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect(); // Consider centralizing disconnect
  }
};

// Handler for POST /api/notifications/admin
export const createAdminNotification = async (req: NextRequest) => {
  try {
    const { message, administrateurId, userId } = await req.json();

    if (!message || !administrateurId || !userId) {
      return NextResponse.json(
        { error: "Message, administrateurId et userId sont requis" },
        { status: 400 }
      );
    }

    const userIdNum = Number(userId);
    const adminIdNum = Number(administrateurId);

    if (isNaN(userIdNum) || isNaN(adminIdNum)) {
      return NextResponse.json(
        {
          error: "userId et administrateurId doivent être des nombres valides",
        },
        { status: 400 }
      );
    }

    // Check if user and admin exist (optional but good practice)
    const userExists = await prisma.utilisateur.findUnique({
      where: { id: userIdNum },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: `Utilisateur avec id ${userIdNum} non trouvé` },
        { status: 404 }
      );
    }
    const adminExists = await prisma.administrateur.findUnique({
      where: { id: adminIdNum },
    });
    if (!adminExists) {
      return NextResponse.json(
        { error: `Administrateur avec id ${adminIdNum} non trouvé` },
        { status: 404 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        message,
        administrateurId: adminIdNum,
        userId: userIdNum,
        date: new Date(),
        read: false,
      },
    });

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    console.error("Controller Error creating admin notification:", error);
    return NextResponse.json(
      {
        error:
          "Erreur serveur interne lors de la création de la notification admin",
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Handler for GET /api/notifications/admin?administrateurId=...
export const getNotificationsByAdminId = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const administrateurId = searchParams.get("administrateurId");

    if (!administrateurId) {
      return NextResponse.json(
        { error: "administrateurId est requis" },
        { status: 400 }
      );
    }

    const adminIdNum = Number(administrateurId);
    if (isNaN(adminIdNum)) {
      return NextResponse.json(
        { error: "administrateurId doit être un nombre valide" },
        { status: 400 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        administrateurId: adminIdNum,
      },
      orderBy: {
        date: "desc",
      },
      // Consider adding select for consistency and performance
      select: {
        id: true,
        message: true,
        date: true,
        read: true,
        userId: true, // Include userId as it's relevant for admin notifications
        // Include user details if needed
        // utilisateur: { select: { id: true, prenom: true, nom: true } }
      },
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Controller Error fetching admin notifications:", error);
    return NextResponse.json(
      {
        error:
          "Erreur serveur interne lors de la récupération des notifications admin",
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Handler for PUT /api/notifications/admin/read-all?administrateurId=...
export const markAllAdminNotificationsAsRead = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const administrateurId = searchParams.get("administrateurId");

    if (!administrateurId) {
      return NextResponse.json(
        { error: "administrateurId est requis" },
        { status: 400 }
      );
    }

    const adminIdNum = Number(administrateurId);
    if (isNaN(adminIdNum)) {
      return NextResponse.json(
        { error: "administrateurId doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Update all unread notifications for the admin
    const result = await prisma.notification.updateMany({
      where: {
        administrateurId: adminIdNum,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(
      { success: true, count: result.count }, // Return the count of updated notifications
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Controller Error marking all admin notifications as read:",
      error
    );
    return NextResponse.json(
      {
        error:
          "Erreur serveur interne lors de la mise à jour des notifications admin",
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Handler for PUT /api/notifications/admin/[id]
export const updateNotificationReadStatus = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID de notification est requis" },
        { status: 400 }
      );
    }

    const notificationId = Number(id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "ID de notification doit être un nombre valide" },
        { status: 400 }
      );
    }

    const { read } = await req.json();

    if (typeof read !== "boolean") {
      return NextResponse.json(
        { error: "Le paramètre 'read' doit être un booléen" },
        { status: 400 }
      );
    }

    // Check if notification exists before updating
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: `Notification avec l\'ID ${notificationId} non trouvée` },
        { status: 404 }
      );
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read },
    });

    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    console.error("Controller Error updating notification read status:", error);
    return NextResponse.json(
      {
        error:
          "Erreur serveur interne lors de la mise à jour de la notification",
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};

// Handler for PUT /api/notifications/[notificationId]/read
export const markUserNotificationAsRead = async (
  request: NextRequest, // Changed from Request to NextRequest
  { params }: { params: { notificationId: string } }
) => {
  try {
    const notificationId = parseInt(params.notificationId);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "ID de notification invalide" },
        { status: 400 }
      );
    }

    // Check if notification exists before updating
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: `Notification avec l\'ID ${notificationId} non trouvée` },
        { status: 404 }
      );
    }

    // Mark notification as read
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
      // Select fields to match other responses
      select: {
        id: true,
        message: true,
        date: true,
        read: true,
        userId: true,
        conversationId: true,
        userMessageId: true,
      },
    });

    return NextResponse.json(updatedNotification, { status: 200 });
  } catch (error) {
    console.error(
      `Controller Error marking notification ${params.notificationId} as read:`,
      error
    );
    return NextResponse.json(
      { error: "Échec de la mise à jour de la notification" },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
};
