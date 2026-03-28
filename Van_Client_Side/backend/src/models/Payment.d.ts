import { Document, Types } from "mongoose";
export type PaymentStatus = "pending" | "verified" | "rejected";
export interface PaymentEntity {
    queue: Types.ObjectId;
    amount?: number;
    slipUrl?: string;
    status: PaymentStatus;
    verifiedBy?: Types.ObjectId;
    createdAt: Date;
    verifiedAt?: Date;
}
export interface PaymentDocument extends PaymentEntity, Document {
}
export declare const PaymentModel: import("mongoose").Model<PaymentDocument, {}, {}, {}, Document<unknown, {}, PaymentDocument, {}, import("mongoose").DefaultSchemaOptions> & PaymentDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, PaymentDocument>;
//# sourceMappingURL=Payment.d.ts.map