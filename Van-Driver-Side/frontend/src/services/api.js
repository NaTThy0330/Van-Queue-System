import axios from 'axios';
import { getToken, removeToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`);

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeToken();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth
export const loginDriver = async (phone, password) => {
    const { data } = await api.post('/api/driver/login', { phone, password });
    return data;
};

export const getDriverProfile = async () => {
    const { data } = await api.get('/api/driver/profile');
    return data;
};

// Van
export const getAvailableVans = async () => {
    const { data } = await api.get('/api/driver/vans/available');
    return data;
};

export const selectVan = async (driverId, plateNumber) => {
    const { data } = await api.post('/api/driver/select-van', {
        driver_id: driverId,
        plate_number: plateNumber
    });
    return data;
};

// Trips
export const getAvailableTrips = async () => {
    const { data } = await api.get('/api/driver/trips/available');
    return data;
};

export const assignTrip = async (tripId, driverId, vanId) => {
    const { data } = await api.post(`/api/driver/trips/${tripId}/assign`, {
        driver_id: driverId,
        van_id: vanId
    });
    return data;
};

export const getCurrentTrip = async (driverId) => {
    const { data } = await api.get(`/api/driver/trips/current/${driverId}`);
    return data;
};

export const getRoutes = async () => {
    const { data } = await api.get('/api/driver/routes');
    return data;
};

export const createTrip = async (tripData) => {
    const { data } = await api.post('/api/driver/trips/create', tripData);
    return data;
};

// Queue / Walk-in
export const quickWalkin = async (tripId) => {
    const { data } = await api.post('/api/driver/walk-in', { trip_id: tripId });
    return data;
};

export const getPassengers = async (tripId) => {
    const { data } = await api.get(`/api/driver/trips/${tripId}/passengers`);
    return data;
};

export const checkInPassenger = async (queueId) => {
    const { data } = await api.post(`/api/driver/queue/${queueId}/check-in`);
    return data;
};

export const cancelPassenger = async (queueId, reason) => {
    const { data } = await api.post(`/api/driver/queue/${queueId}/cancel`, { reason });
    return data;
};

// Payments
export const getPendingPayments = async (tripId) => {
    const { data } = await api.get(`/api/driver/payments/pending/${tripId}`);
    return data;
};

export const verifyPayment = async (paymentId, action, reason = '') => {
    const { data } = await api.post(`/api/driver/payments/${paymentId}/verify`, { action, reason });
    return data;
};

// Trip Status
export const sendDepartureNotification = async (tripId) => {
    const { data } = await api.post(`/api/driver/trips/${tripId}/notify-departure`);
    return data;
};

export const confirmDeparture = async (tripId, location) => {
    const { data } = await api.post(`/api/driver/trips/${tripId}/depart`, { current_location: location });
    return data;
};

export const completeTrip = async (tripId, location) => {
    const { data } = await api.post(`/api/driver/trips/${tripId}/complete`, { final_location: location });
    return data;
};

export const clearNoShow = async (tripId) => {
    const { data } = await api.post(`/api/driver/trips/${tripId}/clear-noshow`);
    return data;
};

export const abandonTrip = async (tripId) => {
    const { data } = await api.post(`/api/driver/trips/${tripId}/abandon`);
    return data;
};

// Daily Shift
export const getShiftStatus = async (driverId) => {
    const { data } = await api.get(`/api/driver/shift/status/${driverId}`);
    return data;
};

export const checkVanBinding = async (vanId) => {
    const { data } = await api.get(`/api/driver/vans/${vanId}/binding`);
    return data;
};

export const changeVan = async (driverId, plateNumber) => {
    const { data } = await api.post('/api/driver/shift/change-van', {
        driver_id: driverId,
        plate_number: plateNumber
    });
    return data;
};

export default api;
