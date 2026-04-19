const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, required: false, unique: true, lowercase: true, trim: true, sparse: true },
    passwordHash: { type: String, required: false, default: null },
    fcmTokens: { type: [String], default: [] },
    isAnonymous: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

passengerSchema.index({ phone: 1 });

passengerSchema.virtual('password_hash').get(function () { return this.passwordHash; });
passengerSchema.virtual('is_anonymous').get(function () { return this.isAnonymous; });
passengerSchema.virtual('created_at').get(function () { return this.createdAt; });

passengerSchema.set('toJSON', { virtuals: true });
passengerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Passenger', passengerSchema);
