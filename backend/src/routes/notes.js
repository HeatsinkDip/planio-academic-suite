import express from 'express';
import Note from '../models/Note.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all notes for user
router.get('/', protect, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id }).sort({ pinned: -1, createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new note
router.post('/', protect, async (req, res) => {
    try {
        const note = await Note.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update note
router.put('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete note
router.delete('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
