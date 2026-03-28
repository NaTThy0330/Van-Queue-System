/**
 * Auth Service - Token Management
 */
const TOKEN_KEY = 'driver_token';
const DRIVER_KEY = 'driver_data';

export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DRIVER_KEY);
};

export const setDriver = (driver) => {
    localStorage.setItem(DRIVER_KEY, JSON.stringify(driver));
};

export const getDriver = () => {
    const data = localStorage.getItem(DRIVER_KEY);
    return data ? JSON.parse(data) : null;
};

export const isAuthenticated = () => {
    return !!getToken();
};
