const mongoose = require('mongoose');

const ledgerTransactionSchema = mongoose.Schema({
    date: { type: Date, required: true, default: Date.now },
    type: {
        type: String,
        enum: [
            'SHARE_PURCHASE', 'SHARE_TRANSFER', 'SHARE_REDEEM',
            'INVENTORY_PURCHASE', 'INVENTORY_PURCHASE_PAYMENT',
            'LOAN_DISBURSE_PRODUCT', 'INSTALLMENT_COLLECTION',
            'EXPENSE', 'DIVIDEND_PAYOUT', 'OTHER_INCOME', 'ADJUSTMENT'
        ],
        required: true
    },
    amount: { type: Number, required: true }, // Positive for IN, Negative for OUT
    account: { type: String, enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'], required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    shareholder: { type: mongoose.Schema.Types.ObjectId, ref: 'Shareholder' },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
    inventoryPurchase: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryPurchase' },
    note: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});

const LedgerTransaction = mongoose.model('LedgerTransaction', ledgerTransactionSchema);
module.exports = LedgerTransaction;
