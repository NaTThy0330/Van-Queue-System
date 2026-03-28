const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    queue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Queue',
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01,
        validate: {
            validator: function (v) { return v > 0; },
            message: 'Amount must be greater than 0'
        }
    },
    slipUrl: { type: String, default: null },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    verifiedAt: { type: Date }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: 1 });
paymentSchema.index({ queue: 1 });

paymentSchema.virtual('queue_id').get(function () { return this.queue; });
paymentSchema.virtual('payment_slip').get(function () { return this.slipUrl; });
paymentSchema.virtual('verified_by').get(function () { return this.verifiedBy; });
paymentSchema.virtual('created_at').get(function () { return this.createdAt; });

paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
