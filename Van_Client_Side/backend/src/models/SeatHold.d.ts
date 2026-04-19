import { Document, Types } from "mongoose";
export interface SeatHoldEntity {
    passenger: Types.ObjectId;
    trip: Types.ObjectId;
    seatCount: number;
    expiresAt: Date;
    released: boolean;
    createdAt: Date;
}
export interface SeatHoldDocument extends SeatHoldEntity, Document {
}
export declare const SeatHoldModel: import("mongoose").Model<SeatHoldDocument, {}, {}, {}, Document<unknown, {}, SeatHoldDocument, {}, import("mongoose").DefaultSchemaOptions> & SeatHoldDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, SeatHoldDocument>;
//# sourceMappingURL=SeatHold.d.ts.map