const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const endpoints = [
    { name: 'Auth (Public)', path: '/auth/login', method: 'post' },
    { name: 'Members', path: '/members' },
    { name: 'Shares', path: '/shares' },
    { name: 'Loans', path: '/loans' },
    { name: 'Ledger', path: '/ledger/transactions' },
    { name: 'Inventory', path: '/inventory/items' }
];

async function runSmokeTest() {
    console.log('🚀 Starting Backend Route Smoke Test...\n');
    let passCount = 0;

    // Note: This requires a valid admin token. For smoke test, we'll try without just to see status codes.
    // Real test should login first.

    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        for (const ep of endpoints) {
            try {
                let res;
                if (ep.method === 'post') {
                    // Skip post for now or send empty
                    console.log(`[SKIP] ${ep.name} (${ep.path}) - POST requires payload`);
                    continue;
                } else {
                    res = await axios.get(`${BASE_URL}${ep.path}`, config);
                }

                const dataCount = Array.isArray(res.data) ? res.data.length : (res.data.data ? res.data.data.length : 'N/A');
                console.log(`✅ ${ep.name}: Status ${res.status} | Items: ${dataCount}`);
                passCount++;
            } catch (err) {
                console.log(`❌ ${ep.name}: Status ${err.response?.status || 'ERROR'} | ${err.message}`);
            }
        }
    } catch (err) {
        console.error('CRITICAL: Login failed, cannot proceed with authorized tests.');
    }

    console.log(`\nTests finished: ${passCount}/${endpoints.length - 1} passed (excluding login).`);
}

runSmokeTest();
