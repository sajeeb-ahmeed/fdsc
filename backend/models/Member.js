const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    memberId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: String,
    motherName: String,
    husbandName: String,
    birthDate: Date,
    religion: String,
    mobile: { type: String, required: true },
    profession: String,
    nid: String,
    presentAddress: String,
    permanentAddress: String,
    photo: String,
    nomineeName: String,
    nomineeRelation: String,
    nomineeAge: String,
    nomineePhoto: String,
    savingsBalance: { type: Number, default: 0 },
    shareBalance: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;
