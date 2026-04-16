const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');

// POST /api/attendance/scan
router.post('/scan', async (req, res) => {
    const { employeeId } = req.body;
    
    try {
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const settings = await Settings.findOne({ id: 'global' }) || new Settings({ id: 'global' });
        const now = new Date();
        const hour = now.getHours();
        const dateStr = now.toISOString().split('T')[0];
        const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

        // Find or create today's attendance record
        let attendance = await Attendance.findOne({ employeeId, date: dateStr });
        if (!attendance) {
            attendance = new Attendance({
                employeeId,
                employeeName: employee.name,
                date: dateStr,
                day: dayName
            });
        }

        let slot = null;

        if (settings.testMode) {
            // In test mode, pick the first available slot
            if (attendance.morningIn === "--") slot = 'morningIn';
            else if (attendance.breakIn === "--") slot = 'breakIn';
            else if (attendance.breakOut === "--") slot = 'breakOut';
            else if (attendance.eveningOut === "--") slot = 'eveningOut';
            
            if (!slot) return res.status(400).json({ message: 'All scans for today are already recorded.' });
        } else {
            // Normal mode: check against dynamic ranges
            if (hour >= settings.morningStart && hour < settings.morningEnd) slot = 'morningIn';
            else if (hour >= settings.breakInStart && hour < settings.breakInEnd) slot = 'breakIn';
            else if (hour >= settings.breakOutStart && hour < settings.breakOutEnd) slot = 'breakOut';
            else if (hour >= settings.eveningStart && hour < settings.eveningEnd) slot = 'eveningOut';

            if (!slot) {
                return res.status(400).json({ message: 'Scanned outside valid time windows.' });
            }

            // Check if already scanned in this window
            if (attendance[slot] !== "--") {
                return res.status(400).json({ message: `Already recorded ${slot.replace(/([A-Z])/g, ' $1').toLowerCase()} for today.` });
            }
        }

        // Record the time
        attendance[slot] = timeStr;
        await attendance.save();

        res.json({ 
            success: true, 
            message: `Recorded ${slot.replace(/([A-Z])/g, ' $1').toLowerCase()} at ${timeStr} ${settings.testMode ? '(Test Mode)' : ''}`,
            attendance 
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/attendance - Fetch logs with filters
router.get('/', async (req, res) => {
    const { date, employeeId } = req.query;
    let query = {};
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
