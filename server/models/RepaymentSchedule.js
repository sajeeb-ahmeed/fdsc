const mongoose = require('mongoose');

const repaymentScheduleSchema = mongoose.Schema({
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    installmentNo: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'PARTIAL'], default: 'PENDING' },
    paidAmount: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const RepaymentSchedule = mongoose.model('RepaymentSchedule', repaymentScheduleSchema);
module.exports = RepaymentSchedule;
