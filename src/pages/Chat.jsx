import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import {
  Send,
  Search,
  MessageCircle,
  User,
  Building2,
  Shield,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
  Trash2,
  Reply,
} from "lucide-react";

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();

    if (socket) {
      socket.on("newMessage", handleNewMessage);
      socket.on("messageRead", handleMessageRead);
      socket.on("typing", handleTyping);
      socket.on("stopTyping", handleStopTyping);

      return () => {
        socket.off("newMessage");
        socket.off("messageRead");
        socket.off("typing");
        socket.off("stopTyping");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      joinConversation(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);

      // Mock conversations data
      const mockConversations = [
        {
          _id: "1",
          participants: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@student.com",
            },
            {
              _id: "2",
              firstName: "Jane",
              lastName: "Smith",
              email: "jane@company.com",
            },
          ],
          lastMessage: {
            content: "Hello! I'm interested in the internship opportunity.",
            sender: "1",
            timestamp: new Date().toISOString(),
          },
          unreadCount: 2,
        },
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // Mock messages data
      const mockMessages = [
        {
          _id: "1",
          content: "Hello! I'm interested in the internship opportunity.",
          sender: "1",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
        {
          _id: "2",
          content: "Great! Can you tell me more about your experience?",
          sender: "2",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: true,
        },
        {
          _id: "3",
          content:
            "I have experience with React and Node.js from my previous projects.",
          sender: "1",
          timestamp: new Date(Date.now() - 900000).toISOString(),
          read: false,
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit("joinConversation", conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit("leaveConversation", conversationId);
    }
  };

  const handleNewMessage = (message) => {
    if (
      selectedConversation &&
      message.conversation === selectedConversation._id
    ) {
      setMessages((prev) => [...prev, message]);
    }

    // Update conversation list with new message
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === message.conversation
          ? {
              ...conv,
              lastMessage: message,
              unreadCount:
                conv._id === selectedConversation?._id
                  ? 0
                  : (conv.unreadCount || 0) + 1,
            }
          : conv
      )
    );
  };

  const handleMessageRead = (data) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === data.messageId ? { ...msg, readAt: data.readAt } : msg
      )
    );
  };

  const handleTyping = (data) => {
    if (
      data.conversationId === selectedConversation?._id &&
      data.userId !== user._id
    ) {
      setTypingUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    }
  };

  const handleStopTyping = (data) => {
    if (data.conversationId === selectedConversation?._id) {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await api.post("/chat/send", {
        receiverId: selectedConversation.participants.find(
          (p) => p._id !== user._id
        )._id,
        message: newMessage.trim(),
        type: "text",
      });

      setNewMessage("");
      setMessages((prev) => [...prev, response.data]);

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: response.data }
            : conv
        )
      );

      // Emit typing stop
      if (socket) {
        socket.emit("stopTyping", { conversationId: selectedConversation._id });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTypingStart = () => {
    if (socket && selectedConversation) {
      socket.emit("typing", { conversationId: selectedConversation._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { conversationId: selectedConversation._id });
      }, 3000);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.put(`/chat/messages/${messageId}/read`);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const getParticipantInfo = (conversation) => {
    const participant = conversation.participants.find(
      (p) => p._id !== user._id
    );
    return participant;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "student":
        return <User className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "company":
        return "bg-green-100 text-green-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) => {
    const participant = getParticipantInfo(conv);
    return (
      !searchTerm ||
      participant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat</h1>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Communicate with other users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const participant = getParticipantInfo(conversation);
                  const isSelected =
                    selectedConversation?._id === conversation._id;

                  return (
                    <div
                      key={conversation._id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => {
                        if (selectedConversation) {
                          leaveConversation(selectedConversation._id);
                        }
                        setSelectedConversation(conversation);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.profilePictureUrl} />
                          <AvatarFallback>
                            {participant.firstName?.[0]}
                            {participant.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium truncate">
                              {participant.firstName} {participant.lastName}
                            </h3>
                            <Badge
                              className={`text-xs ${getRoleColor(
                                participant.role
                              )}`}
                            >
                              {getRoleIcon(participant.role)}
                              <span className="ml-1 capitalize">
                                {participant.role}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.message ||
                              "No messages yet"}
                          </p>
                        </div>
                        <div className="text-right">
                          {conversation.lastMessage && (
                            <p className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </p>
                          )}
                          {conversation.unreadCount > 0 && (
                            <Badge className="mt-1 bg-red-500 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        getParticipantInfo(selectedConversation)
                          .profilePictureUrl
                      }
                    />
                    <AvatarFallback>
                      {getParticipantInfo(selectedConversation).firstName?.[0]}
                      {getParticipantInfo(selectedConversation).lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {getParticipantInfo(selectedConversation).firstName}{" "}
                      {getParticipantInfo(selectedConversation).lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getParticipantInfo(selectedConversation).email}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.sender._id === user._id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            message.sender._id === user._id
                              ? "order-2"
                              : "order-1"
                          }`}
                        >
                          {message.sender._id !== user._id && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={message.sender.profilePictureUrl}
                                />
                                <AvatarFallback className="text-xs">
                                  {message.sender.firstName?.[0]}
                                  {message.sender.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {message.sender.firstName}{" "}
                                {message.sender.lastName}
                              </span>
                            </div>
                          )}
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.sender._id === user._id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(message.createdAt)}
                              </span>
                              {message.sender._id === user._id && (
                                <div className="ml-1">
                                  {message.readAt ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <p className="text-sm text-muted-foreground">
                          {typingUsers.length === 1
                            ? "Someone is typing..."
                            : "Multiple people are typing..."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTypingStart();
                      }}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Select a conversation
                </h3>
                <p>Choose a conversation from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;
