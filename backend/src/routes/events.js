import express from 'express';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all events for user
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find({ userId: req.user._id }).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new event
router.post('/', protect, async (req, res) => {
    try {
        const event = await Event.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update event
router.put('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete event
router.delete('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
