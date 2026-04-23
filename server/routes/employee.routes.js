const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

const Company = require('../models/Company');

// Get all employees (now filtered by company)
router.get('/', auth, async (req, res) => {
    try {
        const employees = await Employee.find({ companyId: req.companyId }).sort({ createdAt: -1 });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create an employee (now linked to company)
router.post('/', auth, async (req, res) => {
    const { name, employeeId, scannerPassword } = req.body;
    
    // Generate simple ID if not provided
    const finalId = employeeId || `EMP-${Date.now().toString().slice(-4)}`;

    const employee = new Employee({
        companyId: req.companyId,
        name,
        employeeId: finalId,
        scannerPassword: scannerPassword || '1234',
        displayScannerPassword: scannerPassword || '1234'
    });

    try {
        const newEmployee = await employee.save();
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Employee Login for Scanner (Public)
router.post('/login', async (req, res) => {
    const { employeeId, scannerPassword, companyCode } = req.body;

    try {
        // 1. Find the company
        const company = await Company.findOne({ companyCode });
        if (!company) {
            return res.status(404).json({ message: 'Invalid Company Code.' });
        }

        // 2. Find the employee in that company
        const employee = await Employee.findOne({ employeeId, companyId: company._id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee ID not found.' });
        }

        // 3. Check password
        const isMatch = await employee.comparePassword(scannerPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect scanner password.' });
        }

        // Return employee info for the session
        res.json({
            success: true,
            employee: {
                id: employee.employeeId,
                name: employee.name,
                companyCode: company.companyCode
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete an employee (restricted to your own company)
router.delete('/:id', auth, async (req, res) => {
    try {
        const employee = await Employee.findOneAndDelete({ 
            _id: req.params.id, 
            companyId: req.companyId 
        });
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found or unauthorized' });
        }
        
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an employee (restricted to your own company)
router.put('/:id', auth, async (req, res) => {
    const { name, employeeId, scannerPassword } = req.body;
    try {
        const employee = await Employee.findOne({ 
            _id: req.params.id, 
            companyId: req.companyId 
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found or unauthorized' });
        }

        if (name) employee.name = name;
        if (employeeId) employee.employeeId = employeeId;
        if (scannerPassword) {
            employee.scannerPassword = scannerPassword;
            employee.displayScannerPassword = scannerPassword;
        }

        await employee.save();
        res.json({ message: 'Employee updated successfully', employee });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
