const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    paidFromAccount: { type: String, enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'OTHER'], required: true },
    description: String,
    ledgerTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'LedgerTransaction' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
