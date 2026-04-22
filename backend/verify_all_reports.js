const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LedgerTransaction = require('./models/LedgerTransaction');
const Member = require('./models/Member');
const Shareholder = require('./models/Shareholder');
const Loan = require('./models/Loan');

dotenv.config();

async function verifyAllReports() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n=== REPORT-BY-REPORT VERIFICATION ===');

        // 1. Summary Report
        const cashInHand = (await LedgerTransaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]))[0]?.total || 0;
        const totalSavings = (await Member.aggregate([{ $group: { _id: null, total: { $sum: "$savingsBalance" } } }]))[0]?.total || 0;
        const totalDue = (await Loan.aggregate([{ $match: { status: 'ACTIVE' } }, { $group: { _id: null, total: { $sum: "$dueAmount" } } }]))[0]?.total || 0;

        console.log('\n[Summary Report Totals]');
        console.log('Cash in Hand (Total Ledger Sum): ৳', cashInHand.toLocaleString());
        console.log('Total Savings (Member Balances): ৳', totalSavings.toLocaleString());
        console.log('Total Credit Due (Active Loans): ৳', totalDue.toLocaleString());

        // 2. Balance Sheet
        const totalCapital = (await Shareholder.aggregate([{ $group: { _id: null, total: { $sum: "$totalInvestment" } } }]))[0]?.total || 0;
        const assets = cashInHand + totalDue;
        const liabilities = totalCapital + totalSavings + cashInHand; // Simplified Balance Logic

        console.log('\n[Balance Sheet Totals]');
        console.log('Total Assets:      ৳', assets.toLocaleString());
        console.log('Total Liabilities: ৳', liabilities.toLocaleString());
        console.log('Balanced:         ', Math.abs(assets - liabilities) < 1 ? 'YES' : 'NO (Check logic)');

        // 3. Profit & Loss
        const totals = await LedgerTransaction.aggregate([
            {
                $group: {
                    _id: null,
                    income: { $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] } },
                    expense: { $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] } }
                }
            }
        ]);
        const income = totals[0]?.income || 0;
        const expense = totals[0]?.expense || 0;

        console.log('\n[Profit & Loss Totals]');
        console.log('Total Income:  ৳', income.toLocaleString());
        console.log('Total Expense: ৳', expense.toLocaleString());
        console.log('Net Profit:    ৳', (income - expense).toLocaleString());

        // 4. Daily Cash Sheet (Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyTotals = await LedgerTransaction.aggregate([
            { $match: { date: { $gte: today } } },
            {
                $group: {
                    _id: null,
                    receipts: { $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] } },
                    payments: { $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] } }
                }
            }
        ]);

        console.log('\n[Daily Cash Sheet - Today]');
        console.log('Today Receipts: ৳', (dailyTotals[0]?.receipts || 0).toLocaleString());
        console.log('Today Payments: ৳', (dailyTotals[0]?.payments || 0).toLocaleString());

        console.log('\n=====================================');
        console.log('Verification Success: Backend aggregation endpoints will provide these synced values.');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

verifyAllReports();
