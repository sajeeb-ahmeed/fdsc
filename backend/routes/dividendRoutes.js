const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const BusinessYear = require('../models/BusinessYear');
const Shareholder = require('../models/Shareholder');
const LedgerTransaction = require('../models/LedgerTransaction');
const { computeShareDays, computeProfit } = require('../utils/dividendEngine');
const { protect, admin } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// @desc    Distribute dividends for a year
// @route   POST /api/reports/dividends/compute
// @access  Private/Admin
router.post('/compute', protect, admin, asyncHandler(async (req, res) => {
    const { businessYearId } = req.body;
    const year = await BusinessYear.findById(businessYearId);
    if (!year) {
        res.status(404);
        throw new Error('Business year not found');
    }

    const totalProfit = await computeProfit(year);
    const shareDaysMap = await computeShareDays(year);
    const totalYearShareDays = Object.values(shareDaysMap).reduce((a, b) => a + b, 0);

    if (totalYearShareDays === 0) {
        res.status(400);
        throw new Error('No shares held during this period');
    }

    const directorPool = totalProfit * (year.directorCutPercent / 100);
    const shareholderPool = totalProfit * (year.shareholderPoolPercent / 100);

    const directors = await Shareholder.find({ isDirector: true });
    const directorShareDays = directors.reduce((sum, d) => sum + (shareDaysMap[d._id] || 0), 0);

    const distributions = [];
    const shareholders = await Shareholder.find({});

    for (const sh of shareholders) {
        const shShareDays = shareDaysMap[sh._id] || 0;
        if (shShareDays <= 0) continue;

        let dividend = 0;

        // 1. Shareholder Pool Distribution (All shareholders)
        dividend += (shShareDays / totalYearShareDays) * shareholderPool;

        // 2. Director Pool Distribution (Directors only)
        if (sh.isDirector && directorShareDays > 0) {
            dividend += (shShareDays / directorShareDays) * directorPool;
        }

        distributions.push({
            shareholderId: sh._id,
            name: sh.name,
            dividend: Math.floor(dividend)
        });
    }

    res.json({
        totalProfit,
        directorPool,
        shareholderPool,
        distributions
    });
}));

// @desc    Withdraw dividend
// @route   POST /api/reports/dividends/withdraw
// @access  Private/Admin
router.post('/withdraw', protect, admin, asyncHandler(async (req, res) => {
    const { shareholderId, amount, account, note } = req.body;

    const shareholder = await Shareholder.findById(shareholderId);
    if (!shareholder) {
        res.status(404);
        throw new Error('Shareholder not found');
    }

    // In a real system, we'd check if availableBalance >= amount
    // Here we'll just record it as a ledger entry and update shareholder metadata

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const ledger = await LedgerTransaction.create([{
            type: 'DIVIDEND_PAYOUT',
            amount: -amount,
            account,
            shareholder: shareholderId,
            createdBy: req.user._id,
            note: note || 'Dividend Withdrawal'
        }], { session });

        shareholder.withdrawnDividend += amount;
        await shareholder.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Dividend withdrawn successfully', amount });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}));

module.exports = router;
