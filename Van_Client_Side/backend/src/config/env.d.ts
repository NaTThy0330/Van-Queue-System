interface AppConfig {
    port: number;
    mongoUri: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    seatHoldSeconds: number;
    unpaidCutoffMinutes: number;
    paidLateMinutes: number;
    uploadDir: string;
    fcmServerKey?: string;
}
export declare const config: AppConfig;
export {};
//# sourceMappingURL=env.d.ts.map