const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Settings = require('../models/Settings');
const BusinessYear = require('../models/BusinessYear');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        // 1. Clear existing
        await User.deleteMany({});
        await Settings.deleteMany({});
        await BusinessYear.deleteMany({});

        // 2. Initial Settings
        await Settings.insertMany([
            { key: 'SHARE_VALUE', value: 50000, description: 'Default face value of one share' },
            { key: 'MIN_DIRECTOR_SHARES', value: 5, description: 'Minimum shares required to be a director' }
        ]);
        console.log('Settings seeded.');

        // 3. Admin Users
        await User.create([
            { username: 'admin', password: 'admin123', name: 'System Admin', role: 'admin' },
            { username: 'superadmin', password: 'superadmin123', name: 'Super Admin', role: 'superadmin' }
        ]);
        console.log('Admins seeded. (admin/admin123)');

        // 4. Sample Business Year
        await BusinessYear.create({
            name: 'Business Year 2024',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            directorCutPercent: 25,
            shareholderPoolPercent: 75,
            status: 'OPEN'
        });
        console.log('Sample Business Year 2024 seeded.');

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();
