import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    const connectedUserIdRef = useRef(null);

    useEffect(() => {
        if (!user?._id) return;

        if (socketRef.current?.connected && connectedUserIdRef.current === user._id) {
            return;
        }

        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;
        connectedUserIdRef.current = user._id;

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
            if (newSocket) {
                newSocket.disconnect();
                newSocket.removeAllListeners();
            }
            if (socketRef.current === newSocket) {
                socketRef.current = null;
                connectedUserIdRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
        };
    }, [user?._id]);

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
