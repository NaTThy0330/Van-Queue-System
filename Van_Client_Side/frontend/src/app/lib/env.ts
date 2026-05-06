const normalizeUrl = (value: string) => value.replace(/\/$/, "");

type RuntimeConfig = {
  VITE_API_URL?: string;
  VITE_DRIVER_SOCKET_URL?: string;
};

const getFallbackOrigin = () => {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return "";
};

const getRuntimeApiUrl = () => {
  if (typeof window === "undefined") return "";

  const runtime = (window as Window & { __APP_CONFIG__?: RuntimeConfig }).__APP_CONFIG__;
  return runtime?.VITE_API_URL || "";
};

const getRuntimeDriverSocketUrl = () => {
  if (typeof window === "undefined") return "";

  const runtime = (window as Window & { __APP_CONFIG__?: RuntimeConfig }).__APP_CONFIG__;
  return runtime?.VITE_DRIVER_SOCKET_URL || "";
};

export const getApiUrl = () =>
  normalizeUrl(String(getRuntimeApiUrl() || import.meta.env.VITE_API_URL || getFallbackOrigin()));

export const getDriverSocketUrl = () => {
  return normalizeUrl(
    String(
      getRuntimeDriverSocketUrl() ||
        import.meta.env.VITE_DRIVER_SOCKET_URL ||
        import.meta.env.VITE_API_URL ||
        getFallbackOrigin()
    )
  );
};
