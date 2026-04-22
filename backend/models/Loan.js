const mongoose = require('mongoose');

const loanSchema = mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    qty: { type: Number, default: 1 },
    salePrice: { type: Number, required: true },
    downPayment: { type: Number, default: 0 },
    principal: { type: Number, required: true },
    profitMode: { type: String, enum: ['PERCENT', 'FIXED'], required: true },
    profitValue: { type: Number, required: true },
    totalPayable: { type: Number, required: true },
    frequency: { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], required: true },
    installmentCount: { type: Number, required: true },
    installmentAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'PAID', 'DEFAULTED'], default: 'ACTIVE' },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },
}, {
    timestamps: true,
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
