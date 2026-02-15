import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ChatWidget = () => {
    const { socket, isConnected, isUserOnline } = useSocket();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typing, setTyping] = useState(null);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/chat/conversations');
            setConversations(data);
            const total = data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
            setUnreadTotal(total);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
    }, []);

    // Fetch admin list
    const fetchAdmins = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/chat/admins');
            setAdmins(data);
        } catch (err) {
            console.error('Failed to fetch admins:', err);
        }
    }, []);

    // Fetch chat history for a user
    const openChat = useCallback(async (chatUser) => {
        setActiveChat(chatUser);
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/chat/history/${chatUser._id}`);
            setMessages(data.messages);

            // Mark as read
            await axios.put(`/api/chat/read/${chatUser._id}`);
            if (socket) {
                socket.emit('chat:read', { senderId: chatUser._id });
            }

            fetchConversations(); // Refresh unread counts
        } catch (err) {
            console.error('Failed to fetch chat history:', err);
        } finally {
            setLoading(false);
        }
    }, [socket, fetchConversations]);

    // Load conversations and admins when widget opens
    useEffect(() => {
        if (isOpen && user) {
            fetchConversations();
            if (user.role !== 'admin') {
                fetchAdmins();
            }
        }
    }, [isOpen, user, fetchConversations, fetchAdmins]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceive = (message) => {
            // If this message is from the active chat, display it
            if (activeChat && message.sender._id === activeChat._id) {
                setMessages(prev => [...prev, message]);
                // Mark as read immediately
                socket.emit('chat:read', { senderId: activeChat._id });
                axios.put(`/api/chat/read/${activeChat._id}`).catch(() => { });
            }
            // Refresh conversations list
            fetchConversations();
        };

        const handleSent = (message) => {
            setMessages(prev => [...prev, message]);
        };

        const handleTyping = ({ userId, name }) => {
            if (activeChat && userId === activeChat._id) {
                setTyping(name);
            }
        };

        const handleStopTyping = ({ userId }) => {
            if (activeChat && userId === activeChat._id) {
                setTyping(null);
            }
        };

        const handleMessagesRead = () => {
            setMessages(prev => prev.map(m => ({ ...m, read: true })));
        };

        socket.on('chat:receive', handleReceive);
        socket.on('chat:sent', handleSent);
        socket.on('chat:typing', handleTyping);
        socket.on('chat:stop-typing', handleStopTyping);
        socket.on('chat:messages-read', handleMessagesRead);

        return () => {
            socket.off('chat:receive', handleReceive);
            socket.off('chat:sent', handleSent);
            socket.off('chat:typing', handleTyping);
            socket.off('chat:stop-typing', handleStopTyping);
            socket.off('chat:messages-read', handleMessagesRead);
        };
    }, [socket, activeChat, fetchConversations]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Send message
    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || !socket) return;

        socket.emit('chat:send', {
            receiverId: activeChat._id,
            message: newMessage.trim()
        });

        setNewMessage('');
        // Stop typing indicator
        socket.emit('chat:stop-typing', { receiverId: activeChat._id });
    };

    // Handle typing indicator
    const handleTypingInput = (e) => {
        setNewMessage(e.target.value);
        if (!socket || !activeChat) return;

        socket.emit('chat:typing', { receiverId: activeChat._id });

        // Clear previous timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('chat:stop-typing', { receiverId: activeChat._id });
        }, 2000);
    };

    // Format time
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-pumpkin to-amber-600 shadow-lg shadow-pumpkin/30 flex items-center justify-center hover:scale-110 transition-transform"
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}

                {/* Unread badge */}
                {unreadTotal > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-[360px] h-[500px] bg-[#1a1a24] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pumpkin/20 to-amber-600/20 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            {activeChat ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setActiveChat(null)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div>
                                        <p className="text-white font-medium text-sm">{activeChat.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {isUserOnline(activeChat._id) ? (
                                                <span className="text-green-400">● Online</span>
                                            ) : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-white font-medium">💬 Messages</p>
                                    <p className="text-xs text-gray-400">
                                        {isConnected ? (
                                            <span className="text-green-400">● Connected</span>
                                        ) : (
                                            <span className="text-red-400">● Disconnected</span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        {activeChat ? (
                            // Chat Messages View
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pumpkin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                            No messages yet. Say hello! 👋
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMine = (msg.sender?._id || msg.sender) === user._id;
                                            const showAvatar = !isMine && (idx === 0 || messages[idx - 1].sender?._id !== msg.sender?._id);

                                            return (
                                                <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                                                    {!isMine && (
                                                        <div className="w-8 flex-shrink-0 flex flex-col justify-end mr-2">
                                                            {showAvatar ? (
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                                                    {msg.sender?.name?.[0]?.toUpperCase() || '?'}
                                                                </div>
                                                            ) : (
                                                                <div className="w-8" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-md ${isMine
                                                            ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-br-none'
                                                            : 'bg-[#2a2a35] text-gray-200 rounded-bl-none border border-gray-700'
                                                            }`}
                                                    >
                                                        <p className="break-words leading-relaxed">{msg.message}</p>
                                                        <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-white/70' : 'text-gray-500'}`}>
                                                            {formatTime(msg.createdAt)}
                                                            {isMine && (
                                                                <span className="ml-1 opacity-80">{msg.read ? '✓✓' : '✓'}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* Typing indicator */}
                                    {typing && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/10 px-3 py-2 rounded-2xl rounded-bl-md">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleTypingInput}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pumpkin/50 transition-colors"
                                        maxLength={2000}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-pumpkin/80 hover:bg-pumpkin text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Send
                                    </button>
                                </form>
                            </>
                        ) : (
                            // Conversations List View
                            <div className="flex-1 overflow-y-auto scrollbar-thin">
                                {/* Start new chat with admin (for non-admin users) */}
                                {user.role !== 'admin' && admins.length > 0 && (
                                    <div className="p-3 border-b border-white/5">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">Support</p>
                                        {admins.map(admin => (
                                            <button
                                                key={admin._id}
                                                onClick={() => openChat(admin)}
                                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                                            >
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pumpkin to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {admin.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    {isUserOnline(admin._id) && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1a1a24]" />
                                                    )}
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="text-white text-sm font-medium">{admin.name}</p>
                                                    <p className="text-xs text-gray-500">Admin Support</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Existing conversations */}
                                <div className="p-3">
                                    {conversations.length > 0 && (
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">Recent</p>
                                    )}
                                    {conversations.map(conv => (
                                        <button
                                            key={conv.user._id}
                                            onClick={() => openChat(conv.user)}
                                            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {conv.user.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                {isUserOnline(conv.user._id) && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1a1a24]" />
                                                )}
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-white text-sm font-medium truncate">{conv.user.name}</p>
                                                    <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">
                                                        {formatTime(conv.lastMessageAt)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="bg-pumpkin text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 ml-2">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                    {conversations.length === 0 && (user.role === 'admin' || admins.length === 0) && (
                                        <div className="text-center text-gray-500 text-sm py-12">
                                            No conversations yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
