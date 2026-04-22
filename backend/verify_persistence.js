const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OThjZDhjODE3NGM2OTE1MWU0ZmNhMSIsImlhdCI6MTc3MTYyMTgwNiwiZXhwIjoxNzc0MjEzODA2fQ.Jz0W-S2EsoX1UPhZw2BYT33FJU66xC2JX8XPGxutG4A';
const BASE_URL = 'http://localhost:5000';

const request = (path, method = 'GET', data = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

async function runTests() {
    const results = [];

    // 1. Members
    console.log("Testing Members...");
    const memberRes = await request('/api/members', 'POST', {
        memberId: 'M-FINAL-' + Date.now(),
        name: 'Final Verif Member',
        mobile: '01711111111'
    });
    results.push({ endpoint: 'POST /api/members', ...memberRes });

    // 2. Shareholders
    console.log("Testing Shareholders...");
    const shRes = await request('/api/shares', 'POST', {
        name: 'Final Verif Shareholder',
        phone: '01811111111',
        nid: '333444555',
        numberOfShares: 10
    });
    results.push({ endpoint: 'POST /api/shares', ...shRes });

    // 3. Inventory Item
    console.log("Testing Inventory Items...");
    const itemRes = await request('/api/inventory/items', 'POST', {
        sku: 'SKU-FINAL-' + Date.now(),
        name: 'Final Verif Bike',
        category: 'Vehicle',
        stockCount: 20,
        unitCost: 170000
    });
    results.push({ endpoint: 'POST /api/inventory/items', ...itemRes });

    // 4. Inventory Purchase
    console.log("Testing Inventory Purchases...");
    if (itemRes.data && itemRes.data._id) {
        const purRes = await request('/api/inventory/purchases', 'POST', {
            supplier: 'Final Supplier',
            productName: 'Final Verif Bike', // Matches item name above
            productModel: 'V1',
            productBrand: 'Honda',
            quantity: 5,
            price: 165000,
            paymentMethod: 'CASH'
        });
        results.push({ endpoint: 'POST /api/inventory/purchases', ...purRes });
    }

    // 5. Loans
    console.log("Testing Loans...");
    if (memberRes.data && memberRes.data._id && itemRes.data && itemRes.data._id) {
        const loanRes = await request('/api/loans', 'POST', {
            memberId: memberRes.data._id,
            inventoryItemId: itemRes.data._id,
            qty: 1,
            salePrice: 200000,
            downPayment: 50000,
            profitMode: 'FIXED',
            profitValue: 20000,
            frequency: 'WEEKLY',
            installmentCount: 20,
            startDate: new Date().toISOString()
        });
        results.push({ endpoint: 'POST /api/loans', ...loanRes });

        // 6. Loan Collection
        if (loanRes.data && loanRes.data._id) {
            const collRes = await request(`/api/loans/${loanRes.data._id}/collect`, 'POST', {
                amount: 7500,
                account: 'CASH',
                note: 'Final Verification Collection'
            });
            results.push({ endpoint: 'POST /api/loans/:id/collect', ...collRes });
        }
    }

    // 7. Expenses
    console.log("Testing Expenses...");
    const expRes = await request('/api/ledger/expenses', 'POST', {
        category: 'Rent',
        amount: 25000,
        paidFromAccount: 'BANK',
        description: 'Final Verif Expense'
    });
    results.push({ endpoint: 'POST /api/ledger/expenses', ...expRes });

    // 8. Error Handling Verification (Deliberate failure)
    console.log("Testing Error Handling (Should be 400)...");
    const errorRes = await request('/api/members', 'POST', {
        name: 'No Member ID'
    });
    results.push({ endpoint: 'POST /api/members (FAIL TEST)', ...errorRes });

    console.log("\n--- VERIFICATION LIST ---");
    console.table(results.map(r => ({
        Endpoint: r.endpoint,
        Status: r.status,
        ID: r.data ? (r.data._id || r.data.ledgerEntry?._id || (r.data.message && r.status >= 400 ? 'ERR: ' + r.data.message.substring(0, 15) : 'N/A')) : 'FAILED'
    })));

    // Final checks
    const allPassed = results.every(r => (r.endpoint.includes('FAIL') ? r.status === 400 : r.status === 201 || r.status === 200));
    console.log(`\nOVERALL STATUS: ${allPassed ? 'PASSED' : 'FAILED'}`);
}

runTests();
