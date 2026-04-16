const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Company = require('../models/Company');

// Super Admin Registration (To create new companies)
router.post('/register', async (req, res) => {
    try {
        const { companyName, password, superAdminPassword } = req.body;

        // Simple security check for Super Admin
        if (superAdminPassword !== (process.env.SUPER_ADMIN_PASSWORD || 'admin123')) {
            return res.status(403).json({ message: 'Invalid Super Admin Password' });
        }

        // Verify DB connection before attempting save
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database connection is not ready. Please check if your MongoDB is running.' });
        }

        // Generate sequential Company Code (COM-0001, COM-0002, etc.)
        const lastCompany = await Company.findOne({ companyCode: /^COM-/ }).sort({ companyCode: -1 });
        let nextNumber = 1;
        if (lastCompany) {
            const lastNumber = parseInt(lastCompany.companyCode.split('-')[1]);
            nextNumber = lastNumber + 1;
        }
        const companyCode = `COM-${nextNumber.toString().padStart(4, '0')}`;

        const company = new Company({
            companyName,
            companyCode,
            password,
            displayPassword: password
        });

        await company.save();
        res.status(201).json({ message: 'Company created successfully', company: { name: company.companyName, code: company.companyCode } });
    } catch (err) {
        console.error("Registration Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'This Company Code is already taken.' });
        }
        res.status(500).json({ message: err.message || 'Server error during registration' });
    }
});

// Company Login
router.post('/login', async (req, res) => {
    try {
        const { companyCode, password } = req.body;

        const company = await Company.findOne({ companyCode: companyCode.toUpperCase() });
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const isMatch = await company.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { companyId: company._id, companyCode: company.companyCode },
            process.env.JWT_SECRET || 'secret_key_123',
            { expiresIn: '30d' }
        );

        res.json({
            token,
            company: {
                id: company._id,
                name: company.companyName,
                code: company.companyCode
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all companies (Super Admin only)
router.get('/companies', async (req, res) => {
    try {
        const { superAdminPassword } = req.query;
        if (superAdminPassword !== (process.env.SUPER_ADMIN_PASSWORD || 'admin123')) {
            return res.status(403).json({ message: 'Invalid Super Admin Password' });
        }

        const companies = await Company.find().sort({ createdAt: -1 });
        res.json(companies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a company (Super Admin only)
router.delete('/companies/:id', async (req, res) => {
    try {
        const { superAdminPassword } = req.body;
        if (superAdminPassword !== (process.env.SUPER_ADMIN_PASSWORD || 'admin123')) {
            return res.status(403).json({ message: 'Invalid Super Admin Password' });
        }

        await Company.findByIdAndDelete(req.params.id);
        res.json({ message: 'Company account deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a company (Super Admin only)
router.put('/companies/:id', async (req, res) => {
    try {
        const { companyName, password, superAdminPassword } = req.body;
        if (superAdminPassword !== (process.env.SUPER_ADMIN_PASSWORD || 'admin123')) {
            return res.status(403).json({ message: 'Invalid Super Admin Password' });
        }

        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        if (companyName) company.companyName = companyName;
        if (password) {
            company.password = password; // Pre-save hook will hash it
            company.displayPassword = password; // For Super Admin view
        }

        await company.save();
        res.json({ message: 'Company details updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
