const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shareholder = require('./models/Shareholder');
const ShareHoldingEvent = require('./models/ShareHoldingEvent');

dotenv.config();

async function provePersistence() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create a new shareholder (Simulating what the route does)
        const name = "Proof Shareholder " + Date.now();
        const nid = "123456789";
        const phone = "01700000000";
        const numberOfShares = 15;
        const shareValue = 50000;
        const amount = numberOfShares * shareValue;

        // Simplified logic from route
        const count = await Shareholder.countDocuments();
        const shareholderId = `S-${1000 + count + 1}`;

        const shareholder = await Shareholder.create({
            shareholderId,
            name,
            nid,
            phone,
            numberOfShares,
            totalInvestment: amount
        });

        console.log('\n[Persistence Proof]');
        console.log('Created Shareholder:', shareholder.name);
        console.log('Stored numberOfShares:', shareholder.numberOfShares);
        console.log('Stored totalInvestment: ৳', shareholder.totalInvestment.toLocaleString());

        // Cleanup
        await Shareholder.findByIdAndDelete(shareholder._id);
        console.log('\nTest cleanup successful.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

provePersistence();
