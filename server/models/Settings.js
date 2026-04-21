const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: String,
}, {
    timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
