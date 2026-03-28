/**
 * Socket Service - Real-time Updates
 */
import { io } from 'socket.io-client';
import { getToken } from './auth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);

let socket = null;

export const initSocket = () => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        auth: { token: getToken() },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const joinTrip = (tripId) => {
    const s = getSocket();
    s.emit('join-trip', tripId);
    console.log(`📡 Joined trip room: ${tripId}`);
};

export const leaveTrip = (tripId) => {
    const s = getSocket();
    s.emit('leave-trip', tripId);
};

export const onSeatUpdate = (callback) => {
    const s = getSocket();
    s.on('seat:updated', callback);
    return () => s.off('seat:updated', callback);
};

export const onBookingAdded = (callback) => {
    const s = getSocket();
    s.on('booking:added', callback);
    return () => s.off('booking:added', callback);
};

export const onTripDeparted = (callback) => {
    const s = getSocket();
    s.on('trip:departed', callback);
    return () => s.off('trip:departed', callback);
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
