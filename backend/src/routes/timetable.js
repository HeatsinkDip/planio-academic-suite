import express from 'express';
import { protect } from '../middleware/auth.js';
import { Timetable } from '../models/index.js';

const router = express.Router();

// @route   GET /api/timetable
// @desc    Get all timetable entries for user (optionally filtered by semester)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = { userId: req.user._id };
        if (req.query.semesterId) {
            query.semesterId = req.query.semesterId;
        }
        const timetable = await Timetable.find(query).sort({ day: 1, startTime: 1 });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/timetable
// @desc    Create new timetable entry
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const entry = await Timetable.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/timetable/:id
// @desc    Update timetable entry
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const entry = await Timetable.findOne({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }
        Object.assign(entry, req.body);
        await entry.save();
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/timetable/:id
// @desc    Delete timetable entry
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const entry = await Timetable.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }
        res.json({ message: 'Timetable entry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
