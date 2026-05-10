/**
 * Socket helper สำหรับรับการแจ้งเตือนจากฝั่งคนขับ (Driver Backend)
 * ใช้เฉพาะ notification feature เท่านั้น — ไม่แก้ไขส่วนอื่นของระบบ
 */
import { io, Socket } from "socket.io-client";
import { getDriverSocketUrl } from "./env";

let socket: Socket | null = null;
let joinedDriverTripIds = new Set<string>();

const getDriverBackendUrl = (): string => {
  return getDriverSocketUrl();
};

export const initDriverSocket = (): Socket => {
  if (socket?.connected) return socket;

  socket = io(getDriverBackendUrl(), {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 3000,
  });

  socket.on("connect", () => {
    console.log("[Notification] Connected to driver server");
    for (const tripId of joinedDriverTripIds) {
      socket?.emit("join-trip", tripId);
    }
  });

  socket.on("connect_error", (error) => {
    console.error("[Notification] Driver socket connect_error:", error.message);
  });

  socket.on("disconnect", () => {
    console.log("[Notification] Disconnected from driver server");
  });

  return socket;
};

export const syncDriverTripSubscriptions = (tripIds: string[]) => {
  const s = initDriverSocket();
  const nextTripIds = new Set(tripIds.filter(Boolean));

  for (const tripId of nextTripIds) {
    if (!joinedDriverTripIds.has(tripId)) {
      s.emit("join-trip", tripId);
    }
  }

  for (const tripId of joinedDriverTripIds) {
    if (!nextTripIds.has(tripId)) {
      s.emit("leave-trip", tripId);
    }
  }

  joinedDriverTripIds = nextTripIds;
};

export const onDepartureAlert = (
  callback: (data: { trip_id: string; route: string; title: string; message: string }) => void
): (() => void) => {
  const s = initDriverSocket();
  s.on("departure:alert", callback);
  return () => {
    s.off("departure:alert", callback);
  };
};

export const disconnectDriverSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
