import express from 'express';
import { protect } from '../middleware/auth.js';
import { Deadline } from '../models/index.js';

const router = express.Router();

// @route   GET /api/deadlines
// @desc    Get all deadlines for user (optionally filtered by semester)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = { userId: req.user._id };
        if (req.query.semesterId) {
            query.semesterId = req.query.semesterId;
        }
        const deadlines = await Deadline.find(query).sort({ dueDate: 1 });
        res.json(deadlines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/deadlines
// @desc    Create new deadline
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const deadline = await Deadline.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(deadline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/deadlines/:id
// @desc    Update deadline
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const deadline = await Deadline.findOne({ _id: req.params.id, userId: req.user._id });
        if (!deadline) {
            return res.status(404).json({ message: 'Deadline not found' });
        }
        Object.assign(deadline, req.body);
        await deadline.save();
        res.json(deadline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/deadlines/:id
// @desc    Delete deadline
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const deadline = await Deadline.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deadline) {
            return res.status(404).json({ message: 'Deadline not found' });
        }
        res.json({ message: 'Deadline deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
