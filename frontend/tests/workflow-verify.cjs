
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';
let token = '';
let testMemberId = '';
let testShareholderId = '';
let testItemId = '';
let testLoanId = '';

async function runTests() {
    console.log('🧪 Starting Core Workflow Verification...');

    try {
        // 0. Login
        console.log('\n--- 0. Login ---');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        token = loginRes.data.token;
        console.log('✅ Login Successful');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Member Create (Admission)
        console.log('\n--- 1. Member Create ---');
        const memberData = {
            name: 'Test Member',
            memberId: 'TM-' + Date.now(),
            mobile: '01711223344',
            presentAddress: 'Test Address',
            joiningDate: new Date(),
            admissionFee: 100,
            initialSavings: 500
        };
        const memberRes = await axios.post(`${BASE_URL}/members`, memberData, config);
        testMemberId = memberRes.data._id;
        console.log(`✅ Member Created: ${memberRes.data.name} (${testMemberId})`);

        // 2. Shareholder Member Create (Admission)
        console.log('\n--- 2. Shareholder Admission ---');
        const shareData = {
            name: 'Test Shareholder',
            fatherName: 'Father',
            motherName: 'Mother',
            nid: '123456789',
            phone: '01700000000',
            address: {
                village: 'Test',
                post: 'Test',
                upazila: 'Test',
                district: 'Test'
            },
            numberOfShares: 5
        };
        const shareRes = await axios.post(`${BASE_URL}/shares`, shareData, config);
        testShareholderId = shareRes.data._id;
        console.log(`✅ Shareholder Admission Successful: ${testShareholderId}`);

        // 3. Product Create & Purchase (Stock In)
        console.log('\n--- 3. Product Purchase (Stock In) ---');
        // Create Item first
        const itemRes = await axios.post(`${BASE_URL}/inventory/items`, {
            sku: 'SKU-' + Date.now(),
            name: 'Test Product',
            model: '2024',
            category: 'Vehicle',
            sellBasePrice: 150000
        }, config);
        testItemId = itemRes.data._id;
        console.log(`✅ Inventory Item Created: ${testItemId}`);

        // Purchase Stock
        const purchaseData = {
            supplier: 'Test Supplier',
            paymentType: 'PAID',
            paidAmount: 100000,
            account: 'CASH',
            items: [{
                inventoryItem: testItemId,
                qty: 2,
                unitPrice: 120000
            }]
        };
        const purchaseRes = await axios.post(`${BASE_URL}/inventory/purchases`, purchaseData, config);
        console.log(`✅ Stock In Successful: Purchase ID ${purchaseRes.data._id}`);

        // 4. Take Loan (Credit Purchase)
        console.log('\n--- 4. Take Loan (Product Financing) ---');
        const loanData = {
            memberId: testMemberId,
            inventoryItemId: testItemId,
            qty: 1,
            salePrice: 150000,
            downPayment: 50000,
            profitMode: 'PERCENT',
            profitValue: 10,
            frequency: 'MONTHLY',
            installmentCount: 12,
            startDate: new Date()
        };
        const loanRes = await axios.post(`${BASE_URL}/loans`, loanData, config);
        testLoanId = loanRes.data._id;
        console.log(`✅ Loan Created: ${testLoanId}`);

        // 5. Daily Collection (Installment)
        console.log('\n--- 5. Daily Collection (Installment) ---');
        const collectRes = await axios.post(`${BASE_URL}/loans/${testLoanId}/collect`, {
            amount: 5000,
            account: 'CASH',
            note: 'Verification collection'
        }, config);
        console.log(`✅ Collection Successful: ${collectRes.data.message}`);

        // 6. Total Report (Audit & Stats)
        console.log('\n--- 6. Total Report (Audit & Stats) ---');
        const summaryRes = await axios.get(`${BASE_URL}/reports/summary`, config);
        console.log('✅ Summary Stats Fetched:', summaryRes.data);

        if (summaryRes.data.todayCollection > 0) {
            console.log(`📊 Today's Collection: ${summaryRes.data.todayCollection} ৳`);
        } else {
            console.error('❌ Error: todayCollection should be > 0');
            process.exit(1);
        }

        console.log('\n🎉 ALL 6 CORE WORKFLOWS VERIFIED SUCCESSFULLY!');
    } catch (error) {
        console.error('\n❌ Verification Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTests();
