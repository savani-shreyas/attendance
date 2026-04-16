const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'global' }, // Singleton settings
    morningStart: { type: Number, default: 8 },
    morningEnd: { type: Number, default: 11 },
    breakInStart: { type: Number, default: 12 },
    breakInEnd: { type: Number, default: 13 },
    breakOutStart: { type: Number, default: 14 },
    breakOutEnd: { type: Number, default: 15 },
    eveningStart: { type: Number, default: 17 },
    eveningEnd: { type: Number, default: 20 },
    testMode: { type: Boolean, default: false } // Allows scanning anytime
});

module.exports = mongoose.model('Settings', SettingsSchema);
