import mongoose from 'mongoose';

const debtSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['lent', 'borrowed'],
        required: true
    },
    person: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    loanDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date
    },
    description: {
        type: String
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    settled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Debt = mongoose.model('Debt', debtSchema);

export default Debt;
