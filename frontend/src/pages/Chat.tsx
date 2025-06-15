import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ChatApp = () => {
  const { user, logout } = useAuth();
  const {
    chats,
    activeChat,
    messages,
    searchUsers,
    searchQuery,
    loading,
    isTyping,
    setActiveChat,
    fetchMessages,
    sendMessage,
    handleUserSearch,
    createChat,
    handleTyping,
    setSearchQuery,
    getChatDisplayName,
    getOtherUser,
  } = useChatContext();

  const [newMessage, setNewMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message input changes
  const handleMessageChange = (value: string) => {
    setNewMessage(value);

    // Handle typing indicator
    if (value.trim()) {
      handleTyping(true);
    } else {
      handleTyping(false);
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    await sendMessage(messageContent);
    handleTyping(false); // Stop typing indicator
  };

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chatId: string) => {
    await fetchMessages(chatId);
  };

  // Handle back button (mobile)
  const handleBackToChats = () => {
    setActiveChat(null);
  };

  // Handle search toggle
  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  // Handle user search
  const handleUserSearchChange = (query: string) => {
    handleUserSearch(query);
  };

  // Handle create chat
  const handleCreateChat = async (participantId: string) => {
    await createChat(participantId);
    setShowSearch(false);
  };

  // Format time helper
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date helper
  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access chat</h2>
          <p className="text-gray-600">You need to be logged in to use the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-1/3 bg-white border-r ${activeChat ? 'hidden md:block' : 'block'}`}>
        {/* Header */}
        <div className="p-4 border-b bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Chats</h1>
              <p className="text-sm text-blue-100">Welcome, {user.firstName}!</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSearchToggle}
                className="p-2 rounded-full hover:bg-blue-700"
              >
                <Search size={20} />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-blue-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Search Users */}
        {showSearch && (
          <div className="p-4 border-b bg-gray-50">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleUserSearchChange(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            {searchUsers.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {searchUsers.map(searchUser => (
                  <div
                    key={searchUser._id}
                    onClick={() => handleCreateChat(searchUser._id)}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                      {searchUser.firstName[0]}
                    </div>
                    <div>
                      <div className="font-medium">{searchUser.firstName} {searchUser.lastName}</div>
                      <div className="text-sm text-gray-500">@{searchUser.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat List */}
        <div className="overflow-y-auto flex-1">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No chats yet. Search for users to start chatting!</p>
            </div>
          ) : (
            chats.map(chat => {
              const otherUser = getOtherUser(chat);
              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat._id)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${activeChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {otherUser?.firstName?.[0] || '?'}
                      </div>
                      {otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <Label className="font-medium text-black truncate">{getChatDisplayName(chat)}</Label>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {chat.latestMessage && formatTime(chat.latestMessage.createdAt)}
                        </span>
                      </div>
                      {chat.latestMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {chat.latestMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center">
              <Button
                onClick={handleBackToChats}
                className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded"
                variant="ghost"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {getOtherUser(activeChat)?.firstName?.[0] || '?'}
                </div>
                {getOtherUser(activeChat)?.isOnline && (
                  <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1">
                <Label className="font-semibold text-black text-lg">{getChatDisplayName(activeChat)}</Label>
                <p className="text-sm text-gray-600">
                  {getOtherUser(activeChat)?.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isOwnMessage = message.userId._id === user._id;
                    const showDate = index === 0 ||
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={`${message._id}-${index}`}>
                        {showDate && (
                          <div className="text-center text-sm text-gray-500 my-4">
                            {formatDate(message.createdAt)}
                          </div>
                        )}
                        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-800'
                            }`}>
                            <div className="whitespace-pre-wrap break-words">{message.content}</div>
                            <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border rounded-full focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Chat</h2>
              <p className="text-gray-500">Select a chat to start messaging or search for users to chat with</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;