const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// POST /api/attendance/scan (Now company-specific)
router.post('/scan', auth, async (req, res) => {
    const { employeeId } = req.body;
    
    try {
        // Find employee within THIS company
        const employee = await Employee.findOne({ employeeId, companyId: req.companyId });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found in your company' });
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

        // Find or create today's attendance record for THIS company
        let attendance = await Attendance.findOne({ employeeId, date: dateStr, companyId: req.companyId });
        if (!attendance) {
            attendance = new Attendance({
                companyId: req.companyId,
                employeeId,
                employeeName: employee.name,
                date: dateStr,
                day: dayName
            });
        }

        let slot = null;
        // Always pick the first available slot (Flexible Mode)
        if (attendance.morningIn === "--") slot = 'morningIn';
        else if (attendance.breakIn === "--") slot = 'breakIn';
        else if (attendance.breakOut === "--") slot = 'breakOut';
        else if (attendance.eveningOut === "--") slot = 'eveningOut';
        
        if (!slot) {
            return res.status(400).json({ message: 'All scans for today are already recorded.' });
        }

        // Record the time
        attendance[slot] = timeStr;
        await attendance.save();

        res.json({ 
            success: true, 
            message: `Recorded ${slot.replace(/([A-Z])/g, ' $1').toLowerCase()} at ${timeStr}`,
            attendance 
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/attendance - Fetch logs with filters (Company-isolated)
router.get('/', auth, async (req, res) => {
    const { date, employeeId } = req.query;
    let query = { companyId: req.companyId };
    if (date) query.date = date;
    if (employeeId) query.employeeId = employeeId;

    try {
        const logs = await Attendance.find(query).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
