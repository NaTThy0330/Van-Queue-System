/// <reference types="vite/client" />
declare module 'motion/react';

interface Window {
  __APP_CONFIG__?: {
    VITE_API_URL?: string;
    VITE_DRIVER_SOCKET_URL?: string;
  };
}
