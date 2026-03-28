export declare class AppError extends Error {
    statusCode: number;
    details: Record<string, unknown> | undefined;
    constructor(message: string, statusCode?: number, details?: Record<string, unknown>);
}
//# sourceMappingURL=AppError.d.ts.map