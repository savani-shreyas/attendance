const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    companyCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    password: {
        type: String,
        required: true
    },
    displayPassword: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
CompanySchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
CompanySchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Company', CompanySchema);
