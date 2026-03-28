import { Document } from "mongoose";
export interface Passenger {
    name: string;
    phone?: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    fcmTokens: string[];
}
export interface PassengerDocument extends Passenger, Document {
}
export declare const PassengerModel: import("mongoose").Model<PassengerDocument, {}, {}, {}, Document<unknown, {}, PassengerDocument, {}, import("mongoose").DefaultSchemaOptions> & PassengerDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, PassengerDocument>;
//# sourceMappingURL=Passenger.d.ts.map