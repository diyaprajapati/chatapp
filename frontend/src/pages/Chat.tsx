import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, ArrowLeft, Users, Trash2 } from 'lucide-react';

const ChatApp = () => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Get token and user from localStorage (assuming they're stored there after login)
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (currentUser._id) {
      setUser(currentUser);
      fetchChats();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        //@ts-ignore
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch all chats
  const fetchChats = async () => {
    try {
      const data = await apiCall('/chats');
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    try {
      setLoading(true);
      const data = await apiCall(`/chats/${chatId}`);
      setMessages(data.messages);
      setActiveChat(data.chat);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      const messageData = {
        content: newMessage,
        chat: activeChat._id,
        sender: user._id,
        messageType: 'text'
      };

      // Optimistically add message to UI
      const optimisticMessage = {
        ...messageData,
        _id: Date.now().toString(),
        createdAt: new Date(),
        sender: user
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');

      // Send to backend (you'll need to create this endpoint)
      await apiCall('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });

      // Refresh chats to update last message
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      //@ts-ignore
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
    }
  };

  // Search users
  const handleUserSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchUsers([]);
      return;
    }

    try {
      const data = await apiCall(`/auth/search?username=${query}`);
      setSearchUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Create new chat
  const createChat = async (participantId) => {
    try {
      const data = await apiCall('/chats', {
        method: 'POST',
        body: JSON.stringify({
          participants: [participantId],
          isGroupChat: false
        })
      });

      setChats(prev => [data, ...prev]);
      setShowSearch(false);
      setSearchQuery('');
      setSearchUsers([]);
      fetchMessages(data._id);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Delete chat
  const deleteChat = async (chatId) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      await apiCall(`/chats/${chatId}`, { method: 'DELETE' });
      setChats(prev => prev.filter(chat => chat._id !== chatId));
      if (activeChat?._id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Get chat display name
  const getChatDisplayName = (chat) => {
    if (chat.isGroupChat) {
      return chat.chatName || 'Group Chat';
    }
    const otherUser = chat.participants.find(p => p._id !== user._id);
    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
  };

  // Get other user in 1-on-1 chat
  const getOtherUser = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (date) => {
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

  if (!user._id) {
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
            <h1 className="text-xl font-semibold">Chats</h1>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-blue-700"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Search Users */}
        {showSearch && (
          <div className="p-4 border-b bg-gray-50">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            {searchUsers.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {searchUsers.map(searchUser => (
                  <div
                    key={searchUser._id}
                    onClick={() => createChat(searchUser._id)}
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
          {chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => fetchMessages(chat._id)}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${activeChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {chat.isGroupChat ? (
                    <Users size={20} />
                  ) : (
                    getOtherUser(chat)?.firstName?.[0] || '?'
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">{getChatDisplayName(chat)}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat._id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center">
              <button
                onClick={() => setActiveChat(null)}
                className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                {activeChat.isGroupChat ? (
                  <Users size={20} />
                ) : (
                  getOtherUser(activeChat)?.firstName?.[0] || '?'
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{getChatDisplayName(activeChat)}</h2>
                <p className="text-sm text-gray-600">
                  {activeChat.isGroupChat ?
                    `${activeChat.participants.length} members` :
                    'Online'
                  }
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwnMessage = message.sender._id === user._id;
                  const showDate = index === 0 ||
                    formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                  return (
                    <div key={message._id}>
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
                          {!isOwnMessage && activeChat.isGroupChat && (
                            <div className="text-xs font-medium mb-1">
                              {message.sender.firstName}
                            </div>
                          )}
                          <div>{message.content}</div>
                          <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border rounded-full focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
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
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;