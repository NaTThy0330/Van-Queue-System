/**
 * FCM Push Notification Service
 * ส่ง Push Notification ผ่าน Firebase Cloud Messaging
 * 
 * SETUP:
 * 1. สร้าง Firebase project ที่ console.firebase.google.com
 * 2. ไปที่ Project Settings > Service Accounts > Generate new private key
 * 3. บันทึกไฟล์เป็น firebase-adminsdk.json ใน backend folder
 * 4. ตั้งค่า environment variable: GOOGLE_APPLICATION_CREDENTIALS=./firebase-adminsdk.json
 */

let admin;
let messaging;
let initialized = false;

/**
 * Initialize Firebase Admin SDK
 * เรียกใช้ครั้งแรกเมื่อต้องการส่ง notification
 */
const initializeFirebase = () => {
    if (initialized) return true;

    try {
        admin = require('firebase-admin');

        // ลองหา service account file
        const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './firebase-adminsdk.json';

        try {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            messaging = admin.messaging();
            initialized = true;

            return true;
        } catch (fileError) {


            return false;
        }
    } catch (error) {

        return false;
    }
};

/**
 * Send notification to a single device
 * @param {string} fcmToken - Device FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
const sendToDevice = async (fcmToken, title, body, data = {}) => {
    if (!initializeFirebase()) {

        return { success: false, message: 'Firebase not configured' };
    }

    try {
        const message = {
            token: fcmToken,
            notification: {
                title,
                body
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
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

        const response = await messaging.send(message);

        return { success: true, messageId: response };
    } catch (error) {
        console.error('❌ Send notification error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification to multiple devices
 * @param {string[]} fcmTokens - Array of FCM tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
const sendToMultipleDevices = async (fcmTokens, title, body, data = {}) => {
    if (!initializeFirebase()) {

        return { success: false, message: 'Firebase not configured' };
    }

    try {
        const message = {
            tokens: fcmTokens,
            notification: {
                title,
                body
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }
        };

        const response = await messaging.sendEachForMulticast(message);

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        };
    } catch (error) {
        console.error('❌ Send multi-notification error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification to a topic
 * @param {string} topic - Topic name (e.g., 'trip_123')
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
const sendToTopic = async (topic, title, body, data = {}) => {
    if (!initializeFirebase()) {

        return { success: false, message: 'Firebase not configured' };
    }

    try {
        const message = {
            topic,
            notification: {
                title,
                body
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }
        };

        const response = await messaging.send(message);

        return { success: true, messageId: response };
    } catch (error) {
        console.error('❌ Send topic notification error:', error.message);
        return { success: false, error: error.message };
    }
};

// ==================== NOTIFICATION TEMPLATES ====================

/**
 * Notify passenger: Booking confirmed
 */
const notifyBookingConfirmed = async (fcmToken, bookingDetails) => {
    return sendToDevice(
        fcmToken,
        '🎫 จองสำเร็จ!',
        `คุณจองรถตู้ ${bookingDetails.route} เวลา ${bookingDetails.time} เรียบร้อยแล้ว`,
        { type: 'booking_confirmed', bookingId: bookingDetails.bookingId }
    );
};

/**
 * Notify passenger: Payment verified
 */
const notifyPaymentVerified = async (fcmToken, bookingDetails) => {
    return sendToDevice(
        fcmToken,
        '✅ ชำระเงินสำเร็จ!',
        `การชำระเงินของคุณได้รับการยืนยันแล้ว`,
        { type: 'payment_verified', bookingId: bookingDetails.bookingId }
    );
};

/**
 * Notify passenger: Near departure (15 min before)
 */
const notifyNearDeparture = async (fcmToken, tripDetails) => {
    return sendToDevice(
        fcmToken,
        '⏰ รถใกล้ออกแล้ว!',
        `รถตู้ ${tripDetails.route} จะออกในอีก 15 นาที กรุณามาถึงท่ารถ`,
        { type: 'near_departure', tripId: tripDetails.tripId }
    );
};

/**
 * Notify passenger: Van departed
 */
const notifyVanDeparted = async (fcmToken, tripDetails) => {
    return sendToDevice(
        fcmToken,
        '🚐 รถออกแล้ว!',
        `รถตู้ ${tripDetails.route} ออกเดินทางแล้ว`,
        { type: 'departed', tripId: tripDetails.tripId }
    );
};

/**
 * Notify passenger: Cutoff warning (unpaid)
 */
const notifyCutoffWarning = async (fcmToken, bookingDetails) => {
    return sendToDevice(
        fcmToken,
        '⚠️ เตือน: ใกล้ถึงเวลา Cutoff!',
        `กรุณาชำระเงินก่อน ${bookingDetails.cutoffTime} นาที มิฉะนั้นการจองจะถูกยกเลิก`,
        { type: 'cutoff_warning', bookingId: bookingDetails.bookingId }
    );
};

module.exports = {
    initializeFirebase,
    sendToDevice,
    sendToMultipleDevices,
    sendToTopic,
    // Templates
    notifyBookingConfirmed,
    notifyPaymentVerified,
    notifyNearDeparture,
    notifyVanDeparted,
    notifyCutoffWarning
};
