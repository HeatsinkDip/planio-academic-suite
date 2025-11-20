import mongoose from 'mongoose';

const sharedExpenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidBy: {
        type: String,
        required: true
    },
    splitWith: [{
        name: String,
        share: Number,
        shareType: {
            type: String,
            enum: ['equal', 'custom'],
            default: 'equal'
        }
    }],
    category: {
        type: String,
        default: 'Other'
    },
    date: {
        type: Date,
        default: Date.now
    },
    settled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const SharedExpense = mongoose.model('SharedExpense', sharedExpenseSchema);

export default SharedExpense;
