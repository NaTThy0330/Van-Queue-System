"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;

let admin;
let messaging;
let initialized = false;

/**
 * Initialize Firebase Admin SDK
 * Supports: ENV variable (Azure) or file (Local/Docker)
 */
const initializeFirebase = () => {
    if (initialized) return true;
    try {
        admin = require('firebase-admin');
        let serviceAccount = null;

        // Method 1: ENV variable with JSON string (Azure / Cloud)
        if (process.env.FIREBASE_CREDENTIALS_JSON) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
            } catch (parseErr) {
                // Invalid JSON in env
            }
        }

        // Method 2: File path (Local / Docker)
        if (!serviceAccount) {
            const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './firebase-adminsdk.json';
            try {
                serviceAccount = require(credPath);
            } catch (fileErr) {
                // File not found
            }
        }

        if (!serviceAccount) {
            return false;
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        messaging = admin.messaging();
        initialized = true;
        return true;
    } catch (error) {
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
    for (const token of passenger.fcmTokens) {
        try {
            await messaging.send({
                token: token,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data || {},
                android: {
                    priority: 'high',
                    notification: { sound: 'default', channelId: 'van_queue_channel' }
                },
                apns: {
                    payload: { aps: { sound: 'default', badge: 1 } }
                }
            });
        } catch (err) {
            console.error('FCM send error:', err.message);
        }
    }
};
exports.sendPushNotification = sendPushNotification;