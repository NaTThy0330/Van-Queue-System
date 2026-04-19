import { PassengerDocument } from "../models/Passenger";
interface PushPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}
export declare const sendPushNotification: (passenger: PassengerDocument, payload: PushPayload) => Promise<void>;
export {};
//# sourceMappingURL=notificationService.d.ts.map