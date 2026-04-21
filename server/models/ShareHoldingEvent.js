const mongoose = require('mongoose');

const shareHoldingEventSchema = mongoose.Schema({
    eventType: { type: String, enum: ['ISSUE', 'TRANSFER', 'REDEEM'], required: true },
    fromShareholder: { type: mongoose.Schema.Types.ObjectId, ref: 'Shareholder' },
    toShareholder: { type: mongoose.Schema.Types.ObjectId, ref: 'Shareholder' },
    sharesCount: { type: Number, required: true },
    shareValueAtTime: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    note: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});

const ShareHoldingEvent = mongoose.model('ShareHoldingEvent', shareHoldingEventSchema);
module.exports = ShareHoldingEvent;
