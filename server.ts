import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001;
// when using middleware hostname and port must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Structure pour stocker les informations sur les salles et les utilisateurs
interface RoomUser {
  userId: string;
  userRole: "student" | "psychologist";
  socketId: string;
}

// Map pour stocker les informations sur les salles
const rooms = new Map<string, RoomUser[]>();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // En production, remplacez par votre domaine
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Nouvelle connexion: ${socket.id}`);

    // Rejoindre une salle
    socket.on(
      "join-room",
      (data: { roomId: string; userId: string; userRole: string }) => {
        const { roomId, userId, userRole } = data;

        console.log(
          `Utilisateur ${userId} (${userRole}) rejoint la salle ${roomId}`
        );

        // Rejoindre la salle Socket.io
        socket.join(roomId);

        // Initialiser la salle si elle n'existe pas
        if (!rooms.has(roomId)) {
          rooms.set(roomId, []);
        }

        // Ajouter l'utilisateur à la salle
        const user: RoomUser = {
          userId,
          userRole: userRole as "student" | "psychologist",
          socketId: socket.id,
        };

        // Vérifier si l'utilisateur est déjà dans la salle
        const roomUsers = rooms.get(roomId)!;
        const existingUserIndex = roomUsers.findIndex(
          (u) => u.userId === userId
        );

        if (existingUserIndex !== -1) {
          // Mettre à jour l'ID de socket si l'utilisateur existe déjà
          roomUsers[existingUserIndex].socketId = socket.id;
        } else {
          // Ajouter le nouvel utilisateur
          roomUsers.push(user);
        }

        // Sauvegarder les modifications
        rooms.set(roomId, roomUsers);

        // Envoyer une notification aux autres utilisateurs dans la salle
        socket.to(roomId).emit("user-joined", { userId, userRole });

        // Envoyer la liste des utilisateurs actuels dans la salle
        io.to(socket.id).emit("room-users", roomUsers);

        console.log(`Utilisateurs dans la salle ${roomId}:`, roomUsers);
      }
    );

    // Quitter une salle
    socket.on("leave-room", (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;

      console.log(`Utilisateur ${userId} quitte la salle ${roomId}`);

      // Quitter la salle Socket.io
      socket.leave(roomId);

      // Supprimer l'utilisateur de la salle
      if (rooms.has(roomId)) {
        const roomUsers = rooms.get(roomId)!;
        const updatedUsers = roomUsers.filter((user) => user.userId !== userId);

        // Mettre à jour ou supprimer la salle
        if (updatedUsers.length > 0) {
          rooms.set(roomId, updatedUsers);
        } else {
          rooms.delete(roomId);
        }

        // Notifier les autres utilisateurs
        socket.to(roomId).emit("user-left", { userId });
      }
    });

    // Relayer les messages WebRTC
    socket.on("webrtc-message", (message) => {
      console.log(`Message WebRTC reçu:`, message);

      const { roomId, toId, fromId, type } = message;

      // Si le destinataire est "student" ou "psychologist", envoyer à tous les utilisateurs correspondant
      if (toId === "student" || toId === "psychologist") {
        if (rooms.has(roomId)) {
          const roomUsers = rooms.get(roomId)!;
          const targetUsers = roomUsers.filter(
            (user) => user.userRole === toId
          );

          targetUsers.forEach((user) => {
            console.log(
              `Envoi du message ${type} à ${user.userId} (${user.userRole})`
            );
            io.to(user.socketId).emit("webrtc-message", message);
          });
        }
      }
      // Si le destinataire est un ID spécifique, chercher son socketId
      else {
        if (rooms.has(roomId)) {
          const roomUsers = rooms.get(roomId)!;
          const targetUser = roomUsers.find((user) => user.userId === toId);

          if (targetUser) {
            console.log(
              `Envoi du message ${type} à ${targetUser.userId} (${targetUser.userRole})`
            );
            io.to(targetUser.socketId).emit("webrtc-message", message);
          } else {
            console.log(
              `Utilisateur cible ${toId} non trouvé dans la salle ${roomId}`
            );
          }
        } else {
          console.log(`Salle ${roomId} non trouvée`);
        }
      }
    });

    // Gérer la déconnexion
    socket.on("disconnect", () => {
      console.log(`Déconnexion: ${socket.id}`);

      // Parcourir toutes les salles pour trouver et supprimer l'utilisateur déconnecté
      rooms.forEach((users, roomId) => {
        const disconnectedUser = users.find(
          (user) => user.socketId === socket.id
        );

        if (disconnectedUser) {
          console.log(
            `Utilisateur ${disconnectedUser.userId} déconnecté de la salle ${roomId}`
          );

          // Supprimer l'utilisateur de la salle
          const updatedUsers = users.filter(
            (user) => user.socketId !== socket.id
          );

          // Mettre à jour ou supprimer la salle
          if (updatedUsers.length > 0) {
            rooms.set(roomId, updatedUsers);
          } else {
            rooms.delete(roomId);
          }

          // Notifier les autres utilisateurs
          socket
            .to(roomId)
            .emit("user-left", { userId: disconnectedUser.userId });
        }
      });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
