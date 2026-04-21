const mongoose = require('mongoose');

const shareholderSchema = mongoose.Schema({
    shareholderId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: String,
    motherName: String,
    nid: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
        village: String,
        post: String,
        upazila: String,
        district: String
    },
    isDirector: { type: Boolean, default: false },
    position: String, // Chairman, Director, etc.
    photo: String,
    numberOfShares: { type: Number, default: 0 },
    totalInvestment: { type: Number, default: 0 },
    accruedDividend: { type: Number, default: 0 },
    withdrawnDividend: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const Shareholder = mongoose.model('Shareholder', shareholderSchema);
module.exports = Shareholder;
