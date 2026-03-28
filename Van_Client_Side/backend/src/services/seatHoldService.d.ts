import mongoose from "mongoose";
import { QueueType } from "../models/Queue";
export declare const createSeatHold: (params: {
    passengerId: string;
    tripId: string;
    seatCount: number;
}) => Promise<mongoose.Document<unknown, {}, import("../models/SeatHold").SeatHoldDocument, {}, mongoose.DefaultSchemaOptions> & import("../models/SeatHold").SeatHoldDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const releaseSeatHold: (holdId: string) => Promise<(mongoose.Document<unknown, {}, import("../models/SeatHold").SeatHoldDocument, {}, mongoose.DefaultSchemaOptions> & import("../models/SeatHold").SeatHoldDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | null>;
export declare const commitSeatHold: (params: {
    holdId: string;
    passengerId: string;
    queueType: QueueType;
}) => Promise<mongoose.Document<unknown, {}, import("../models/Queue").QueueDocument, {}, mongoose.DefaultSchemaOptions> & import("../models/Queue").QueueDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
//# sourceMappingURL=seatHoldService.d.ts.map