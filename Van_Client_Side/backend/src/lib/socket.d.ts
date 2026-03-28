import http from "http";
import { Server } from "socket.io";
export declare const initSocket: (server: http.Server) => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const emitTripAvailability: (tripId: string) => Promise<void>;
export declare const emitQueueUpdate: (payload: {
    queueId: string;
    status: string;
    passengerId: string;
}) => boolean;
export declare const emitPaymentUpdate: (payload: {
    queueId: string;
    status: string;
    passengerId: string;
}) => boolean;
//# sourceMappingURL=socket.d.ts.map