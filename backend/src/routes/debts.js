import express from 'express';
import Debt from '../models/Debt.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all debts for user
router.get('/', protect, async (req, res) => {
    try {
        const debts = await Debt.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(debts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new debt
router.post('/', protect, async (req, res) => {
    try {
        const debt = await Debt.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(debt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update debt
router.put('/:id', protect, async (req, res) => {
    try {
        const debt = await Debt.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!debt) {
            return res.status(404).json({ message: 'Debt not found' });
        }
        res.json(debt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete debt
router.delete('/:id', protect, async (req, res) => {
    try {
        const debt = await Debt.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!debt) {
            return res.status(404).json({ message: 'Debt not found' });
        }
        res.json({ message: 'Debt deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
