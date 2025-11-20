import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Other'
    },
    icon: {
        type: String,
        default: '✓'
    },
    color: {
        type: String,
        default: 'from-gray-500 to-slate-600'
    },
    target: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'daily'
    },
    completedDates: [{
        type: Date
    }]
}, {
    timestamps: true
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
