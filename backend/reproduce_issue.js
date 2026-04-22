
const axios = require('axios');
const mongoose = require('mongoose');

// Helper to highlight logs
const log = (msg, data) => {
    console.log(`\n========================================`);
    console.log(msg);
    if (data) console.log(JSON.stringify(data, null, 2));
    console.log(`========================================\n`);
};

async function reproduction() {
    try {
        log("1. Connecting to DB directly to verify state...");
        const uri = "mongodb+srv://sajeebweb_db_user:ukB9kY6b1CncyclQ@fdsc.w6tx52q.mongodb.net/";
        await mongoose.connect(uri);

        const Member = mongoose.connection.db.collection('members');
        const initialCount = await Member.countDocuments();
        log(`Initial Member Count: ${initialCount}`);

        log("1.5. Authenticating as Admin...");
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginResponse.data.token;
        log("Got Token:", token ? "YES" : "NO");

        log("2. Sending POST request to create member...");
        const payload = {
            memberId: `TEST-${Date.now()}`,
            name: "Test Persistence Member",
            fatherName: "Test Father",
            motherName: "Test Mother",
            mobile: "01700000000",
            profession: "Engineer",
            nid: "1234567890",
            presentAddress: "Test Address",
            permanentAddress: "Test Address",
            photo: "http://example.com/photo.jpg"
        };

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.post('http://localhost:5000/api/members', payload, config);
        log("API Response Status:", response.status);
        log("API Response Data:", response.data);

        log("3. Verifying DB persistence...");
        // Wait a moment for async writes
        await new Promise(resolve => setTimeout(resolve, 1000));

        const finalCount = await Member.countDocuments();
        log(`Final Member Count: ${finalCount}`);

        if (finalCount > initialCount) {
            log("SUCCESS: Document persisted to MongoDB.");
        } else {
            console.error("\nCRITICAL FAILURE: Document NOT persisted to MongoDB despite API success.");

            // Check if it's in the response but not DB (in-memory mock?)
            const created = await Member.findOne({ memberId: payload.memberId });
            if (created) {
                log("Wait... found the document by ID. Count might be cached?");
            } else {
                log("Document definitely not found in DB.");
            }
        }

    } catch (error) {
        console.error("Reproduction Script Error:", error.message);
        if (error.response) {
            console.error("API Error Response:", error.response.data);
        }
    } finally {
        await mongoose.disconnect();
    }
}

reproduction();
