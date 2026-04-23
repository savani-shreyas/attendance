const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    scannerPassword: {
        type: String,
        required: true,
        default: '1234' // Default password for initial migration
    },
    displayScannerPassword: {
        type: String,
        default: '1234'
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

// Hash password before saving
EmployeeSchema.pre('save', async function(next) {
    if (!this.isModified('scannerPassword')) return next();
    this.scannerPassword = await bcrypt.hash(this.scannerPassword, 10);
    next();
});

// Compare password method
EmployeeSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.scannerPassword);
};

module.exports = mongoose.model('Employee', EmployeeSchema);
