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

async function verifyInventoryPurchase() {
    console.log("Step 1: Creating a new product via purchase...");
    const productName = 'Hero Thriller ' + Date.now();

    const purchasePayload = {
        supplier: 'Hero Bangladesh',
        supplierPhone: '01912345678',
        supplierAddress: 'Dhaka, Bangladesh',
        productName: productName,
        productModel: '160R',
        productBrand: 'Hero',
        quantity: 3,
        price: 185000,
        date: new Date().toISOString()
    };

    const createRes = await request('/api/inventory/purchases', 'POST', purchasePayload);

    if (createRes.status === 201) {
        console.log("SUCCESS: Purchase created!");
        console.log("Purchase Data:", JSON.stringify(createRes.data, null, 2));
    } else {
        console.log("FAILED to create purchase:", createRes.status, createRes.data);
        return;
    }

    console.log("\nStep 2: Verifying Stock Report...");
    const stockRes = await request('/api/inventory/items', 'GET');

    if (stockRes.status === 200) {
        const found = stockRes.data.find(i => i.name === productName);
        if (found) {
            console.log("SUCCESS: Product found in Stock list!");
            console.log("Stock Entry:", JSON.stringify(found, null, 2));
            if (found.stockCount === 3) {
                console.log("SUCCESS: Stock count is correct (3)!");
            } else {
                console.log("FAILED: Stock count mismatch!", found.stockCount);
            }
        } else {
            console.log("FAILED: Product NOT found in stock list!");
        }
    } else {
        console.log("FAILED to fetch stock list:", stockRes.status, stockRes.data);
    }

    console.log("\nStep 3: Purchasing same product again (Stock Increase)...");
    const purchaseAgainPayload = {
        ...purchasePayload,
        quantity: 2,
        price: 180000 // Price changed
    };

    const againRes = await request('/api/inventory/purchases', 'POST', purchaseAgainPayload);
    if (againRes.status === 201) {
        const stockRes2 = await request('/api/inventory/items', 'GET');
        const updatedItem = stockRes2.data.find(i => i.name === productName);
        console.log("SUCCESS: Stock increased! New Count:", updatedItem.stockCount);
        if (updatedItem.stockCount === 5) {
            console.log("PASSED: Initial 3 + New 2 = 5");
        } else {
            console.log("FAILED: Stock increase calculation error!");
        }
    } else {
        console.log("FAILED to purchase again:", againRes.status);
    }
}

verifyInventoryPurchase();
