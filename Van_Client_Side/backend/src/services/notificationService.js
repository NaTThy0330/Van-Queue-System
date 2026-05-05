"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const env_1 = require("../config/env");

let admin;
let messaging;
let initialized = false;

/**
 * Initialize Firebase Admin SDK (same pattern as Driver Side)
 */
const initializeFirebase = () => {
    if (initialized) return true;
    try {
        admin = require('firebase-admin');
        const credPath = env_1.config.firebaseCredentialPath;
        try {
            const serviceAccount = require(credPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            messaging = admin.messaging();
            initialized = true;
            console.log('Firebase Admin initialized successfully');
            return true;
        } catch (fileError) {
            console.info('Firebase credential file not found, FCM disabled');
            return false;
        }
    } catch (error) {
        console.info('firebase-admin not installed, FCM disabled');
        return false;
    }
};

const sendPushNotification = async (passenger, payload) => {
    if (!passenger.fcmTokens || !passenger.fcmTokens.length)
        return;
    if (!initializeFirebase()) {
        console.info("FCM disabled; skipping push", { payload });
        return;
    }
    // Send to each device token
    for (const token of passenger.fcmTokens) {
        try {
            const message = {
                token: token,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data || {},
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'van_queue_channel'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1
                        }
                    }
                }
            };
            await messaging.send(message);
        } catch (err) {
            console.error('FCM send error:', err.message);
        }
    }
};
exports.sendPushNotification = sendPushNotification;