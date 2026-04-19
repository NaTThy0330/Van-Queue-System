import { Document } from "mongoose";
export interface RouteEntity {
    origin: string;
    destination: string;
    distance: number;
    createdAt: Date;
}
export interface RouteDocument extends RouteEntity, Document {
}
export declare const RouteModel: import("mongoose").Model<RouteDocument, {}, {}, {}, Document<unknown, {}, RouteDocument, {}, import("mongoose").DefaultSchemaOptions> & RouteDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, RouteDocument>;
//# sourceMappingURL=Route.d.ts.map