import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Navigate } from 'react-router-dom';

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

  // Remove duplicate socket handling - it's already handled in ChatContext

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessageChange = (value: string) => {
    setNewMessage(value);
    if (value.trim()) {
      handleTyping(true);
    } else {
      handleTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const messageContent = newMessage.trim();
    setNewMessage('');
    await sendMessage(messageContent);
    handleTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = async (chatId: string) => {
    await fetchMessages(chatId);
  };

  const handleBackToChats = () => {
    setActiveChat(null);
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const handleUserSearchChange = (query: string) => {
    handleUserSearch(query);
  };

  const handleCreateChat = async (participantId: string) => {
    await createChat(participantId);
    setShowSearch(false);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
    return <Navigate to="/login" replace />;
  }


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <div className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 ${activeChat ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b bg-blue-600 text-white dark:bg-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Chats</h1>
              <p className="text-sm text-blue-100">Welcome, {user.firstName}!</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSearchToggle} className="p-2 rounded-full" variant="ghost">
                <Search size={20} />
              </Button>
              <Button onClick={logout} className="p-2 rounded-full text-sm" variant="destructive">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {showSearch && (
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleUserSearchChange(e.target.value)}
              className="w-full"
            />
            {searchUsers.length > 0 && (
              <ScrollArea className="mt-2 max-h-40">
                {searchUsers.map(searchUser => (
                  <div
                    key={searchUser._id}
                    onClick={() => handleCreateChat(searchUser._id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded flex items-center"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                      {searchUser.firstName[0]}
                    </div>
                    <div>
                      <div className="font-medium">{searchUser.firstName} {searchUser.lastName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">@{searchUser.username}</div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-128px)]">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>No chats yet. Search for users to start chatting!</p>
            </div>
          ) : (
            chats.map(chat => {
              const otherUser = getOtherUser(chat);
              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat._id)}
                  className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${activeChat?._id === chat._id ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800' : ''}`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {otherUser?.firstName?.[0] || '?'}
                      </div>
                      {otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <Label className="font-medium truncate text-black dark:text-white">{getChatDisplayName(chat)}</Label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {chat.latestMessage && formatTime(chat.latestMessage.createdAt)}
                        </span>
                      </div>
                      {chat.latestMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {chat.latestMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 dark:bg-blue-900/10 flex items-center bg-white">
              <Button
                onClick={handleBackToChats}
                className="md:hidden mr-3 p-2 rounded dark:text-white text-black"
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
                <Label className="font-semibold text-white text-lg">{getChatDisplayName(activeChat)}</Label>
                <p className="text-sm text-gray-300">
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
            <div className="p-4 bg-white dark:bg-blue-950/10">
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