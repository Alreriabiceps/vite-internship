import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
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
import {
  Search,
  Send,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

const CompanyChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  // Mock data for conversations
  useEffect(() => {
    // In a real app, fetch this from API
    const mockConversations = [
      {
        id: 1,
        student: {
          id: "s1",
          name: "Brandon Nixon",
          avatar: "",
          program: "Computer Science",
          status: "online",
        },
        lastMessage: "Thank you for the opportunity!",
        timestamp: "2 min ago",
        unread: 2,
      },
      {
        id: 2,
        student: {
          id: "s2",
          name: "Hunter Knowles",
          avatar: "",
          program: "Information Technology",
          status: "offline",
        },
        lastMessage: "I'm available for an interview next week",
        timestamp: "1 hour ago",
        unread: 0,
      },
      {
        id: 3,
        student: {
          id: "s3",
          name: "Sarah Johnson",
          avatar: "",
          program: "Software Engineering",
          status: "online",
        },
        lastMessage: "Could you provide more details about the role?",
        timestamp: "3 hours ago",
        unread: 1,
      },
    ];
    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0]);
  }, []);

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages = [
        {
          id: 1,
          sender: "student",
          text: "Hi! I saw your internship posting and I'm very interested.",
          timestamp: "10:30 AM",
          date: "Today",
        },
        {
          id: 2,
          sender: "company",
          text: "Hello! Thanks for reaching out. We'd love to learn more about you.",
          timestamp: "10:32 AM",
          date: "Today",
        },
        {
          id: 3,
          sender: "company",
          text: "Could you tell me about your experience with React?",
          timestamp: "10:33 AM",
          date: "Today",
        },
        {
          id: 4,
          sender: "student",
          text: "I've been working with React for about 2 years. I've built several projects including e-commerce sites and dashboards.",
          timestamp: "10:35 AM",
          date: "Today",
        },
        {
          id: 5,
          sender: "company",
          text: "That's great! We're looking for someone with React experience. Are you available for a video interview next week?",
          timestamp: "10:37 AM",
          date: "Today",
        },
        {
          id: 6,
          sender: "student",
          text: "Thank you for the opportunity!",
          timestamp: "10:40 AM",
          date: "Today",
        },
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      sender: "company",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: "Today",
    };

    setMessages([...messages, message]);
    setNewMessage("");
    toast.success("Message sent!");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Chat with potential interns</p>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
        {/* Conversations List */}
        <Card className="col-span-4 overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Conversations
            </CardTitle>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
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
                      <AvatarImage src={conv.student.avatar} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {conv.student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {conv.student.status === "online" && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {conv.student.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conv.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {conv.student.program}
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
            ))}
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
                          src={selectedConversation.student.avatar}
                        />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {selectedConversation.student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.student.status === "online" && (
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.student.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {selectedConversation.student.program}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Video className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </Button>
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
                        message.sender === "company"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.sender === "company"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-900"
                        } rounded-lg px-4 py-2 shadow-sm`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "company"
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0"
                  >
                    <Paperclip className="h-5 w-5 text-gray-600" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0"
                  >
                    <Smile className="h-5 w-5 text-gray-600" />
                  </Button>
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
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CompanyChat;
