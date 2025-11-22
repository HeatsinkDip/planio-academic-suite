import express from 'express';
import { protect } from '../middleware/auth.js';
import { Exam } from '../models/index.js';

const router = express.Router();

// @route   GET /api/exams
// @desc    Get all exams for user (optionally filtered by semester)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = { userId: req.user._id };
        
        // If semesterId is provided, use it; otherwise get active semester's data
        if (req.query.semesterId) {
            query.semesterId = req.query.semesterId;
        } else {
            // Only return exams for active (non-archived) semester
            const { SemesterConfig } = await import('../models/index.js');
            const activeSemester = await SemesterConfig.findOne({
                userId: req.user._id,
                isActive: true,
                isArchived: false
            });
            
            if (!activeSemester) {
                // No active semester, return empty array
                return res.json([]);
            }
            
            query.semesterId = activeSemester._id;
        }
        
        const exams = await Exam.find(query).sort({ date: 1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/exams
// @desc    Create new exam
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const exam = await Exam.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const exam = await Exam.findOne({ _id: req.params.id, userId: req.user._id });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        Object.assign(exam, req.body);
        await exam.save();
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const exam = await Exam.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.json({ message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
