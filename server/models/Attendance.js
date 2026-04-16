const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        trim: true
    },
    employeeName: {
        type: String,
        required: true
    },
    date: {
        type: String, // format: YYYY-MM-DD
        required: true
    },
    day: {
        type: String, // e.g., Monday
        required: true
    },
    morningIn: {
        type: String, // time format HH:MM:SS
        default: "--"
    },
    breakIn: {
        type: String,
        default: "--"
    },
    breakOut: {
        type: String,
        default: "--"
    },
    eveningOut: {
        type: String,
        default: "--"
    }
});

// Compound index to ensure uniqueness per employee per day PER COMPANY
AttendanceSchema.index({ employeeId: 1, date: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
