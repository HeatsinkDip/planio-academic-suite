import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import transactionRoutes from './routes/transactions.js';
import walletRoutes from './routes/wallets.js';
import semesterRoutes from './routes/semester.js';
import timetableRoutes from './routes/timetable.js';
import assignmentRoutes from './routes/assignments.js';
import examRoutes from './routes/exams.js';
import deadlineRoutes from './routes/deadlines.js';
import debtRoutes from './routes/debts.js';
import noteRoutes from './routes/notes.js';
import sharedExpenseRoutes from './routes/sharedExpenses.js';
import eventRoutes from './routes/events.js';
import habitRoutes from './routes/habits.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: '🎓 Welcome to Planio API',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            tasks: '/api/tasks',
            transactions: '/api/transactions',
            wallets: '/api/wallets',
            semester: '/api/semester',
            timetable: '/api/timetable',
            assignments: '/api/assignments',
            exams: '/api/exams',
            deadlines: '/api/deadlines',
            debts: '/api/debts',
            notes: '/api/notes',
            sharedExpenses: '/api/shared-expenses',
            events: '/api/events',
            habits: '/api/habits',
        },
        documentation: 'See DEPLOYMENT.md for API documentation'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/shared-expenses', sharedExpenseRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/habits', habitRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Internal server error' 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
