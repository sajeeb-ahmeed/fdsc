const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_BASE = 'http://localhost:5000/api';
let token = '';

const login = async () => {
    try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        token = res.data.token;
        console.log('Logged in successfully');
    } catch (error) {
        console.error('Login failed. Make sure server is running and admin:password123 exists.');
        process.exit(1);
    }
};

const checkPagination = async (endpoint, name) => {
    try {
        const res = await axios.get(`${API_BASE}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const { data, page, limit, total, totalPages } = res.data;

        const hasAllFields = data !== undefined && page !== undefined && limit !== undefined && total !== undefined && totalPages !== undefined;
        const isDataArray = Array.isArray(data);

        if (hasAllFields && isDataArray) {
            console.log(`[PASS] ${name}: Page ${page}/${totalPages}, Total items: ${total}`);
            return true;
        } else {
            console.error(`[FAIL] ${name}: Missing fields or data is not an array. Keys found: ${Object.keys(res.data).join(', ')}`);
            return false;
        }
    } catch (error) {
        console.error(`[ERROR] ${name}: ${error.message}`);
        return false;
    }
};

const run = async () => {
    await login();

    console.log('\n--- Verifying Pagination Envelopes ---\n');

    const results = [
        await checkPagination('/members', 'Members List'),
        await checkPagination('/shares', 'Shareholders List'),
        await checkPagination('/loans', 'Loans List'),
        await checkPagination('/inventory/items', 'Inventory Items List'),
        await checkPagination('/inventory/purchases', 'Inventory Purchases List'),
        await checkPagination('/ledger', 'Ledger Transactions List'),
        await checkPagination('/ledger/transactions', 'Transactions Alias List'),
    ];

    const allPassed = results.every(r => r === true);
    console.log(`\nFinal Result: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
    process.exit(allPassed ? 0 : 1);
};

run();
