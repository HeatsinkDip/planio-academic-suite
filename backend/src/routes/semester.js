import express from 'express';
import { protect } from '../middleware/auth.js';
import { SemesterConfig, SemesterEvent } from '../models/index.js';

const router = express.Router();

// @route   GET /api/semester/config
// @desc    Get semester config for user
// @access  Private
router.get('/config', protect, async (req, res) => {
    try {
        const config = await SemesterConfig.findOne({ userId: req.user._id });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/semester/config
// @desc    Create or update semester config
// @access  Private
router.post('/config', protect, async (req, res) => {
    try {
        let config = await SemesterConfig.findOne({ userId: req.user._id });
        if (config) {
            Object.assign(config, req.body);
            await config.save();
        } else {
            config = await SemesterConfig.create({
                ...req.body,
                userId: req.user._id
            });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/semester/events
// @desc    Get all semester events
// @access  Private
router.get('/events', protect, async (req, res) => {
    try {
        const events = await SemesterEvent.find({ userId: req.user._id }).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/semester/events
// @desc    Create new semester event
// @access  Private
router.post('/events', protect, async (req, res) => {
    try {
        const event = await SemesterEvent.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/semester/events/:id
// @desc    Delete semester event
// @access  Private
router.delete('/events/:id', protect, async (req, res) => {
    try {
        const event = await SemesterEvent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
