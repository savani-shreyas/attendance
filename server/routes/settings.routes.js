const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Get settings (Company-specific)
router.get('/', auth, async (req, res) => {
    try {
        let settings = await Settings.findOne({ companyId: req.companyId });
        if (!settings) {
            settings = new Settings({ companyId: req.companyId });
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update settings (Company-specific)
router.post('/', auth, async (req, res) => {
    try {
        let settings = await Settings.findOneAndUpdate(
            { companyId: req.companyId },
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.json(settings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
