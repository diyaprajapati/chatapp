
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Search, Send, Menu, X, Phone, Video, MoreVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  isOnline?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export default function Chat() {
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock users data with online status
  const [users] = useState<User[]>([
    {
      id: '2',
      firstName: 'Alice',
      lastName: 'Johnson',
      username: 'alice_j',
      lastMessage: 'How are you doing?',
      timestamp: '2 min ago',
      isOnline: true
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Smith',
      username: 'bobsmith',
      lastMessage: 'See you later!',
      timestamp: '1 hour ago',
      isOnline: false
    },
    {
      id: '4',
      firstName: 'Carol',
      lastName: 'Davis',
      username: 'carol_d',
      lastMessage: 'Thanks for the help',
      timestamp: '3 hours ago',
      isOnline: true
    }
  ]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user!.id,
      content: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed md:relative md:translate-x-0 z-40 w-80 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transition-transform duration-300 ease-in-out shadow-xl md:shadow-none`}>
        
        {/* Header - Improved styling */}
        <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="ring-2 ring-blue-500/20 dark:ring-blue-400/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">@{user?.username}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
            />
          </div>
        </div>

        {/* User List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredUsers.map((chatUser) => (
              <div
                key={chatUser.id}
                className={`p-3 mb-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 rounded-lg ${
                  selectedUser?.id === chatUser.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedUser(chatUser);
                  setSidebarOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chatUser.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {chatUser.firstName[0]}{chatUser.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {chatUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate text-slate-900 dark:text-white">
                        {chatUser.firstName} {chatUser.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {chatUser.timestamp}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {chatUser.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {selectedUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-800"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-sm text-green-500">
                      {selectedUser.isOnline ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        message.senderId === user?.id
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.senderId === user?.id
                          ? 'text-blue-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Write a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[44px] pr-12 rounded-3xl border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-slate-50 dark:bg-slate-700"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  size="icon"
                  className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Search className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Select a conversation
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                Choose someone from your contacts to start messaging and stay connected
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
