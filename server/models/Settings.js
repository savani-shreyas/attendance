const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        unique: true
    },
    systemName: {
        type: String,
        default: "Attendance QR"
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);
