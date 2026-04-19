"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const env_1 = require("../config/env");
const sendPushNotification = async (passenger, payload) => {
    if (!passenger.fcmTokens.length)
        return;
    if (!env_1.config.fcmServerKey) {
        console.info("FCM disabled; skipping push", { payload });
        return;
    }
    await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `key=${env_1.config.fcmServerKey}`,
        },
        body: JSON.stringify({
            registration_ids: passenger.fcmTokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
        }),
    });
};
exports.sendPushNotification = sendPushNotification;
//# sourceMappingURL=notificationService.js.map