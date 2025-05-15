// lib/signaling-server.ts
import { Server } from "socket.io";

let activeRooms = new Map<string, Set<string>>();

export function configureSignalingServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId: string, userId: string) => {
      socket.join(roomId);
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Set());
      }
      activeRooms.get(roomId)?.add(userId);

      socket.broadcast.to(roomId).emit("user-connected", userId);

      socket.on("disconnect", () => {
        activeRooms.get(roomId)?.delete(userId);
        socket.broadcast.to(roomId).emit("user-disconnected", userId);
      });

      socket.on("signal", (data: { to: string; signal: any }) => {
        io.to(data.to).emit("signal", {
          from: userId,
          signal: data.signal,
        });
      });
    });
  });
}
