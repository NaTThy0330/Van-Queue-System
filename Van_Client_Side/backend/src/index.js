"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const socket_1 = require("./lib/socket");
const holdExpirationJob_1 = require("./jobs/holdExpirationJob");
const queueAutoCloseJob_1 = require("./jobs/queueAutoCloseJob");
const server = http_1.default.createServer(app_1.default);
(0, socket_1.initSocket)(server);
const bootstrap = async () => {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        server.listen(env_1.config.port, () => {
            console.log(`API listening on port ${env_1.config.port}`);
        });
        (0, holdExpirationJob_1.startSeatHoldExpirationJob)();
        (0, queueAutoCloseJob_1.startQueueAutoCloseJob)();
    }
    catch (error) {
        console.error("Failed to bootstrap service", error);
        process.exit(1);
    }
};
bootstrap();
process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection", error);
});
//# sourceMappingURL=index.js.map