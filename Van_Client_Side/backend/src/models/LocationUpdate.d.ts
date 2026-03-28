import { Document, Types } from "mongoose";
export interface LocationUpdateEntity {
    trip: Types.ObjectId;
    lat: number;
    lng: number;
    timestamp: Date;
}
export interface LocationUpdateDocument extends LocationUpdateEntity, Document {
}
export declare const LocationUpdateModel: import("mongoose").Model<LocationUpdateDocument, {}, {}, {}, Document<unknown, {}, LocationUpdateDocument, {}, import("mongoose").DefaultSchemaOptions> & LocationUpdateDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, LocationUpdateDocument>;
//# sourceMappingURL=LocationUpdate.d.ts.map