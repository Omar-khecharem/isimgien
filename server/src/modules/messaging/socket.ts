import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { Message } from "../../models/message.model";
import { User } from "../../models/user.model";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

const onlineUsers = new Map<string, string>();

export function initSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as {
        userId: string;
        role: string;
      };
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`[SOCKET] User connected: ${userId}`);

    onlineUsers.set(userId, socket.id);
    io.emit("user:online", { userId, online: true });

    socket.on("message:send", async (data: { receiverId: string; content: string }) => {
      try {
        const { receiverId, content } = data;
        if (!content?.trim()) return;

        const msg = await Message.create({
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
        });

        const populated = await msg.populate([
          { path: "sender", select: "firstName lastName role avatar" },
          { path: "receiver", select: "firstName lastName role avatar" },
        ]);

        socket.emit("message:new", populated);

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message:new", populated);
        }
      } catch (err) {
        console.error("[SOCKET] Error sending message:", err);
        socket.emit("message:error", { error: "Failed to send message" });
      }
    });

    socket.on("message:read", async (data: { senderId: string }) => {
      try {
        await Message.updateMany(
          { sender: data.senderId, receiver: userId, read: false },
          { read: true }
        );

        const senderSocketId = onlineUsers.get(data.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message:read:ack", { readerId: userId });
        }
      } catch (err) {
        console.error("[SOCKET] Error marking messages read:", err);
      }
    });

    socket.on("typing:start", (data: { receiverId: string }) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:start", { userId });
      }
    });

    socket.on("typing:stop", (data: { receiverId: string }) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:stop", { userId });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET] User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit("user:online", { userId, online: false });
    });
  });

  return io;
}

export { onlineUsers };
