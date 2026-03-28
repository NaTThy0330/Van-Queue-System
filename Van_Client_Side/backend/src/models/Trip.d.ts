import { Document, Types } from "mongoose";
export type TripStatus = "scheduled" | "departed" | "completed" | "cancelled";
export interface TripEntity {
    vanId: string;
    route: Types.ObjectId;
    departureTime: Date;
    arrivalTime?: Date;
    status: TripStatus;
    seatCapacity: number;
    onlineQuota: number;
    walkinQuota: number;
    onlineHeldSeats: number;
    onlineBookedSeats: number;
    createdAt: Date;
}
export type TripDocument = TripEntity & Document & {
    computeOnlineRemaining(): number;
};
export declare const TripModel: import("mongoose").Model<TripDocument, {}, {}, {}, Document<unknown, {}, TripDocument, {}, import("mongoose").DefaultSchemaOptions> & TripEntity & Document<Types.ObjectId, any, any, Record<string, any>, {}> & {
    computeOnlineRemaining(): number;
} & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, TripDocument>;
//# sourceMappingURL=Trip.d.ts.map