const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const { protect, admin } = require('../middleware/authMiddleware');
const paginate = require('../utils/pagination');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    console.log(`[API] HIT GET /api/members`);
    const { page, limit } = req.query;
    const result = await paginate(Member, {}, { page, limit });
    res.json(result);
}));

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (member) {
        res.json(member);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
}));

// @desc    Create member
// @route   POST /api/members
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT POST /api/members`, req.body);
    const { memberId, name, mobile, fatherName, motherName, husbandName, birthDate, religion, profession, nid, presentAddress, permanentAddress, photo, nomineeName, nomineeRelation, nomineeAge, nomineePhoto } = req.body;

    const memberExists = await Member.findOne({ memberId });
    if (memberExists) {
        res.status(400);
        throw new Error('Member ID already exists');
    }

    try {
        const member = await Member.create({
            memberId, name, mobile, fatherName, motherName, husbandName, birthDate, religion, profession, nid, presentAddress, permanentAddress, photo, nomineeName, nomineeRelation, nomineeAge, nomineePhoto
        });
        console.log(`[DB] Created Member ID: ${member._id}`);
        res.status(201).json(member);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}));

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT PUT /api/members/${req.params.id}`, req.body);
    const member = await Member.findById(req.params.id);

    if (member) {
        member.name = req.body.name || member.name;
        member.mobile = req.body.mobile || member.mobile;
        member.fatherName = req.body.fatherName || member.fatherName;
        member.motherName = req.body.motherName || member.motherName;
        member.husbandName = req.body.husbandName || member.husbandName;
        member.birthDate = req.body.birthDate || member.birthDate;
        member.religion = req.body.religion || member.religion;
        member.profession = req.body.profession || member.profession;
        member.nid = req.body.nid || member.nid;
        member.presentAddress = req.body.presentAddress || member.presentAddress;
        member.permanentAddress = req.body.permanentAddress || member.permanentAddress;
        member.photo = req.body.photo || member.photo;
        member.nomineeName = req.body.nomineeName || member.nomineeName;
        member.nomineeRelation = req.body.nomineeRelation || member.nomineeRelation;
        member.nomineeAge = req.body.nomineeAge || member.nomineeAge;
        member.nomineePhoto = req.body.nomineePhoto || member.nomineePhoto;

        try {
            const updatedMember = await member.save();
            console.log(`[DB] Updated Member ID: ${updatedMember._id}`);
            res.json(updatedMember);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
}));

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);
    if (member) {
        await member.deleteOne();
        res.json({ message: 'Member removed' });
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
}));

module.exports = router;
