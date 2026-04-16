const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

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
    const { name, employeeId } = req.body;
    
    // Generate simple ID if not provided
    const finalId = employeeId || `EMP-${Date.now().toString().slice(-4)}`;

    const employee = new Employee({
        companyId: req.companyId,
        name,
        employeeId: finalId
    });

    try {
        const newEmployee = await employee.save();
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
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

module.exports = router;
