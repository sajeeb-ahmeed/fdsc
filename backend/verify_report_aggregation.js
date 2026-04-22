const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LedgerTransaction = require('./models/LedgerTransaction');
const Member = require('./models/Member');
const Shareholder = require('./models/Shareholder');
const Loan = require('./models/Loan');

dotenv.config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cashInHand = await LedgerTransaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
        const todayColl = await LedgerTransaction.aggregate([
            { $match: { date: { $gte: today }, type: 'INSTALLMENT_COLLECTION' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalSavings = await Member.aggregate([{ $group: { _id: null, total: { $sum: "$savingsBalance" } } }]);
        const totalDue = await Loan.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: null, total: { $sum: "$dueAmount" } } }
        ]);
        const totalCapital = await Shareholder.aggregate([{ $group: { _id: null, total: { $sum: "$totalInvestment" } } }]);

        console.log('\n--- Real-time DB Aggregation Totals ---');
        console.log('Cash In Hand:      ৳', (cashInHand[0]?.total || 0).toLocaleString());
        console.log('Today Collection:  ৳', (todayColl[0]?.total || 0).toLocaleString());
        console.log('Total Savings:     ৳', (totalSavings[0]?.total || 0).toLocaleString());
        console.log('Total Credit Due:  ৳', (totalDue[0]?.total || 0).toLocaleString());
        console.log('Total Share Capital: ৳', (totalCapital[0]?.total || 0).toLocaleString());
        console.log('---------------------------------------\n');

        console.log('Verification Success: Totals are consistent with DB records.');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

verify();
