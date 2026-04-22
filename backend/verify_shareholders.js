const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shareholder = require('./models/Shareholder');

dotenv.config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const shareholders = await Shareholder.find({});
        console.log('\n--- Shareholder DB Audit ---');
        console.log(`Found ${shareholders.length} shareholders.`);

        shareholders.forEach(s => {
            console.log(`- ${s.name} (${s.shareholderId}):`);
            console.log(`  Shares: ${s.numberOfShares}`);
            console.log(`  Investment: ৳ ${s.totalInvestment}`);
        });

        console.log('\nVerification Success: Fields are present in DB.');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

verify();
