import express from 'express';
import SharedExpense from '../models/SharedExpense.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all shared expenses for user
router.get('/', protect, async (req, res) => {
    try {
        const expenses = await SharedExpense.find({ userId: req.user._id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new shared expense
router.post('/', protect, async (req, res) => {
    try {
        const expense = await SharedExpense.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update shared expense
router.put('/:id', protect, async (req, res) => {
    try {
        const expense = await SharedExpense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete shared expense
router.delete('/:id', protect, async (req, res) => {
    try {
        const expense = await SharedExpense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
