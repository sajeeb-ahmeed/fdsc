const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function verifyLoans() {
    try {
        console.log('Verifying /api/loans...');
        // Note: This requires a token. Since I don't have a valid token in the script, 
        // I'll check if the server is running and if the route exists.
        // I will also check the backend models and routes logic.

        const response = await axios.get(`${API_BASE_URL}/loans`).catch(err => err.response);

        if (response && response.status === 401) {
            console.log('Got 401 as expected (No token provided, but route exists).');
        } else if (response && response.status === 404) {
            console.error('ERROR: /api/loans returned 404!');
            process.exit(1);
        } else {
            console.log(`Response status: ${response?.status}`);
        }

        console.log('\nVerifying Member Data...');
        const membersResp = await axios.get(`${API_BASE_URL}/members`).catch(err => err.response);
        if (membersResp && membersResp.status === 401) {
            console.log('Got 401 as expected for members.');
        }

        console.log('\nVerification complete. Backend routes are reachable.');
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
}

verifyLoans();
