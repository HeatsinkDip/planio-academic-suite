import express from 'express';
import { protect } from '../middleware/auth.js';
import { Wallet } from '../models/index.js';

const router = express.Router();

// @route   GET /api/wallets
// @desc    Get all wallets for user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const wallets = await Wallet.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/wallets
// @desc    Create new wallet
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const wallet = await Wallet.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/wallets/:id
// @desc    Update wallet
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ _id: req.params.id, userId: req.user._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        Object.assign(wallet, req.body);
        await wallet.save();
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/wallets/:id
// @desc    Delete wallet
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        res.json({ message: 'Wallet deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
