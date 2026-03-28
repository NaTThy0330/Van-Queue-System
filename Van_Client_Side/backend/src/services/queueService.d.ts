import mongoose from "mongoose";
import { QueueDocument } from "../models/Queue";
export declare const cancelQueue: (params: {
    queueId: string;
    passengerId: string;
}) => Promise<mongoose.Document<unknown, {}, QueueDocument, {}, mongoose.DefaultSchemaOptions> & QueueDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const listPassengerQueues: (params: {
    passengerId: string;
    includeHistory?: boolean;
}) => Promise<{
    queues: (mongoose.Document<unknown, {}, QueueDocument, {}, mongoose.DefaultSchemaOptions> & QueueDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[];
    ticketHistory?: never;
} | {
    queues: (mongoose.Document<unknown, {}, QueueDocument, {}, mongoose.DefaultSchemaOptions> & QueueDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[];
    ticketHistory: (mongoose.Document<unknown, {}, import("../models/TicketHistory").TicketHistoryDocument, {}, mongoose.DefaultSchemaOptions> & import("../models/TicketHistory").TicketHistoryDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[];
}>;
export declare const recordTicketHistory: (queue: QueueDocument) => Promise<void>;
//# sourceMappingURL=queueService.d.ts.map