import { io, Socket } from "socket.io-client";
import { getApiUrl } from "./env";

let socket: Socket | null = null;
let joinedTripIds = new Set<string>();
let joinedPassengerId: string | null = null;

const getPassengerBackendUrl = () => getApiUrl();

const ensureSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io(getPassengerBackendUrl(), {
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionDelay: 3000,
  });

  socket.on("connect", () => {
    console.log("[Notification] Connected to passenger server");
    for (const tripId of joinedTripIds) {
      socket?.emit("join:trip", tripId);
    }
    if (joinedPassengerId) {
      socket?.emit("join:passenger", joinedPassengerId);
    }
  });

  socket.on("connect_error", (error) => {
    console.error("[Notification] Passenger socket connect_error:", error.message);
  });

  return socket;
};

export const syncDepartureTripSubscriptions = (tripIds: string[]) => {
  const s = ensureSocket();
  const nextTripIds = new Set(tripIds.filter(Boolean));

  for (const tripId of nextTripIds) {
    if (!joinedTripIds.has(tripId)) {
      s.emit("join:trip", tripId);
    }
  }

  for (const tripId of joinedTripIds) {
    if (!nextTripIds.has(tripId)) {
      s.emit("leave:trip", tripId);
    }
  }

  joinedTripIds = nextTripIds;
};

export const syncPassengerSubscription = (passengerId?: string | null) => {
  const s = ensureSocket();
  const nextPassengerId = passengerId || null;

  if (joinedPassengerId && joinedPassengerId !== nextPassengerId) {
    s.emit("leave:passenger", joinedPassengerId);
  }

  if (nextPassengerId && joinedPassengerId !== nextPassengerId) {
    s.emit("join:passenger", nextPassengerId);
  }

  joinedPassengerId = nextPassengerId;
};

export const onDepartureAlert = (
  callback: (data: { trip_id: string; title: string; message: string; route?: string | null; departure_time?: string | null }) => void
): (() => void) => {
  const s = ensureSocket();
  s.on("departure:alert", callback);
  return () => {
    s.off("departure:alert", callback);
  };
};

export const disconnectPassengerSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  joinedTripIds = new Set();
  joinedPassengerId = null;
};
