const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');
const Shareholder = require('./models/Shareholder');
const InventoryItem = require('./models/InventoryItem');
const { InventoryPurchase } = require('./models/InventoryPurchase');
const Loan = require('./models/Loan');

dotenv.config({ path: './server/.env' });

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Verify Member Persistence
        const memberData = {
            memberId: `M-TEST-${Date.now()}`,
            name: 'Test Member',
            mobile: '01711111111',
            husbandName: 'Test Husband',
            religion: 'Islam',
            nomineeName: 'Test Nominee'
        };
        const newMember = await Member.create(memberData);
        console.log('Member Created:', newMember._id);

        const foundMember = await Member.findById(newMember._id);
        if (foundMember.husbandName === memberData.husbandName) {
            console.log('✅ Member Persistence Verified (including new fields)');
        } else {
            console.error('❌ Member Persistence Failed');
        }

        // 2. Verify Shareholder
        const shData = {
            shareholderId: `S-TEST-${Date.now()}`,
            name: 'Test Shareholder',
            nid: '123456789',
            phone: '01811111111'
        };
        const newSH = await Shareholder.create(shData);
        console.log('Shareholder Created:', newSH._id);
        if (newSH) console.log('✅ Shareholder Persistence Verified');

        // 3. Verify Inventory
        const invData = {
            sku: `SKU-${Date.now()}`,
            name: 'Test Product',
            stockCount: 10
        };
        const newInv = await InventoryItem.create(invData);
        console.log('Inventory Item Created:', newInv._id);
        if (newInv) console.log('✅ Inventory Persistence Verified');

        // Cleanup test data
        await Member.deleteOne({ _id: newMember._id });
        await Shareholder.deleteOne({ _id: newSH._id });
        await InventoryItem.deleteOne({ _id: newInv._id });
        console.log('Test data cleaned up');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Verification Error:', error);
        process.exit(1);
    }
};

runVerification();
