import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useSocket } from "../../../contexts/SocketContext";
import { useSearchParams } from "react-router-dom";
import { chatAPI, companiesAPI } from "../../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Search, Send, MessageSquare, Building2 } from "lucide-react";
import toast from "react-hot-toast";

const StudentChat = () => {
  const { user } = useAuth();
  const { socket, sendMessage, joinConversation, leaveConversation } =
    useSocket();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");

  console.log("=== STUDENT CHAT INIT ===");
  console.log("Search params:", searchParams.toString());
  console.log("Company ID from URL:", companyId);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch conversations and handle companyId parameter
  useEffect(() => {
    const initializeChat = async () => {
      await fetchConversations();

      // Only handle companyId after conversations are loaded
      if (companyId && conversations.length > 0) {
        const existingConversation = conversations.find(
          (conv) => conv.company._id === companyId
        );
        if (!existingConversation) {
          fetchCompanyAndCreateConversation(companyId);
        }
      }
    };

    initializeChat();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log("Fetching conversations...");
      const response = await chatAPI.getConversations();
      console.log("Conversations API response:", response);
      const conversationsData = response.data || [];
      console.log("Conversations data:", conversationsData);

      // Transform conversations to include company info
      const transformedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          try {
            console.log("Processing conversation:", conv);
            // The API returns participants array, get the other user
            const otherUser = conv.participants?.[0];
            console.log("Other user:", otherUser);
            if (!otherUser) return null;

            // Check if it's a company (has companyName) or a user (has firstName/lastName)
            if (otherUser.companyName) {
              // It's a company
              const company = {
                _id: otherUser._id,
                companyName: otherUser.companyName,
                logoUrl: otherUser.logoUrl,
                industry: otherUser.industry,
                email: otherUser.email,
              };
              console.log("Company data:", company);

              return {
                id: conv._id,
                company: {
                  _id: company._id,
                  name: company.companyName,
                  avatar: company.logoUrl,
                  industry: company.industry,
                  status: "offline",
                },
                lastMessage: conv.lastMessage?.message || "No messages yet",
                timestamp: conv.lastMessage?.createdAt
                  ? new Date(conv.lastMessage.createdAt).toLocaleString()
                  : "No messages",
                unread: conv.unreadCount || 0,
              };
            } else {
              // It's a user (student), skip for now as this is StudentChat
              console.log("Skipping user conversation in StudentChat");
              return null;
            }
          } catch (error) {
            console.error("Error fetching company info:", error);
            return null;
          }
        })
      );

      console.log("Transformed conversations:", transformedConversations);
      const validConversations = transformedConversations.filter(Boolean);
      setConversations(validConversations);

      // Only auto-select if no companyId provided and we have conversations
      if (
        !companyId &&
        validConversations.length > 0 &&
        !selectedConversation
      ) {
        setSelectedConversation(validConversations[0]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyAndCreateConversation = async (companyId) => {
    try {
      console.log("Creating conversation with company:", companyId);

      // First fetch company info
      const response = await companiesAPI.getById(companyId);
      const company = response.data;
      console.log("Company data:", company);

      // Create a temporary conversation for immediate UI feedback
      const tempConversation = {
        id: `temp_${companyId}_${Date.now()}`,
        company: {
          _id: company._id,
          name: company.companyName,
          avatar: company.logoUrl,
          industry: company.industry,
          status: "offline",
        },
        lastMessage: "Creating conversation...",
        timestamp: "Now",
        unread: 0,
        isTemporary: true,
      };

      console.log("Adding temporary conversation:", tempConversation);
      setConversations((prev) => [tempConversation, ...prev]);
      setSelectedConversation(tempConversation);

      // Try to create the conversation
      const createResponse = await chatAPI.createConversation(companyId);
      console.log("Create conversation response:", createResponse);

      if (!createResponse.data) {
        throw new Error("No response data from createConversation");
      }

      // Refresh conversations to get the real conversation
      await fetchConversations();
    } catch (error) {
      console.error("Error creating conversation:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(
        `Failed to start conversation: ${
          error.response?.data?.message || error.message
        }`
      );

      // Remove the temporary conversation on error
      setConversations((prev) =>
        prev.filter((conv) => !conv.id.startsWith(`temp_${companyId}_`))
      );
      setSelectedConversation(null);
    }
  };

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation?.company?._id) {
      fetchMessages(selectedConversation.company._id);
      joinConversation(selectedConversation.company._id);
    }

    return () => {
      if (selectedConversation?.company?._id) {
        leaveConversation(selectedConversation.company._id);
      }
    };
  }, [selectedConversation]);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data) => {
        if (selectedConversation && data.conversationId) {
          // Transform the message to match our format
          const transformedMessage = {
            id: data.message._id,
            sender:
              data.message.fromUser._id === user._id ? "student" : "company",
            text: data.message.message,
            timestamp: new Date(data.message.createdAt).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            date: new Date(data.message.createdAt).toLocaleDateString(),
            isRead: data.message.isRead,
            createdAt: data.message.createdAt,
          };

          // Only add message if it's not already in the messages array (prevent duplicates)
          setMessages((prev) => {
            const messageExists = prev.some(
              (msg) =>
                msg.id === transformedMessage.id ||
                (msg.id.startsWith("temp_") &&
                  msg.text === transformedMessage.text &&
                  msg.sender === transformedMessage.sender)
            );

            if (messageExists) {
              // Replace temp message with real message
              return prev.map((msg) =>
                msg.id.startsWith("temp_") &&
                msg.text === transformedMessage.text &&
                msg.sender === transformedMessage.sender
                  ? transformedMessage
                  : msg
              );
            }

            return [...prev, transformedMessage];
          });
          scrollToBottom();
        }
      };

      socket.on("new_message", handleNewMessage);

      return () => {
        socket.off("new_message", handleNewMessage);
      };
    }
  }, [socket, selectedConversation, user._id]);

  const fetchMessages = async (companyId) => {
    try {
      const response = await chatAPI.getMessages(companyId);
      const messagesData = response.data || [];

      // Transform messages to match our format
      const transformedMessages = messagesData.map((msg) => {
        const fromId = msg?.fromUser?._id || msg?.fromUser;
        const currentId = user?._id;
        const senderRole =
          fromId && currentId && String(fromId) === String(currentId)
            ? "student"
            : "company";
        return {
          id: msg._id,
          sender: senderRole,
          text: msg.message,
          timestamp: new Date(msg.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(msg.createdAt).toLocaleDateString(),
          isRead: msg.isRead,
          createdAt: msg.createdAt,
        };
      });

      setMessages(transformedMessages);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Send message via socket
      sendMessage({
        toUserId: selectedConversation.company._id,
        message: newMessage.trim(),
        messageType: "text",
      });

      // Add message to local state immediately for better UX
      const tempMessage = {
        id: `temp_${Date.now()}`,
        sender: "student",
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date().toLocaleDateString(),
        isRead: false,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
      scrollToBottom();

      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = conv?.company?.name || "";
    return name.toLowerCase().includes((searchTerm || "").toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">
          Chat with companies about internships
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
        {/* Conversations List */}
        <Card className="col-span-4 overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Companies
            </CardTitle>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">
                  Loading conversations...
                </p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No conversations yet</p>
                <p className="text-xs text-gray-500">
                  Start messaging companies from Browse Internships
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedConversation?.id === conv.id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conv?.company?.avatar || ""} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {(conv?.company?.name || "")
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {conv.company.status === "online" && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {conv.company.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {conv.company.industry}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge className="bg-blue-600 text-white h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-8 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedConversation?.company?.avatar || ""}
                        />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {(selectedConversation?.company?.name || "")
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.company.status === "online" && (
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.company.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {selectedConversation.company.industry}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "student"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.sender === "student"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-900"
                        } rounded-lg px-4 py-2 shadow-sm`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "student"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <CardContent className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 h-10"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 h-10"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a company from the list to start chatting
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentChat;
