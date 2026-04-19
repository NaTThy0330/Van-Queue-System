import { Document, Types } from "mongoose";
export type QueueType = "online_paid" | "online_unpaid" | "walkin";
export type QueueStatus = "pending" | "confirmed" | "cancelled" | "expired" | "no_show";
export interface QueueEntity {
    passenger: Types.ObjectId;
    trip: Types.ObjectId;
    queueType: QueueType;
    status: QueueStatus;
    seatCount: number;
    ticketCode?: string;
    autoExpireAt?: Date;
    createdAt: Date;
}
export interface QueueDocument extends QueueEntity, Document {
}
export declare const QueueModel: import("mongoose").Model<QueueDocument, {}, {}, {}, Document<unknown, {}, QueueDocument, {}, import("mongoose").DefaultSchemaOptions> & QueueDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, QueueDocument>;
//# sourceMappingURL=Queue.d.ts.map