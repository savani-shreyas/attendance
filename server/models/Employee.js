const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    employeeId: {
        type: String,
        required: true,
        trim: true
    },
    qrCode: {
        type: String, // Data URL or just the ID for generation on frontend
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure employeeId is unique WITHIN a company, not globally across all companies
EmployeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
