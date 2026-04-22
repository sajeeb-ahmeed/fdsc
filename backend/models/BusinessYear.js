const mongoose = require('mongoose');

const businessYearSchema = mongoose.Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    directorCutPercent: { type: Number, default: 25 },
    shareholderPoolPercent: { type: Number, default: 75 },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
}, {
    timestamps: true,
});

const BusinessYear = mongoose.model('BusinessYear', businessYearSchema);
module.exports = BusinessYear;
