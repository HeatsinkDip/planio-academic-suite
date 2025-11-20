import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    dueDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: String,
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'transfer'],
        required: true
    },
    category: String,
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    fromWalletId: mongoose.Schema.Types.ObjectId,
    toWalletId: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date,
        default: Date.now
    }
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['cash', 'bank', 'card', 'mobile'],
        default: 'cash'
    },
    balance: {
        type: Number,
        default: 0
    },
    icon: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const semesterConfigSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: String,
    startDate: Date,
    endDate: Date,
    holidays: [String]
});

const semesterEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['exam', 'assignment', 'deadline', 'semester_end'],
        default: 'deadline'
    },
    date: {
        type: Date,
        required: true
    },
    time: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const timetableSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['lecture', 'lab', 'tutorial'],
        default: 'lecture'
    },
    day: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    location: String,
    instructor: String,
    color: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const assignmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    course: String,
    dueDate: {
        type: String,
        required: true
    },
    description: String,
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const examSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subject: String,
    date: {
        type: String,
        required: true
    },
    time: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Task = mongoose.model('Task', taskSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Wallet = mongoose.model('Wallet', walletSchema);
export const SemesterConfig = mongoose.model('SemesterConfig', semesterConfigSchema);
export const SemesterEvent = mongoose.model('SemesterEvent', semesterEventSchema);
export const Timetable = mongoose.model('Timetable', timetableSchema);
export const Assignment = mongoose.model('Assignment', assignmentSchema);
export const Exam = mongoose.model('Exam', examSchema);
