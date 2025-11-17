import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem("token");

      // Skip socket connection for mock authentication
      if (token === "mock-token") {
        return;
      }

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected");
        setIsConnected(true);
      });
      newSocket.on("disconnect", () => {
        console.log("⚠️ Socket disconnected");
        setIsConnected(false);
      });

      let connectionAttempts = 0;
      newSocket.on("connect_error", (error) => {
        connectionAttempts++;
        console.warn(
          `⚠️ Socket connection error (attempt ${connectionAttempts}):`,
          error.message
        );
      });
      newSocket.on("new_message", (data) => {
        // Don't show toast for messages - let the chat components handle this
        console.log(`New message from ${data.message.fromUser.firstName}`);
      });
      newSocket.on("new_notification", (data) => {
        // Only show toast for non-message notifications to avoid spam
        if (data.type !== "new_message") {
          toast.success(data.message);
        }
        setUnreadCount((prev) => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user?.id]);

  const joinConversation = (otherUserId) => {
    if (socket) socket.emit("join_conversation", { otherUserId });
  };

  const leaveConversation = (otherUserId) => {
    if (socket) socket.emit("leave_conversation", { otherUserId });
  };

  const sendMessage = (data) => {
    if (socket) socket.emit("send_message", data);
  };

  const startTyping = (toUserId) => {
    if (socket) socket.emit("typing_start", { toUserId });
  };

  const stopTyping = (toUserId) => {
    if (socket) socket.emit("typing_stop", { toUserId });
  };

  const markMessagesAsRead = (fromUserId) => {
    if (socket) socket.emit("mark_messages_read", { fromUserId });
  };

  const updateStatus = (status) => {
    if (socket) socket.emit("update_status", { status });
  };

  const value = {
    socket,
    isConnected,
    unreadCount,
    setUnreadCount,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    updateStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
