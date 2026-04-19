const TOKEN_KEY = "van_auth_token";

export type ApiError = {
  message?: string;
  details?: unknown;
};

const getBaseUrl = () => {
  const base = import.meta.env.VITE_API_URL;
  return base && typeof base === "string" ? base.replace(/\/$/, "") : "http://localhost:4000";
};

export const getAuthToken = () => {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

const parseJson = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> => {
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && String(data.message)) ||
      res.statusText ||
      "Request failed";
    const error = new Error(message) as Error & { status?: number; data?: unknown };
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
};

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; passenger: { _id: string; name: string; phone?: string; email: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    ),
  register: (payload: { name: string; phone?: string; email: string; password: string }) =>
    request<{ token: string; passenger: { _id: string; name: string; phone?: string; email: string } }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      false
    ),
  me: () => request<{ passenger: { _id: string; name: string; phone?: string; email: string } }>("/auth/me"),
  listRoutes: () =>
    request<{ routes: Array<{ _id: string; origin: string; destination: string; durationMinutes?: number }> }>(
      "/routes"
    ),
  listTrips: () =>
    request<{ trips: any[] }>("/trips"),
  createHold: (tripId: string, seatCount: number) =>
    request<{ hold: { id: string; seatCount: number; expiresAt: string; ttlSeconds: number } }>(
      `/trips/${tripId}/hold`,
      {
        method: "POST",
        body: JSON.stringify({ seat_count: seatCount }),
      }
    ),
  commitHold: (holdId: string, queueType: "online_paid" | "online_unpaid") =>
    request<{ queue: any }>(`/holds/${holdId}/commit`, {
      method: "POST",
      body: JSON.stringify({ queue_type: queueType }),
    }),
  listMyQueues: (includeHistory = true) =>
    request<{ queues: any[]; ticketHistory?: any[] }>(
      `/queues/my${includeHistory ? "?include=history" : ""}`
    ),
  getQueue: (queueId: string) => request<{ queue: any; payment?: any }>(`/queues/${queueId}`),
  cancelQueue: (queueId: string) =>
    request<{ queue: any }>(`/queues/${queueId}/cancel`, { method: "POST" }),
  uploadPaymentSlip: (queueId: string, file: File) => {
    const form = new FormData();
    form.append("slip", file);
    return request<{ payment: any }>(`/queues/${queueId}/payment-slip`, {
      method: "POST",
      body: form,
    });
  },
  getPaymentByQueue: (queueId: string) => request<{ payment?: any }>(`/queues/${queueId}/payment`),
};
