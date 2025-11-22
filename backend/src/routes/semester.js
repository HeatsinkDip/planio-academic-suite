import express from 'express';
import { protect } from '../middleware/auth.js';
import { SemesterConfig, SemesterEvent } from '../models/index.js';

const router = express.Router();

// @route   GET /api/semester/config
// @desc    Get active semester config for user
// @access  Private
router.get('/config', protect, async (req, res) => {
    try {
        const config = await SemesterConfig.findOne({ 
            userId: req.user._id, 
            isActive: true,
            isArchived: false
        }).sort({ createdAt: -1 });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/semester/all
// @desc    Get all semesters for user
// @access  Private
router.get('/all', protect, async (req, res) => {
    try {
        const semesters = await SemesterConfig.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/semester/config
// @desc    Create new semester config
// @access  Private
router.post('/config', protect, async (req, res) => {
    try {
        // Deactivate all other semesters if this one is active
        if (req.body.isActive) {
            await SemesterConfig.updateMany(
                { userId: req.user._id, isActive: true },
                { isActive: false }
            );
        }
        
        const config = await SemesterConfig.create({
            ...req.body,
            userId: req.user._id,
            isActive: true
        });
        res.status(201).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/semester/config/:id
// @desc    Update semester config
// @access  Private
router.put('/config/:id', protect, async (req, res) => {
    try {
        const config = await SemesterConfig.findOne({ _id: req.params.id, userId: req.user._id });
        if (!config) {
            return res.status(404).json({ message: 'Semester not found' });
        }
        
        // If setting this semester as active, deactivate others
        if (req.body.isActive && !config.isActive) {
            await SemesterConfig.updateMany(
                { userId: req.user._id, isActive: true, _id: { $ne: req.params.id } },
                { isActive: false }
            );
        }
        
        Object.assign(config, req.body);
        await config.save();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/semester/config
// @desc    Update active semester config (legacy support)
// @access  Private
router.put('/config', protect, async (req, res) => {
    try {
        let config = await SemesterConfig.findOne({ 
            userId: req.user._id, 
            isActive: true 
        });
        
        if (config) {
            Object.assign(config, req.body);
            await config.save();
        } else {
            // Create new if none exists
            config = await SemesterConfig.create({
                ...req.body,
                userId: req.user._id,
                isActive: true
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

// @route   GET /api/semester/history
// @desc    Get all past semesters
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const history = await SemesterConfig.find({ 
            userId: req.user._id,
            endDate: { $lt: new Date() },
            isArchived: true
        }).sort({ endDate: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/semester/archive
// @desc    Archive current semester
// @access  Private
router.post('/archive', protect, async (req, res) => {
    try {
        const config = await SemesterConfig.findOne({ userId: req.user._id });
        if (config) {
            config.isArchived = true;
            await config.save();
            res.json(config);
        } else {
            res.status(404).json({ message: 'No semester to archive' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
