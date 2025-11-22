import express from 'express';
import { protect } from '../middleware/auth.js';
import { Assignment } from '../models/index.js';

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get all assignments for user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = { userId: req.user._id };
        
        // If semesterId is provided, use it; otherwise get active semester's data
        if (req.query.semesterId) {
            query.semesterId = req.query.semesterId;
        } else {
            // Only return assignments for active (non-archived) semester
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
        
        const assignments = await Assignment.find(query).sort({ dueDate: 1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const assignment = await Assignment.create({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        Object.assign(assignment, req.body);
        await assignment.save();
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
