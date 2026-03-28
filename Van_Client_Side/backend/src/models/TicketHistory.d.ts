import { Document, Types } from "mongoose";
export interface TicketHistoryEntity {
    passenger: Types.ObjectId;
    trip: Types.ObjectId;
    queue: Types.ObjectId;
    ticketCode: string;
    issuedAt: Date;
}
export interface TicketHistoryDocument extends TicketHistoryEntity, Document {
}
export declare const TicketHistoryModel: import("mongoose").Model<TicketHistoryDocument, {}, {}, {}, Document<unknown, {}, TicketHistoryDocument, {}, import("mongoose").DefaultSchemaOptions> & TicketHistoryDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, TicketHistoryDocument>;
//# sourceMappingURL=TicketHistory.d.ts.map