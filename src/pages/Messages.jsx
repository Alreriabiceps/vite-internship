import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { MessageSquare, Send, Search, Plus, Users, Clock } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);

  // Mock data for now
  const conversations = [
    {
      id: 1,
      studentName: "John Doe",
      studentProgram: "BS Information System",
      lastMessage: "Thank you for considering my application!",
      timestamp: "2 hours ago",
      unreadCount: 2,
      avatar: null,
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentProgram: "BS Business Administration",
      lastMessage: "I'm very interested in the marketing internship position.",
      timestamp: "1 day ago",
      unreadCount: 0,
      avatar: null,
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      studentProgram: "BS Computer Science",
      lastMessage: "When can we schedule an interview?",
      timestamp: "3 days ago",
      unreadCount: 1,
      avatar: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Messages
              </h1>
              <p className="text-lg text-gray-600">
                Communicate with students about internship opportunities
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="lg">
                <Search className="h-4 w-4 mr-2" />
                Search Messages
              </Button>
              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg text-gray-900">
                <Users className="h-5 w-5 mr-3 text-gray-700" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedChat?.id === conversation.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setSelectedChat(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={conversation.avatar}
                          alt={conversation.studentName}
                        />
                        <AvatarFallback className="bg-gray-900 text-white">
                          {conversation.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {conversation.studentName}
                          </h4>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-gray-900 text-white text-xs rounded-full px-2 py-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.studentProgram}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {conversation.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-gray-200 h-[600px] flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedChat.avatar}
                          alt={selectedChat.studentName}
                        />
                        <AvatarFallback className="bg-gray-900 text-white">
                          {selectedChat.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedChat.studentName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedChat.studentProgram}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {/* Mock messages */}
                      <div className="flex justify-end">
                        <div className="bg-gray-900 text-white p-3 rounded-lg max-w-xs">
                          <p className="text-sm">
                            Hello! Thank you for your interest in our internship
                            program.
                          </p>
                          <p className="text-xs text-gray-300 mt-1">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-xs">
                          <p className="text-sm">{selectedChat.lastMessage}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedChat.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                      <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Messages Feature Coming Soon
                </h3>
                <p className="text-blue-700 text-sm">
                  Real-time messaging functionality is currently under
                  development. This is a preview of the interface that will be
                  available soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;

