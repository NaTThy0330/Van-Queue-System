const normalizeUrl = (value) => value.replace(/\/$/, "");

const getFallbackOrigin = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }

    return '';
};

const getRuntimeApiUrl = () => {
    if (typeof window === 'undefined') return '';

    const runtime = window.__APP_CONFIG__;
    return runtime?.VITE_API_URL || '';
};

const getRuntimeSocketUrl = () => {
    if (typeof window === 'undefined') return '';

    const runtime = window.__APP_CONFIG__;
    return runtime?.VITE_SOCKET_URL || '';
};

export const getApiUrl = () =>
    normalizeUrl(String(getRuntimeApiUrl() || import.meta.env.VITE_API_URL || getFallbackOrigin()));

export const getDriverSocketUrl = () =>
    normalizeUrl(String(getRuntimeSocketUrl() || import.meta.env.VITE_SOCKET_URL || getApiUrl()));
