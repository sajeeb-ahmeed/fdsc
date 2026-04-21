const ShareHoldingEvent = require('../models/ShareHoldingEvent');
const Shareholder = require('../models/Shareholder');
const LedgerTransaction = require('../models/LedgerTransaction');
const BusinessYear = require('../models/BusinessYear');

/**
 * Computes share-days for each shareholder within a business year.
 * Share-days = Number of shares * Number of days held
 */
const computeShareDays = async (businessYear) => {
    const { startDate, endDate } = businessYear;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDaysInYear = (end - start) / (1000 * 60 * 60 * 24) + 1;

    // Get all events that might affect the year (including those before the year for opening balances)
    const events = await ShareHoldingEvent.find({
        date: { $lte: end }
    }).sort({ date: 1 });

    const shareholders = await Shareholder.find({});
    const shareDaysMap = {}; // { shareholderId: totalShareDays }

    shareholders.forEach(s => { shareDaysMap[s._id] = 0; });

    shareholders.forEach(sh => {
        let currentShares = 0;
        let lastDate = start;

        // 1. Process events to find state at start of year
        const preYearEvents = events.filter(e => e.date < start);
        preYearEvents.forEach(e => {
            if (e.toShareholder?.toString() === sh._id.toString()) currentShares += e.sharesCount;
            if (e.fromShareholder?.toString() === sh._id.toString()) currentShares -= e.sharesCount;
        });

        // 2. Process events within the year
        const yearEvents = events.filter(e => e.date >= start && e.date <= end);
        yearEvents.forEach(e => {
            // Calculate days for the previous share count
            const daysHeld = (new Date(e.date) - lastDate) / (1000 * 60 * 60 * 24);
            shareDaysMap[sh._id] += currentShares * daysHeld;

            // Update shares for next period
            if (e.toShareholder?.toString() === sh._id.toString()) currentShares += e.sharesCount;
            if (e.fromShareholder?.toString() === sh._id.toString()) currentShares -= e.sharesCount;
            lastDate = new Date(e.date);
        });

        // 3. Final period from last event to end of year
        const finalDays = (end - lastDate) / (1000 * 60 * 60 * 24);
        shareDaysMap[sh._id] += currentShares * finalDays;
    });

    return shareDaysMap;
};

/**
 * Computes total profit for a business year from ledger.
 * Profit = (INSTALLMENT_COLLECTION + OTHER_INCOME) - Expenses
 */
const computeProfit = async (businessYear) => {
    const { startDate, endDate } = businessYear;
    const transactions = await LedgerTransaction.find({
        date: { $gte: startDate, $lte: endDate }
    });

    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
        if (['INSTALLMENT_COLLECTION', 'OTHER_INCOME'].includes(t.type)) {
            income += t.amount;
        } else if (t.type === 'EXPENSE') {
            expenses += Math.abs(t.amount);
        }
    });

    return income - expenses;
};

module.exports = { computeShareDays, computeProfit };
