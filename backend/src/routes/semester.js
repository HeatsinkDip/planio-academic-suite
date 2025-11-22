import express from 'express';
import { protect } from '../middleware/auth.js';
import { SemesterConfig, SemesterEvent } from '../models/index.js';

const router = express.Router();

// Drop incorrect unique index if it exists (run once)
(async () => {
    try {
        const indexes = await SemesterConfig.collection.getIndexes();
        if (indexes.userId_1) {
            await SemesterConfig.collection.dropIndex('userId_1');
            console.log('✅ Dropped old userId_1 unique index from SemesterConfig');
        }
    } catch (error) {
        // Index doesn't exist or already dropped, ignore
        console.log('ℹ️ No userId_1 index to drop');
    }
})();

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
// @desc    Get all semesters for user (non-archived)
// @access  Private
router.get('/all', protect, async (req, res) => {
    try {
        const semesters = await SemesterConfig.find({ userId: req.user._id, isArchived: false }).sort({ createdAt: -1 });
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/semester/archived
// @desc    Get all archived semesters for user
// @access  Private
router.get('/archived', protect, async (req, res) => {
    try {
        const semesters = await SemesterConfig.find({ userId: req.user._id, isArchived: true }).sort({ endDate: -1 });
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/semester/check-expiration
// @desc    Check and auto-archive expired semesters
// @access  Private
router.post('/check-expiration', protect, async (req, res) => {
    try {
        const now = new Date();
        
        // Find active semester that has expired
        const expiredSemester = await SemesterConfig.findOne({
            userId: req.user._id,
            isActive: true,
            isArchived: false,
            endDate: { $lt: now }
        });

        if (expiredSemester) {
            // Archive the expired semester
            expiredSemester.isActive = false;
            expiredSemester.isArchived = true;
            await expiredSemester.save();

            return res.json({ 
                expired: true, 
                archivedSemester: expiredSemester,
                message: 'Semester has been archived due to expiration'
            });
        }

        res.json({ expired: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/semester/config
// @desc    Create new semester config
// @access  Private
router.post('/config', protect, async (req, res) => {
    try {
        // Deactivate all other active semesters
        await SemesterConfig.updateMany(
            { userId: req.user._id, isActive: true },
            { isActive: false }
        );
        
        // Create new semester with isActive: true
        const config = await SemesterConfig.create({
            ...req.body,
            userId: req.user._id,
            isActive: true,
            isArchived: false
        });
        res.status(201).json(config);
    } catch (error) {
        console.error('Error creating semester:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/semester/:id
// @desc    Get specific semester by ID (for history viewing)
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const semester = await SemesterConfig.findOne({ _id: req.params.id, userId: req.user._id });
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }
        res.json(semester);
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
