import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  sender: { _id: string; firstName: string; lastName: string; role: string; avatar?: string };
  receiver: { _id: string; firstName: string; lastName: string; role: string; avatar?: string };
  content: string;
  read: boolean;
  createdAt: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: Set<string>;
  sendMessage: (receiverId: string, content: string) => void;
  markAsRead: (senderId: string) => void;
  startTyping: (receiverId: string) => void;
  stopTyping: (receiverId: string) => void;
  onNewMessage: (callback: (msg: Message) => void) => () => void;
  onUserOnline: (callback: (data: { userId: string; online: boolean }) => void) => () => void;
  onTypingStart: (callback: (data: { userId: string }) => void) => () => void;
  onTypingStop: (callback: (data: { userId: string }) => void) => () => void;
  onMessageReadAck: (callback: (data: { readerId: string }) => void) => () => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = io(window.location.origin, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("user:online", ({ userId, online }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    socketRef.current?.emit("message:send", { receiverId, content });
  }, []);

  const markAsRead = useCallback((senderId: string) => {
    socketRef.current?.emit("message:read", { senderId });
  }, []);

  const startTyping = useCallback((receiverId: string) => {
    socketRef.current?.emit("typing:start", { receiverId });
  }, []);

  const stopTyping = useCallback((receiverId: string) => {
    socketRef.current?.emit("typing:stop", { receiverId });
  }, []);

  const onNewMessage = useCallback((callback: (msg: Message) => void) => {
    socketRef.current?.on("message:new", callback);
    return () => { socketRef.current?.off("message:new", callback); };
  }, []);

  const onUserOnline = useCallback((callback: (data: { userId: string; online: boolean }) => void) => {
    socketRef.current?.on("user:online", callback);
    return () => { socketRef.current?.off("user:online", callback); };
  }, []);

  const onTypingStart = useCallback((callback: (data: { userId: string }) => void) => {
    socketRef.current?.on("typing:start", callback);
    return () => { socketRef.current?.off("typing:start", callback); };
  }, []);

  const onTypingStop = useCallback((callback: (data: { userId: string }) => void) => {
    socketRef.current?.on("typing:stop", callback);
    return () => { socketRef.current?.off("typing:stop", callback); };
  }, []);

  const onMessageReadAck = useCallback((callback: (data: { readerId: string }) => void) => {
    socketRef.current?.on("message:read:ack", callback);
    return () => { socketRef.current?.off("message:read:ack", callback); };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    onlineUsers,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserOnline,
    onTypingStart,
    onTypingStop,
    onMessageReadAck,
  };
}

export type { Message };
