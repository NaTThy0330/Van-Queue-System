import { create } from "zustand";
import { api, clearAuthToken, getAuthToken, setAuthToken } from "@/app/lib/api";

export type BookingStatus = "waiting" | "unpaid" | "confirmed" | "expired" | "cancelled";

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  eta: number; // minutes
  queueCount: number;
  departureTime: string;
  vanNumber: string;
}

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  queueNumber: string;
  status: BookingStatus;
  amount: number;
  createdAt: Date;
  expiresAt?: Date;
  slipUrl?: string;
  from: string;
  to: string;
  vanNumber: string;
  departureTime: string;
}

type RouteMap = Record<string, { origin: string; destination: string; durationMinutes?: number }>;

type PaymentStatus = "pending" | "verified" | "rejected" | null;

const USER_KEY = "van_auth_user";

const getStoredUser = (): User | null => {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as User;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const setStoredUser = (user: User | null) => {
  if (typeof localStorage === "undefined") return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

interface AppStore {
  user: User | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  authReady: boolean;

  bookings: Booking[];
  isBookingsLoading: boolean;
  bookingsError: string | null;

  trips: Trip[];
  isTripsLoading: boolean;
  tripsError: string | null;

  routesById: RouteMap;

  bootstrapAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; phone?: string; email: string; password: string }) => Promise<void>;
  logout: () => void;

  loadTrips: () => Promise<void>;
  loadBookings: (includeHistory?: boolean) => Promise<void>;

  addBooking: (tripId: string, payNow: boolean) => Promise<Booking>;
  ensureQueue: (queueId: string) => Promise<boolean>;
  refreshQueue: (queueId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<void>;

  uploadPaymentSlip: (queueId: string, file: File) => Promise<void>;
  getPaymentStatus: (queueId: string) => Promise<PaymentStatus>;

  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  updateBookingSlip: (bookingId: string, slipUrl: string) => void;
}

const formatTime = (dateInput?: string | Date) => {
  if (!dateInput) return "-";
  if (typeof dateInput === "string") {
    if (/^\d{1,2}:\d{2}/.test(dateInput)) return dateInput;
    const parsed = new Date(dateInput);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  }
  const date = dateInput;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
};

const normalizeRoute = (route: any, routesById: RouteMap) => {
  if (!route) return null;
  if (typeof route === "object") {
    const routeId = route._id?.toString();
    if (routeId) {
      routesById[routeId] = {
        origin: route.origin,
        destination: route.destination,
        durationMinutes: route.durationMinutes,
      };
    }
    return route;
  }
  if (typeof route === "string" && routesById[route]) {
    return routesById[route];
  }
  return null;
};

const mapTrip = (trip: any, routesById: RouteMap): Trip => {
  const route = normalizeRoute(trip?.route, routesById) as
    | { origin?: string; destination?: string; durationMinutes?: number }
    | null;
  return {
    id: trip?._id?.toString() ?? "",
    from: route?.origin ?? "-",
    to: route?.destination ?? "-",
    eta: Number(route?.durationMinutes ?? 0),
    queueCount: Number(trip?.onlineBookedSeats ?? 0),
    departureTime: formatTime(trip?.departureTime),
    vanNumber: trip?.vanId ?? trip?.vanRef?.number ?? "-",
  };
};

const mapQueueStatus = (queue: any): BookingStatus => {
  const status = queue?.status;
  const paymentStatus = queue?.paymentStatus;
  const queueType = queue?.queueType;

  if (status === "cancelled") return "cancelled";
  if (status === "expired" || status === "no_show") return "expired";
  if (status === "confirmed" || status === "checked_in" || status === "acknowledged") return "confirmed";

  if (status === "pending") {
    if (queueType === "online_unpaid" || paymentStatus === "unpaid") return "unpaid";
    return "waiting";
  }

  return "waiting";
};

const mapQueue = (queue: any, routesById: RouteMap, tripOverride?: any): Booking => {
  const trip = tripOverride ?? queue?.trip;
  const route = normalizeRoute(trip?.route, routesById) as
    | { origin?: string; destination?: string; durationMinutes?: number }
    | null;
  const queueId = queue?._id?.toString() ?? queue?.id ?? "";
  const ticketCode = queue?.ticketCode;
  const queueNumber = ticketCode || (queueId ? queueId.slice(-4).toUpperCase() : "-");

  return {
    id: queueId,
    tripId: trip?._id?.toString?.() ?? queue?.trip?.toString?.() ?? queue?.trip ?? "",
    userId: queue?.passenger?.toString?.() ?? queue?.passenger ?? "",
    queueNumber,
    status: mapQueueStatus(queue),
    amount: Number(queue?.amount ?? 35),
    createdAt: queue?.createdAt ? new Date(queue.createdAt) : new Date(),
    expiresAt: queue?.autoExpireAt ? new Date(queue.autoExpireAt) : undefined,
    slipUrl: queue?.slipUrl,
    from: route?.origin ?? "-",
    to: route?.destination ?? "-",
    vanNumber: trip?.vanId ?? trip?.vanRef?.number ?? "-",
    departureTime: formatTime(trip?.departureTime),
  };
};

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isAuthLoading: false,
  authError: null,
  authReady: false,

  bookings: [],
  isBookingsLoading: false,
  bookingsError: null,

  trips: [],
  isTripsLoading: false,
  tripsError: null,

  routesById: {},

  bootstrapAuth: async () => {
    const token = getAuthToken();
    if (!token) {
      setStoredUser(null);
      set({ authReady: true });
      return;
    }
    const cachedUser = getStoredUser();
    set({
      isAuthLoading: true,
      authError: null,
      isLoggedIn: true,
      user: cachedUser ?? null,
    });
    try {
      const { passenger } = await api.me();
      const nextUser = {
        id: passenger._id,
        name: passenger.name,
        phone: passenger.phone,
        email: passenger.email,
      };
      setStoredUser(nextUser);
      set({
        user: {
          id: passenger._id,
          name: passenger.name,
          phone: passenger.phone,
          email: passenger.email,
        },
        isLoggedIn: true,
      });
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 401 || status === 403) {
        clearAuthToken();
        setStoredUser(null);
        set({ user: null, isLoggedIn: false, authError: null });
      } else {
        set({ authError: null });
      }
    } finally {
      set({ isAuthLoading: false, authReady: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const { token, passenger } = await api.login(email, password);
      setAuthToken(token);
      const nextUser = {
        id: passenger._id,
        name: passenger.name,
        phone: passenger.phone,
        email: passenger.email,
      };
      setStoredUser(nextUser);
      set({
        user: {
          id: passenger._id,
          name: passenger.name,
          phone: passenger.phone,
          email: passenger.email,
        },
        isLoggedIn: true,
      });
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : "Login failed" });
      throw error;
    } finally {
      set({ isAuthLoading: false });
    }
  },

  register: async (payload) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const { token, passenger } = await api.register(payload);
      setAuthToken(token);
      const nextUser = {
        id: passenger._id,
        name: passenger.name,
        phone: passenger.phone,
        email: passenger.email,
      };
      setStoredUser(nextUser);
      set({
        user: {
          id: passenger._id,
          name: passenger.name,
          phone: passenger.phone,
          email: passenger.email,
        },
        isLoggedIn: true,
      });
    } catch (error) {
      set({ authError: error instanceof Error ? error.message : "Register failed" });
      throw error;
    } finally {
      set({ isAuthLoading: false });
    }
  },

  logout: () => {
    clearAuthToken();
    setStoredUser(null);
    set({ user: null, isLoggedIn: false, bookings: [], trips: [], authReady: true });
  },

  loadTrips: async () => {
    set({ isTripsLoading: true, tripsError: null });
    try {
      const { trips } = await api.listTrips();
      const routesById = { ...get().routesById };
      const mapped = trips.map((trip) => mapTrip(trip, routesById));
      set({ trips: mapped, routesById });
    } catch (error) {
      set({ tripsError: error instanceof Error ? error.message : "Unable to load trips" });
    } finally {
      set({ isTripsLoading: false });
    }
  },

  loadBookings: async (includeHistory = true) => {
    set({ isBookingsLoading: true, bookingsError: null });
    try {
      const { routes } = await api.listRoutes();
      const routesById = routes.reduce<RouteMap>((acc, route) => {
        acc[route._id] = {
          origin: route.origin,
          destination: route.destination,
          durationMinutes: route.durationMinutes,
        };
        return acc;
      }, {});

      const { queues } = await api.listMyQueues(includeHistory);
      const mapped = queues.map((queue) => mapQueue(queue, { ...routesById }));
      set({ bookings: mapped, routesById: { ...get().routesById, ...routesById } });
    } catch (error) {
      set({ bookingsError: error instanceof Error ? error.message : "Unable to load bookings" });
    } finally {
      set({ isBookingsLoading: false });
    }
  },

  addBooking: async (tripId: string, payNow: boolean) => {
    const trip = get().trips.find((t) => t.id === tripId);
    if (!trip) throw new Error("Trip not found");
    const user = get().user;
    if (!user) throw new Error("Not logged in");

    const { hold } = await api.createHold(tripId, 1);
    const queueType = payNow ? "online_paid" : "online_unpaid";
    const { queue } = await api.commitHold(hold.id, queueType);

    const routesById = { ...get().routesById };
    const booking = mapQueue(queue, routesById, {
      _id: trip.id,
      route: { origin: trip.from, destination: trip.to, durationMinutes: trip.eta },
      departureTime: trip.departureTime,
      vanId: trip.vanNumber,
    });

    set((state) => ({ bookings: [booking, ...state.bookings] }));
    return booking;
  },

  ensureQueue: async (queueId: string) => {
    const existing = get().bookings.find((b) => b.id === queueId);
    if (existing) {
      return get().refreshQueue(queueId);
    }

    return get().refreshQueue(queueId);
  },

  refreshQueue: async (queueId: string) => {
    try {
      const { routes } = await api.listRoutes();
      const routesById = routes.reduce<RouteMap>((acc, route) => {
        acc[route._id] = {
          origin: route.origin,
          destination: route.destination,
          durationMinutes: route.durationMinutes,
        };
        return acc;
      }, {});

      const { queue } = await api.getQueue(queueId);
      const booking = mapQueue(queue, { ...routesById });
      set((state) => ({
        bookings: [
          booking,
          ...state.bookings.filter((b) => b.id !== booking.id),
        ],
        routesById: { ...state.routesById, ...routesById },
      }));
      return true;
    } catch {
      return false;
    }
  },

  cancelBooking: async (bookingId: string) => {
    try {
      const { queue } = await api.cancelQueue(bookingId);
      const routesById = { ...get().routesById };
      const booking = mapQueue(queue, routesById);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, status: booking.status } : b)),
      }));
    } catch (error) {
      throw error;
    }
  },

  uploadPaymentSlip: async (queueId: string, file: File) => {
    const { payment } = await api.uploadPaymentSlip(queueId, file);
    if (payment?.slipUrl) {
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === queueId ? { ...b, slipUrl: payment.slipUrl } : b
        ),
      }));
    }
  },

  getPaymentStatus: async (queueId: string) => {
    try {
      const { payment } = await api.getPaymentByQueue(queueId);
      return (payment?.status as PaymentStatus) ?? null;
    } catch {
      return null;
    }
  },

  updateBookingStatus: (bookingId: string, status: BookingStatus) => {
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)),
    }));
  },

  updateBookingSlip: (bookingId: string, slipUrl: string) => {
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, slipUrl } : b)),
    }));
  },
}));
