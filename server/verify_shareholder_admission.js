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

async function verifyShareholderAdmission() {
    console.log("Step 1: Creating a shareholder...");
    const nid = 'SH-NID-' + Date.now();
    const phone = '018' + Math.floor(Math.random() * 10000000);

    const createRes = await request('/api/shares', 'POST', {
        name: 'Shareholder Workflow Proof',
        fatherName: 'Proof Father',
        motherName: 'Proof Mother',
        nid: nid,
        phone: phone,
        address: {
            village: 'Proof Village',
            post: 'Proof Post',
            upazila: 'Proof Upazila',
            district: 'Proof District'
        },
        numberOfShares: 5
    });

    if (createRes.status === 201) {
        console.log("SUCCESS: Shareholder created with ID:", createRes.data._id);
        console.log("Assigned ShareholderID:", createRes.data.shareholderId);
    } else {
        console.log("FAILED to create shareholder:", createRes.status, createRes.data);
        return;
    }

    console.log("\nStep 2: Fetching shareholder list for proof...");
    const listRes = await request('/api/shares', 'GET');

    if (listRes.status === 200) {
        const found = listRes.data.find(s => s.nid === nid);
        if (found) {
            console.log("SUCCESS: Shareholder found in GET /api/shares!");
            console.log("Shareholder Data in DB:", JSON.stringify(found, null, 2));
        } else {
            console.log("FAILED: Shareholder NOT found in GET /api/shares!");
        }
    } else {
        console.log("FAILED to fetch list:", listRes.status, listRes.data);
    }
}

verifyShareholderAdmission();
