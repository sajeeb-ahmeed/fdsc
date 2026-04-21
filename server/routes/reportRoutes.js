const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const LedgerTransaction = require('../models/LedgerTransaction');
const Expense = require('../models/Expense');
const Member = require('../models/Member');
const Shareholder = require('../models/Shareholder');
const Loan = require('../models/Loan');
const { protect, admin } = require('../middleware/authMiddleware');

const paginate = require('../utils/pagination');

// @desc    Get all ledger transactions
// @route   GET /api/ledger
// @access  Private/Admin
router.get('/', protect, admin, asyncHandler(async (req, res) => {
    const { startDate, endDate, account, type, page, limit } = req.query;
    const query = {};
    if (startDate && endDate) query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    if (account) query.account = account;
    if (type) query.type = type;

    const result = await paginate(LedgerTransaction, query, {
        page,
        limit,
        populate: 'member shareholder loan'
    });
    res.json(result);
}));

// @desc    Get summary statistics for dashboard/reports
// @route   GET /api/ledger/summary
// @access  Private/Admin
router.get('/summary', protect, admin, asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Ledger Aggregations (Cash in Hand & Today's Collection)
    const ledgerStats = await LedgerTransaction.aggregate([
        {
            $facet: {
                cashInHand: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
                todayCollection: [
                    { $match: { date: { $gte: today }, type: 'INSTALLMENT_COLLECTION' } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ],
                netProfit: [{ $group: { _id: null, total: { $sum: "$amount" } } }] // Simple Net for now
            }
        }
    ]);

    // 2. Member Aggregations (Total Savings)
    const memberStats = await Member.aggregate([
        { $group: { _id: null, totalSavings: { $sum: "$savingsBalance" } } }
    ]);

    // 3. Loan Aggregations (Total Credit Due)
    const loanStats = await Loan.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: null, totalDue: { $sum: "$dueAmount" } } }
    ]);

    // 4. Shareholder Aggregations (Total Share Capital)
    const shareholderStats = await Shareholder.aggregate([
        { $group: { _id: null, totalCapital: { $sum: "$totalInvestment" } } }
    ]);

    const stats = {
        cashInHand: ledgerStats[0].cashInHand[0]?.total || 0,
        todayCollection: ledgerStats[0].todayCollection[0]?.total || 0,
        netProfit: ledgerStats[0].netProfit[0]?.total || 0,
        totalSavings: memberStats[0]?.totalSavings || 0,
        totalCreditDue: loanStats[0]?.totalDue || 0,
        totalShareCapital: shareholderStats[0]?.totalCapital || 0,
        totalTransactions: await LedgerTransaction.countDocuments()
    };

    res.json(stats);
}));

// Alias for consistency
router.get('/transactions', protect, admin, asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await paginate(LedgerTransaction, {}, {
        page,
        limit,
        populate: 'member shareholder loan'
    });
    res.json(result);
}));

// @desc    Get balance sheet data
// @route   GET /api/reports/balance-sheet
router.get('/balance-sheet', protect, asyncHandler(async (req, res) => {
    const cashStats = await LedgerTransaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const loanStats = await Loan.aggregate([{ $match: { status: 'ACTIVE' } }, { $group: { _id: null, total: { $sum: "$dueAmount" } } }]);
    const shareStats = await Shareholder.aggregate([{ $group: { _id: null, total: { $sum: "$totalInvestment" } } }]);
    const memberStats = await Member.aggregate([{ $group: { _id: null, totalSavings: { $sum: "$savingsBalance" } } }]);
    const netProfitStats = await LedgerTransaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

    res.json({
        assets: {
            cash: cashStats[0]?.total || 0,
            loans: loanStats[0]?.total || 0,
            total: (cashStats[0]?.total || 0) + (loanStats[0]?.total || 0)
        },
        liabilities: {
            shares: shareStats[0]?.total || 0,
            savings: memberStats[0]?.totalSavings || 0,
            netProfit: netProfitStats[0]?.total || 0,
            total: (shareStats[0]?.total || 0) + (memberStats[0]?.totalSavings || 0) + (netProfitStats[0]?.total || 0)
        }
    });
}));

// @desc    Get profit and loss data
// @route   GET /api/reports/profit-loss
router.get('/profit-loss', protect, asyncHandler(async (req, res) => {
    const incomeStats = await LedgerTransaction.aggregate([
        { $match: { amount: { $gt: 0 }, type: { $in: ['INSTALLMENT_COLLECTION', 'OTHER_INCOME'] } } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);

    // For now, let's treat Positive Ledger as income and Negative as expense
    const totals = await LedgerTransaction.aggregate([
        {
            $group: {
                _id: null,
                income: { $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] } },
                expense: { $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] } }
            }
        }
    ]);

    res.json({
        income: totals[0]?.income || 0,
        expense: totals[0]?.expense || 0,
        netProfit: (totals[0]?.income || 0) - (totals[0]?.expense || 0)
    });
}));

// @desc    Get daily cash sheet
// @route   GET /api/reports/cash-sheet
router.get('/cash-sheet', protect, asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await LedgerTransaction.find({ date: { $gte: today } }).populate('member shareholder');

    const receipts = transactions.filter(t => t.amount > 0);
    const payments = transactions.filter(t => t.amount < 0);

    res.json({
        date: today,
        receipts,
        payments,
        totalReceipts: receipts.reduce((acc, t) => acc + t.amount, 0),
        totalPayments: payments.reduce((acc, t) => acc + Math.abs(t.amount), 0),
        openingBalance: 250000 // Mock for now as per UI
    });
}));

// @desc    Create expense
// @route   POST /api/reports/expenses
// @access  Private/Admin
router.post('/expenses', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT POST /api/reports/expenses`, req.body);
    const { category, amount, paidFromAccount, description, date } = req.body;

    try {
        const ledger = await LedgerTransaction.create([{
            type: 'EXPENSE',
            amount: -amount,
            account: paidFromAccount,
            date: date || Date.now(),
            createdBy: req.user._id,
            note: `Expense: ${category}. ${description || ''}`
        }]);
        console.log(`[DB] Created Ledger Entry for Expense, ID: ${ledger[0]._id}`);

        const expense = await Expense.create([{
            category, amount, paidFromAccount, description,
            date: date || Date.now(),
            ledgerTransaction: ledger[0]._id,
            createdBy: req.user._id
        }]);
        console.log(`[DB] Created Expense ID: ${expense[0]._id}`);

        res.status(201).json(expense[0]);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}));

// @desc    Get all expenses
// @route   GET /api/reports/expenses
// @access  Private/Admin
router.get('/expenses', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT GET /api/reports/expenses`);
    const { page, limit, category, startDate, endDate } = req.query;
    const query = {};
    if (category) query.category = category;
    if (startDate && endDate) query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const result = await paginate(Expense, query, {
        page,
        limit,
        sort: { date: -1 }
    });
    res.json(result);
}));

module.exports = router;
