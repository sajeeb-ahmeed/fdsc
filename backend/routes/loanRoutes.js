const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Loan = require('../models/Loan');
const RepaymentSchedule = require('../models/RepaymentSchedule');
const InventoryItem = require('../models/InventoryItem');
const LedgerTransaction = require('../models/LedgerTransaction');
const { protect, admin } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const paginate = require('../utils/pagination');

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await paginate(Loan, {}, {
        page,
        limit,
        populate: 'member inventoryItem'
    });
    res.json(result);
}));

// @desc    Create a product credit loan
// @route   POST /api/loans
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT POST /api/loans`, req.body);
    const {
        memberId, inventoryItemId, qty, salePrice,
        downPayment, profitMode, profitValue,
        frequency, installmentCount, startDate
    } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const item = await InventoryItem.findById(inventoryItemId).session(session);
        if (!item || item.stockCount < qty) {
            res.status(400);
            throw new Error('Not enough stock available');
        }

        const principal = (salePrice * qty) - downPayment;
        let totalProfit = 0;
        if (profitMode === 'PERCENT') {
            totalProfit = principal * (profitValue / 100);
        } else {
            totalProfit = profitValue;
        }

        const totalPayable = principal + totalProfit;
        const installmentAmount = Math.ceil(totalPayable / installmentCount);

        // 1. Create Loan
        const loan = await Loan.create([{
            member: memberId,
            inventoryItem: inventoryItemId,
            qty, salePrice, downPayment, principal,
            profitMode, profitValue, totalPayable,
            frequency, installmentCount, installmentAmount,
            startDate, dueAmount: totalPayable
        }], { session });
        console.log(`[DB] Created Loan ID: ${loan[0]._id}`);

        // 2. Decrement Stock
        item.stockCount -= qty;
        await item.save({ session });
        console.log(`[DB] Stock Updated for Item ID: ${inventoryItemId}`);

        // 3. Create Schedule
        const schedule = [];
        let currentDate = new Date(startDate);
        for (let i = 1; i <= installmentCount; i++) {
            schedule.push({
                loan: loan[0]._id,
                installmentNo: i,
                dueDate: new Date(currentDate),
                amountDue: i === installmentCount ? (totalPayable - (installmentAmount * (installmentCount - 1))) : installmentAmount
            });

            if (frequency === 'DAILY') currentDate.setDate(currentDate.getDate() + 1);
            else if (frequency === 'WEEKLY') currentDate.setDate(currentDate.getDate() + 7);
            else if (frequency === 'MONTHLY') currentDate.setMonth(currentDate.getMonth() + 1);
        }
        await RepaymentSchedule.create(schedule, { session, ordered: true });
        console.log(`[DB] Created Repayment Schedule for Loan ID: ${loan[0]._id}`);

        // 4. Ledger Entry (Product Disbursed - Metadata)
        await LedgerTransaction.create([{
            type: 'LOAN_DISBURSE_PRODUCT',
            amount: 0,
            account: 'OTHER',
            member: memberId,
            loan: loan[0]._id,
            createdBy: req.user._id,
            note: `Disbursed ${qty} units of ${item.name}`
        }], { session });

        await session.commitTransaction();
        res.status(201).json(loan[0]);
    } catch (error) {
        await session.abortTransaction();
        console.error(`[DB] Error creating loan:`, error);
        res.status(400);
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
}));

// @desc    Collect installment
// @route   POST /api/loans/:id/collect
// @access  Private/Admin
router.post('/:id/collect', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT POST /api/loans/${req.params.id}/collect`, req.body);
    const { amount, account, date, note } = req.body;
    const loanId = req.params.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const loan = await Loan.findById(loanId).session(session);
        if (!loan) {
            res.status(404);
            throw new Error('Loan not found');
        }

        // 1. Ledger Entry
        const ledger = await LedgerTransaction.create([{
            type: 'INSTALLMENT_COLLECTION',
            amount: amount,
            account: (account || 'CASH').toUpperCase(),
            member: loan.member,
            loan: loanId,
            date: date || Date.now(),
            createdBy: req.user._id,
            note
        }], { session });
        console.log(`[DB] Created Ledger Entry for Collection, ID: ${ledger[0]._id}`);

        // 2. Update Loan
        loan.paidAmount += amount;
        loan.dueAmount -= amount;
        if (loan.dueAmount <= 0) {
            loan.status = 'PAID';
        }
        await loan.save({ session });
        console.log(`[DB] Updated Loan ID: ${loanId}, New Due Amount: ${loan.dueAmount}`);

        // 3. Update Schedule (apply to oldest pending)
        let remainingToApply = amount;
        const schedules = await RepaymentSchedule.find({ loan: loanId, status: { $ne: 'PAID' } })
            .sort({ installmentNo: 1 })
            .session(session);

        for (const s of schedules) {
            if (remainingToApply <= 0) break;
            const dueForThis = s.amountDue - s.paidAmount;
            if (remainingToApply >= dueForThis) {
                remainingToApply -= dueForThis;
                s.paidAmount = s.amountDue;
                s.status = 'PAID';
            } else {
                s.paidAmount += remainingToApply;
                s.status = 'PARTIAL';
                remainingToApply = 0;
            }
            await s.save({ session });
        }
        console.log(`[DB] Updated Repayment Schedules for Loan ID: ${loanId}`);

        await session.commitTransaction();
        res.json({ message: 'Collection recorded', loan, ledgerEntry: ledger[0] });
    } catch (error) {
        await session.abortTransaction();
        console.error(`[DB] Error in loan collection:`, error);
        res.status(400);
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
}));

// @desc    Get loan details
// @route   GET /api/loans/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const loan = await Loan.findById(req.params.id).populate('member').populate('inventoryItem');
    const schedule = await RepaymentSchedule.find({ loan: req.params.id }).sort({ installmentNo: 1 });
    res.json({ loan, schedule });
}));

module.exports = router;
