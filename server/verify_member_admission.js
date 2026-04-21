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

async function verifyMemberAdmission() {
    console.log("Step 1: Creating a member...");
    const memberId = 'M-FIX-' + Date.now();
    const createRes = await request('/api/members', 'POST', {
        memberId: memberId,
        name: 'Workflow Proof User',
        mobile: '01755555555',
        fatherName: 'Proof Father',
        motherName: 'Proof Mother',
        profession: 'Verificator',
        nid: 'PROOF-123',
        presentAddress: 'Present proof addr',
        permanentAddress: 'Permanent proof addr'
    });

    if (createRes.status === 201) {
        console.log("SUCCESS: Member created with ID:", createRes.data._id);
    } else {
        console.log("FAILED to create member:", createRes.status, createRes.data);
        return;
    }

    console.log("\nStep 2: Fetching member list for proof...");
    const listRes = await request('/api/members', 'GET');

    if (listRes.status === 200) {
        const found = listRes.data.find(m => m.memberId === memberId);
        if (found) {
            console.log("SUCCESS: Member found in GET list!");
            console.log("Member Data in DB:", JSON.stringify(found, null, 2));
        } else {
            console.log("FAILED: Member NOT found in GET list!");
        }
    } else {
        console.log("FAILED to fetch list:", listRes.status, listRes.data);
    }
}

verifyMemberAdmission();
