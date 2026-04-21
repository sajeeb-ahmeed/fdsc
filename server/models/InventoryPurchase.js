const mongoose = require('mongoose');

const inventoryPurchaseSchema = mongoose.Schema({
    supplier: { type: String, required: true },
    supplierPhone: String,
    supplierAddress: String,
    date: { type: Date, required: true, default: Date.now },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentType: { type: String, enum: ['PAID', 'DUE'], required: true },
    items: [{
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
        qty: { type: Number, required: true },
        unitPrice: { type: Number, required: true }
    }],
    status: { type: String, enum: ['PENDING', 'PARTIAL', 'COMPLETED'], default: 'COMPLETED' },
}, {
    timestamps: true,
});

const inventoryPurchasePaymentSchema = mongoose.Schema({
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryPurchase', required: true },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'], required: true },
    ledgerTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'LedgerTransaction' },
}, {
    timestamps: true,
});

const InventoryPurchase = mongoose.model('InventoryPurchase', inventoryPurchaseSchema);
const InventoryPurchasePayment = mongoose.model('InventoryPurchasePayment', inventoryPurchasePaymentSchema);

module.exports = { InventoryPurchase, InventoryPurchasePayment };
