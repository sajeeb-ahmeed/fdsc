const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Shareholder = require('../models/Shareholder');
const ShareHoldingEvent = require('../models/ShareHoldingEvent');
const LedgerTransaction = require('../models/LedgerTransaction');
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const paginate = require('../utils/pagination');

// @desc    Get all shareholders
// @route   GET /api/shares
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await paginate(Shareholder, {}, { page, limit });
    res.json(result);
}));

// @desc    Create new shareholder
// @route   POST /api/shares
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT POST /api/shares`, req.body);
    const { name, fatherName, motherName, nid, phone, address, numberOfShares, account } = req.body;

    // Generate Shareholder ID (e.g., S-1001)
    const count = await Shareholder.countDocuments();
    const shareholderId = `S-${1000 + count + 1}`;

    try {
        const shareholder = await Shareholder.create({
            shareholderId,
            name,
            fatherName,
            motherName,
            nid,
            phone,
            address
        });
        console.log(`[DB] Created Shareholder ID: ${shareholder._id}`);

        // If initial shares are provided, issue them
        if (numberOfShares && parseInt(numberOfShares) > 0) {
            const shareValueSetting = await Settings.findOne({ key: 'SHARE_VALUE' });
            const shareValue = shareValueSetting ? shareValueSetting.value : 50000;
            const amount = parseInt(numberOfShares) * shareValue;

            // Create Event
            await ShareHoldingEvent.create([{
                eventType: 'ISSUE',
                toShareholder: shareholder._id,
                sharesCount: parseInt(numberOfShares),
                shareValueAtTime: shareValue,
                createdBy: req.user._id,
                note: 'Initial Admission shares'
            }]);

            // Update Shareholder investment
            shareholder.numberOfShares = parseInt(numberOfShares);
            shareholder.totalInvestment = amount;
            await shareholder.save();
        }

        // Ledger Entry (if shares were issued or just for admission?)
        // The previous code only did this if numberOfShares > 0
        if (numberOfShares && parseInt(numberOfShares) > 0) {
            const shareValueSetting = await Settings.findOne({ key: 'SHARE_VALUE' });
            const shareValue = shareValueSetting ? shareValueSetting.value : 50000;
            const amount = parseInt(numberOfShares) * shareValue;

            await LedgerTransaction.create([{
                type: 'SHARE_PURCHASE',
                amount: amount,
                account: (account || 'CASH').toUpperCase(),
                shareholder: shareholder._id,
                createdBy: req.user._id,
                note: `Initial Admission - ${numberOfShares} shares`
            }]);
        }

        res.status(201).json(shareholder);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}));

// @desc    Issue shares
// @route   POST /api/shares/issue
// @access  Private/Admin
router.post('/issue', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT POST /api/shares/issue`, req.body);
    const { shareholderId, sharesCount, date, account, note } = req.body;

    const shareholder = await Shareholder.findById(shareholderId);
    if (!shareholder) {
        res.status(404);
        throw new Error('Shareholder not found');
    }

    const shareValueSetting = await Settings.findOne({ key: 'SHARE_VALUE' });
    const shareValue = shareValueSetting ? shareValueSetting.value : 50000;
    const amount = sharesCount * shareValue;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Create Event
        const event = await ShareHoldingEvent.create([{
            eventType: 'ISSUE',
            toShareholder: shareholderId,
            sharesCount,
            shareValueAtTime: shareValue,
            date: date || Date.now(),
            createdBy: req.user._id,
            note
        }], { session });

        // 2. Create Ledger Transaction
        await LedgerTransaction.create([{
            type: 'SHARE_PURCHASE',
            amount: amount,
            account,
            shareholder: shareholderId,
            createdBy: req.user._id,
            note: `Issued ${sharesCount} shares. ${note || ''}`
        }], { session });

        // 3. Update Shareholder
        shareholder.numberOfShares += sharesCount;
        shareholder.totalInvestment += amount;
        await shareholder.save({ session });

        await session.commitTransaction();
        console.log(`[DB] Shares Issued for Shareholder ID: ${shareholderId}, Amount: ${amount}`);
        res.status(201).json({ message: 'Shares issued successfully', event: event[0] });
    } catch (error) {
        await session.abortTransaction();
        res.status(400);
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
}));

// @desc    Transfer shares
// @route   POST /api/shares/transfer
// @access  Private/Admin
router.post('/transfer', protect, admin, asyncHandler(async (req, res) => {
    const { fromShareholderId, toShareholderId, sharesCount, date, note } = req.body;

    const fromShareholder = await Shareholder.findById(fromShareholderId);
    const toShareholder = await Shareholder.findById(toShareholderId);

    if (!fromShareholder || !toShareholder) {
        res.status(404);
        throw new Error('One or both shareholders not found');
    }

    // Check if enough shares (we need to calculate current count from events)
    const events = await ShareHoldingEvent.find({
        $or: [{ fromShareholder: fromShareholderId }, { toShareholder: fromShareholderId }]
    });

    let currentShares = 0;
    events.forEach(e => {
        if (e.toShareholder?.toString() === fromShareholderId.toString()) {
            currentShares += e.sharesCount;
        }
        if (e.fromShareholder?.toString() === fromShareholderId.toString()) {
            currentShares -= e.sharesCount;
        }
    });

    if (currentShares < sharesCount) {
        res.status(400);
        throw new Error('Insufficient shares for transfer');
    }

    // DIRECTOR MIN SHARE ENFORCEMENT
    if (fromShareholder.isDirector) {
        const minDirectorSharesSetting = await Settings.findOne({ key: 'MIN_DIRECTOR_SHARES' });
        const minShares = minDirectorSharesSetting ? minDirectorSharesSetting.value : 5;
        if (currentShares - sharesCount < minShares) {
            res.status(400);
            throw new Error(`Director must maintain at least ${minShares} shares. Transfer blocked.`);
        }
    }

    const shareValueSetting = await Settings.findOne({ key: 'SHARE_VALUE' });
    const shareValue = shareValueSetting ? shareValueSetting.value : 50000;
    const amount = sharesCount * shareValue;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await ShareHoldingEvent.create([{
            eventType: 'TRANSFER',
            fromShareholder: fromShareholderId,
            toShareholder: toShareholderId,
            sharesCount,
            shareValueAtTime: shareValue,
            date: date || Date.now(),
            createdBy: req.user._id,
            note
        }], { session });

        await LedgerTransaction.create([{
            type: 'SHARE_TRANSFER',
            amount: 0, // Metadata only
            account: 'OTHER',
            shareholder: fromShareholderId,
            createdBy: req.user._id,
            note: `Transferred ${sharesCount} shares to ${toShareholder.name}`
        }], { session });

        fromShareholder.numberOfShares -= sharesCount;
        toShareholder.numberOfShares += sharesCount;
        fromShareholder.totalInvestment -= amount;
        toShareholder.totalInvestment += amount;

        await fromShareholder.save({ session });
        await toShareholder.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Shares transferred successfully' });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}));

// @desc    Get shareholder details with timeline
// @route   GET /api/shareholders/:id/holding-timeline
// @access  Private
router.get('/:id/holding-timeline', protect, asyncHandler(async (req, res) => {
    const shareholder = await Shareholder.findById(req.params.id);
    if (!shareholder) {
        res.status(404);
        throw new Error('Shareholder not found');
    }

    const events = await ShareHoldingEvent.find({
        $or: [{ fromShareholder: req.params.id }, { toShareholder: req.params.id }]
    }).sort({ date: 1 });

    res.json({ shareholder, events });
}));

module.exports = router;
