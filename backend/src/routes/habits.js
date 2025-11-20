import express from 'express';
import Habit from '../models/Habit.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all habits for user
router.get('/', protect, async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new habit
router.post('/', protect, async (req, res) => {
    try {
        const habit = await Habit.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(habit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update habit (including toggling completion for a date)
router.put('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        res.json(habit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Toggle habit for today
router.post('/:id/toggle', protect, async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dateIndex = habit.completedDates.findIndex(date => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });

        if (dateIndex > -1) {
            habit.completedDates.splice(dateIndex, 1);
        } else {
            habit.completedDates.push(today);
        }

        await habit.save();
        res.json(habit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete habit
router.delete('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        res.json({ message: 'Habit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
