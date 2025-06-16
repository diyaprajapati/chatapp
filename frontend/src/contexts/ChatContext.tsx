import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

interface Chat {
    _id: string;
    participants: User[];
    latestMessage?: Message;
    createdAt: string;
    updatedAt: string;
}

interface Message {
    _id: string;
    userId: User;
    content: string;
    chatId: string;
    createdAt: string;
    readBy?: Array<{
        user: string;
        readAt: string;
    }>;
}

interface ChatContextType {
    // State
    chats: Chat[];
    activeChat: Chat | null;
    messages: Message[];
    searchUsers: User[];
    searchQuery: string;
    loading: boolean;
    isTyping: boolean;

    // Actions
    setActiveChat: (chat: Chat | null) => void;
    fetchChats: () => Promise<void>;
    fetchMessages: (chatId: string) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    handleUserSearch: (query: string) => Promise<void>;
    createChat: (participantId: string) => Promise<void>;
    handleTyping: (isTyping: boolean) => void;
    setSearchQuery: (query: string) => void;

    // Helpers
    getChatDisplayName: (chat: Chat) => string;
    getOtherUser: (chat: Chat) => User | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { user } = useAuth();

    // State
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChatState] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchUsers, setSearchUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Refs
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentChatIdRef = useRef<string | null>(null);

    // Initialize socket connection
    useEffect(() => {
        if (!user) return;

        const initializeSocket = () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
                transports: ['websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                randomizationFactor: 0.5,
                withCredentials: true,
                query: {
                    userId: user?._id || ''
                }
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                console.log('Connected to server');
                socket.emit('setup', user);
            });

            socket.on('connected', () => {
                console.log('User setup complete');
            });

            // Handle new chat creation - FIXED
            socket.on('new chat', (newChat: Chat) => {
                console.log('New chat received:', newChat);
                setChats(prev => {
                    // Check if chat already exists
                    const chatExists = prev.some(chat => chat._id === newChat._id);
                    if (chatExists) {
                        console.log('Chat already exists, skipping');
                        return prev;
                    }

                    console.log('Adding new chat to list');
                    // Add new chat to the beginning of the list
                    const newChats = [newChat, ...prev];
                    return newChats.sort((a, b) => {
                        const aTime = a.latestMessage?.createdAt || a.updatedAt;
                        const bTime = b.latestMessage?.createdAt || b.updatedAt;
                        return new Date(bTime).getTime() - new Date(aTime).getTime();
                    });
                });
            });

            // Handle chat created event - NEW
            socket.on('chat created', (data: { chat: Chat; participants: string[] }) => {
                console.log('Chat created event received:', data);
                const { chat: newChat, participants } = data;

                // Only add to chats if current user is a participant
                if (participants.includes(user._id)) {
                    setChats(prev => {
                        const chatExists = prev.some(chat => chat._id === newChat._id);
                        if (chatExists) return prev;

                        const newChats = [newChat, ...prev];
                        return newChats.sort((a, b) => {
                            const aTime = a.latestMessage?.createdAt || a.updatedAt;
                            const bTime = b.latestMessage?.createdAt || b.updatedAt;
                            return new Date(bTime).getTime() - new Date(aTime).getTime();
                        });
                    });
                }
            });

            socket.on('message received', (newMessage: Message) => {
                console.log('Message received:', newMessage);

                // Don't add our own messages again
                if (newMessage.userId._id === user._id) return;

                const isForActiveChat = currentChatIdRef.current === newMessage.chatId;

                if (isForActiveChat) {
                    setMessages(prev => {
                        const messageExists = prev.some(msg => msg._id === newMessage._id);
                        return messageExists ? prev : [...prev, newMessage];
                    });
                }

                // Update chat list with latest message
                setChats(prev => {
                    const updatedChats = prev.map(chat =>
                        chat._id === newMessage.chatId ? {
                            ...chat,
                            latestMessage: newMessage,
                            updatedAt: newMessage.createdAt
                        } : chat
                    );
                    return updatedChats.sort((a, b) =>
                        new Date(b.latestMessage?.createdAt || b.updatedAt).getTime() -
                        new Date(a.latestMessage?.createdAt || a.updatedAt).getTime()
                    );
                });
            });

            socket.on('typing', (data: { userId: string; chatId: string }) => {
                if (currentChatIdRef.current === data.chatId && data.userId !== user._id) {
                    setIsTyping(true);
                }
            });

            socket.on('stop typing', (data: { userId: string; chatId: string }) => {
                if (currentChatIdRef.current === data.chatId) {
                    setIsTyping(false);
                }
            });

            socket.on('user online', (userId: string) => {
                updateUserOnlineStatus(userId, true);
            });

            socket.on('user offline', (userId: string) => {
                updateUserOnlineStatus(userId, false);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });
        };

        initializeSocket();

        // Cleanup function
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [user]);

    // Update current chat ID ref when active chat changes
    useEffect(() => {
        currentChatIdRef.current = activeChat?._id || null;
    }, [activeChat]);

    // Update user online status in chats
    const updateUserOnlineStatus = (userId: string, isOnline: boolean) => {
        setChats(prev => prev.map(chat => ({
            ...chat,
            participants: chat.participants.map(p =>
                p._id === userId ? { ...p, isOnline } : p
            )
        })));
    };

    // Update user online status on backend
    const updateOnlineStatus = async (isOnline: boolean) => {
        try {
            await api.put('/auth/status', { isOnline });
        } catch (error) {
            console.error('Error updating online status:', error);
        }
    };

    // Set user online when component mounts
    useEffect(() => {
        if (user) {
            updateOnlineStatus(true);
            fetchChats();
        }

        // Set user offline when component unmounts
        return () => {
            if (user) {
                updateOnlineStatus(false);
            }
        };
    }, [user]);

    // Fetch all chats
    const fetchChats = async () => {
        try {
            const response = await api.get('/chats');
            // Sort chats by latest message time
            const sortedChats = response.data.sort((a: Chat, b: Chat) => {
                const aTime = a.latestMessage?.createdAt || a.updatedAt;
                const bTime = b.latestMessage?.createdAt || b.updatedAt;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
            setChats(sortedChats);
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    // Set active chat and update ref
    const setActiveChat = (chat: Chat | null) => {
        // Leave previous chat room
        if (currentChatIdRef.current && socketRef.current) {
            socketRef.current.emit('leave chat', currentChatIdRef.current);
        }

        setActiveChatState(chat);
        currentChatIdRef.current = chat?._id || null;

        // Join new chat room
        if (chat && socketRef.current) {
            socketRef.current.emit('join chat', chat._id);
        }
    };

    // Fetch messages for a specific chat
    const fetchMessages = async (chatId: string) => {
        try {
            setLoading(true);
            const response = await api.get(`/messages/${chatId}`);
            setMessages(response.data.messages || []);
            setActiveChat(response.data.chat);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    // Send a message - FIXED
    const sendMessage = async (content: string) => {
        if (!content.trim() || !activeChat || !user) return;

        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const tempMessage: Message = {
            _id: tempId,
            userId: user,
            content: content.trim(),
            chatId: activeChat._id,
            createdAt: new Date().toISOString(),
            readBy: [{ user: user._id, readAt: new Date().toISOString() }]
        };

        // Optimistic update
        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await api.post('/messages', {
                content: content.trim(),
                chatId: activeChat._id
            });

            const sentMessage = response.data;

            // Replace temp message with real message
            setMessages(prev => prev.map(msg =>
                msg._id === tempId ? sentMessage : msg
            ));

            // Update chat list with latest message
            setChats(prev => {
                const updatedChats = prev.map(chat =>
                    chat._id === activeChat._id ? {
                        ...chat,
                        latestMessage: sentMessage,
                        updatedAt: sentMessage.createdAt
                    } : chat
                );
                return updatedChats.sort((a, b) =>
                    new Date(b.latestMessage?.createdAt || b.updatedAt).getTime() -
                    new Date(a.latestMessage?.createdAt || a.updatedAt).getTime()
                );
            });

            // Emit socket event - FIXED: emit to new message, not new chat
            if (socketRef.current) {
                socketRef.current.emit('new message', sentMessage);
            }

        } catch (error) {
            console.error('Message send error:', error);
            // Remove the failed message
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
        }
    };

    // Handle typing indicator
    const handleTyping = (isTypingNow: boolean) => {
        if (!socketRef.current || !activeChat || !user) return;

        if (isTypingNow) {
            socketRef.current.emit('typing', {
                userId: user._id,
                chatId: activeChat._id
            });

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to stop typing
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('stop typing', {
                    userId: user._id,
                    chatId: activeChat._id
                });
            }, 1000);
        } else {
            socketRef.current.emit('stop typing', {
                userId: user._id,
                chatId: activeChat._id
            });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    };

    // Search users
    const handleUserSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchUsers([]);
            return;
        }

        try {
            const response = await api.get(`/auth/search?username=${query}`);
            setSearchUsers(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchUsers([]);
        }
    };

    // Create new chat - FIXED
    const createChat = async (participantId: string) => {
        try {
            setLoading(true);

            // Check if chat already exists with this participant
            const existingChat = chats.find(chat =>
                chat.participants.some(p => p._id === participantId)
            );

            if (existingChat) {
                // If chat exists, just open it
                setSearchQuery('');
                setSearchUsers([]);
                await fetchMessages(existingChat._id);
                return;
            }

            // Create new chat
            const response = await api.post('/chats', {
                participants: [participantId]
            });

            const newChat = response.data;
            console.log('New chat created locally:', newChat);

            // Add to local state immediately
            setChats(prev => {
                const chatExists = prev.some(chat => chat._id === newChat._id);
                if (chatExists) return prev;

                const newChats = [newChat, ...prev];
                return newChats.sort((a, b) => {
                    const aTime = a.latestMessage?.createdAt || a.updatedAt;
                    const bTime = b.latestMessage?.createdAt || b.updatedAt;
                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                });
            });

            // Emit socket event to notify other users
            if (socketRef.current) {
                socketRef.current.emit('chat created', {
                    chat: newChat,
                    participants: newChat.participants.map(p => p._id)
                });
            }

            // Clear search
            setSearchQuery('');
            setSearchUsers([]);

            // Automatically open the new chat
            await fetchMessages(newChat._id);

        } catch (error) {
            console.error('Error creating chat:', error);

            // If it's a duplicate chat error, try to find and open existing chat
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                const existingChat = chats.find(chat =>
                    chat.participants.some(p => p._id === participantId)
                );

                if (existingChat) {
                    setSearchQuery('');
                    setSearchUsers([]);
                    await fetchMessages(existingChat._id);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // Get chat display name
    const getChatDisplayName = (chat: Chat) => {
        if (!user) return 'Unknown User';
        const otherUser = chat.participants.find(p => p._id !== user._id);
        return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
    };

    // Get other user in 1-on-1 chat
    const getOtherUser = (chat: Chat) => {
        if (!user) return undefined;
        return chat.participants.find(p => p._id !== user._id);
    };

    const contextValue: ChatContextType = {
        // State
        chats,
        activeChat,
        messages,
        searchUsers,
        searchQuery,
        loading,
        isTyping,

        // Actions
        setActiveChat,
        fetchChats,
        fetchMessages,
        sendMessage,
        handleUserSearch,
        createChat,
        handleTyping,
        setSearchQuery,

        // Helpers
        getChatDisplayName,
        getOtherUser,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};