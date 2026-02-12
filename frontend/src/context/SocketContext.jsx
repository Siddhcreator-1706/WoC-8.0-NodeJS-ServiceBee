import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const socketRef = useRef(null);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!user) {
            disconnect();
            return;
        }

        // Don't reconnect if already connected for this user
        if (socketRef.current?.connected) return;

        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            setIsConnected(true);
            setSocket(newSocket);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setSocket(null);
        });

        newSocket.on('connect_error', () => {
            setIsConnected(false);
        });

        newSocket.on('user:online', ({ userId }) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        });

        newSocket.on('user:offline', ({ userId }) => {
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                updated.delete(userId);
                return updated;
            });
        });

        return () => {
            newSocket.disconnect();
            socketRef.current = null;
        };
    }, [user, disconnect]);

    const value = {
        socket,
        isConnected,
        onlineUsers,
        isUserOnline: (userId) => onlineUsers.has(userId)
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
