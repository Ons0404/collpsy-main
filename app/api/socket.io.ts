// pages/api/socket.io.ts
import { Server as SocketIOServer } from "socket.io";
import { configureSignalingServer } from "../(mvc)/lib/signaling-server";

export default function SocketHandler(req: any, res: any) {
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const httpServer = res.socket.server;
  const io = new SocketIOServer(httpServer);
  configureSignalingServer(httpServer); // Only pass the httpServer as expected
  res.socket.server.io = io;
  res.end();
}
