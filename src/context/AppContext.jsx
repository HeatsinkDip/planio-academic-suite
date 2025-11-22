import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    tasksAPI,
    transactionsAPI,
    walletsAPI,
    semesterAPI,
    timetableAPI,
    assignmentsAPI,
    examsAPI,
    deadlinesAPI,
    debtsAPI,
    notesAPI,
    sharedExpensesAPI,
    eventsAPI,
    habitsAPI,
} from '../services/api';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const { currentUser, isAuthenticated } = useAuth();
    
    // State
    const [tasks, setTasks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [semesterConfig, setSemesterConfigState] = useState(null);
    const [semester, setSemester] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    // Placeholder states for features not yet connected to backend
    const [debts, setDebts] = useState([]);
    const [sharedExpenses, setSharedExpenses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [studySessions, setStudySessions] = useState([]);
    const [habits, setHabits] = useState([]);
    const [events, setEvents] = useState([]);

    // Load data when authenticated
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            console.log('🔄 Loading user data...');
            loadAllData();
        } else if (!isAuthenticated) {
            // Clear data on logout
            console.log('🗑️ Clearing data (user logged out)');
            clearAllData();
        }
    }, [isAuthenticated, currentUser?._id]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [
                tasksData,
                transactionsData,
                walletsData,
                semesterConfigData,
                semesterEventsData,
                timetableData,
                assignmentsData,
                examsData,
                deadlinesData,
                debtsData,
                notesData,
                sharedExpensesData,
                eventsData,
                habitsData,
            ] = await Promise.allSettled([
                tasksAPI.getAll(),
                transactionsAPI.getAll(),
                walletsAPI.getAll(),
                semesterAPI.getConfig(),
                semesterAPI.getEvents(),
                timetableAPI.getAll(),
                assignmentsAPI.getAll(),
                examsAPI.getAll(),
                deadlinesAPI.getAll(),
                debtsAPI.getAll(),
                notesAPI.getAll(),
                sharedExpensesAPI.getAll(),
                eventsAPI.getAll(),
                habitsAPI.getAll(),
            ]);

            if (tasksData.status === 'fulfilled') {
                console.log('✅ Tasks loaded:', tasksData.value.length);
                setTasks(tasksData.value);
            } else {
                console.error('❌ Tasks load failed:', tasksData.reason);
            }

            if (transactionsData.status === 'fulfilled') {
                console.log('✅ Transactions loaded:', transactionsData.value.length);
                setTransactions(transactionsData.value);
            } else {
                console.error('❌ Transactions load failed:', transactionsData.reason);
            }

            if (walletsData.status === 'fulfilled') {
                const walletsArray = walletsData.value;
                console.log('✅ Wallets loaded:', walletsArray.length);
                // Initialize default wallets if none exist
                if (walletsArray.length === 0) {
                    console.log('Creating default wallets...');
                    const defaultWallets = [
                        { name: 'Cash', type: 'cash', balance: 0, icon: '💵' },
                        { name: 'Bank Account', type: 'bank', balance: 0, icon: '🏦' },
                        { name: 'Credit Card', type: 'card', balance: 0, icon: '💳' },
                        { name: 'Mobile Banking', type: 'mobile', balance: 0, icon: '📱' },
                    ];
                    for (const wallet of defaultWallets) {
                        await walletsAPI.create(wallet);
                    }
                    const newWallets = await walletsAPI.getAll();
                    setWallets(newWallets);
                    console.log('✅ Default wallets created');
                } else {
                    setWallets(walletsArray);
                }
            } else {
                console.error('❌ Wallets load failed:', walletsData.reason);
            }

            if (semesterConfigData.status === 'fulfilled') {
                console.log('✅ Semester config loaded');
                setSemesterConfigState(semesterConfigData.value);
            }
            if (semesterEventsData.status === 'fulfilled') {
                console.log('✅ Semester events loaded:', semesterEventsData.value.length);
                setSemester(semesterEventsData.value);
            }
            if (timetableData.status === 'fulfilled') {
                console.log('✅ Timetable loaded:', timetableData.value.length);
                setTimetable(timetableData.value);
            }
            if (assignmentsData.status === 'fulfilled') {
                console.log('✅ Assignments loaded:', assignmentsData.value.length);
                setAssignments(assignmentsData.value);
            }
            if (examsData.status === 'fulfilled') {
                console.log('✅ Exams loaded:', examsData.value.length);
                setExams(examsData.value);
            }
            if (deadlinesData.status === 'fulfilled') {
                console.log('✅ Deadlines loaded:', deadlinesData.value.length);
                setDeadlines(deadlinesData.value);
            }
            if (debtsData.status === 'fulfilled') {
                console.log('✅ Debts loaded:', debtsData.value.length);
                setDebts(debtsData.value);
            } else {
                console.error('❌ Debts load failed:', debtsData.reason);
            }
            if (notesData.status === 'fulfilled') {
                console.log('✅ Notes loaded:', notesData.value.length);
                setNotes(notesData.value);
            } else {
                console.error('❌ Notes load failed:', notesData.reason);
            }
            if (sharedExpensesData.status === 'fulfilled') {
                console.log('✅ Shared expenses loaded:', sharedExpensesData.value.length);
                setSharedExpenses(sharedExpensesData.value);
            } else {
                console.error('❌ Shared expenses load failed:', sharedExpensesData.reason);
            }
            if (eventsData.status === 'fulfilled') {
                console.log('✅ Events loaded:', eventsData.value.length);
                setEvents(eventsData.value);
            } else {
                console.error('❌ Events load failed:', eventsData.reason);
            }
            if (habitsData.status === 'fulfilled') {
                console.log('✅ Habits loaded:', habitsData.value.length);
                setHabits(habitsData.value);
            } else {
                console.error('❌ Habits load failed:', habitsData.reason);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearAllData = () => {
        setTasks([]);
        setTransactions([]);
        setWallets([]);
        setSemesterConfigState(null);
        setSemester([]);
        setDebts([]);
        setNotes([]);
        setSharedExpenses([]);
        setEvents([]);
        setHabits([]);
        setTimetable([]);
        setAssignments([]);
        setExams([]);
        setDeadlines([]);
        setLoading(false);
    };

    // Task Actions
    const addTask = async (task) => {
        try {
            const newTask = await tasksAPI.create(task);
            setTasks((prev) => [newTask, ...prev]);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const toggleTask = async (id) => {
        try {
            const task = tasks.find(t => t._id === id);
            const updatedData = { 
                ...task, 
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : null
            };
            const updated = await tasksAPI.update(id, updatedData);
            setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const deleteTask = async (id) => {
        try {
            await tasksAPI.delete(id);
            setTasks((prev) => prev.filter((t) => t._id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Wallet Actions
    const addWallet = async (wallet) => {
        try {
            const newWallet = await walletsAPI.create(wallet);
            setWallets((prev) => [newWallet, ...prev]);
        } catch (error) {
            console.error('Error adding wallet:', error);
        }
    };

    const updateWallet = async (id, updates) => {
        try {
            const updated = await walletsAPI.update(id, updates);
            setWallets((prev) => prev.map((w) => (w._id === id ? updated : w)));
        } catch (error) {
            console.error('Error updating wallet:', error);
        }
    };

    const deleteWallet = async (id) => {
        try {
            await walletsAPI.delete(id);
            setWallets((prev) => prev.filter((w) => w._id !== id));
        } catch (error) {
            console.error('Error deleting wallet:', error);
        }
    };

    const transferBetweenWallets = async (fromWalletId, toWalletId, amount, description = 'Wallet Transfer') => {
        if (!fromWalletId || !toWalletId || amount <= 0) return;
        
        try {
            // Create transfer transaction
            const transferTransaction = {
                title: description,
                amount: amount,
                type: 'transfer',
                fromWalletId: fromWalletId,
                toWalletId: toWalletId,
            };
            
            const newTransaction = await transactionsAPI.create(transferTransaction);
            setTransactions((prev) => [newTransaction, ...prev]);
            
            // Update wallet balances
            const fromWallet = wallets.find(w => w._id === fromWalletId);
            const toWallet = wallets.find(w => w._id === toWalletId);
            
            await walletsAPI.update(fromWalletId, { balance: fromWallet.balance - amount });
            await walletsAPI.update(toWalletId, { balance: toWallet.balance + amount });
            
            // Refresh wallets
            const updatedWallets = await walletsAPI.getAll();
            setWallets(updatedWallets);
        } catch (error) {
            console.error('Error transferring between wallets:', error);
        }
    };

    const getWalletBalance = (walletId) => {
        const wallet = wallets.find(w => w._id === walletId);
        return wallet ? wallet.balance : 0;
    };

    // Get total balance across all wallets
    const getBalance = () => {
        return wallets.reduce((total, wallet) => total + (wallet.balance || 0), 0);
    };

    // Transaction Actions
    const addTransaction = async (transaction) => {
        try {
            const newTransaction = await transactionsAPI.create(transaction);
            setTransactions((prev) => [newTransaction, ...prev]);
            
            // Update wallet balance if wallet specified
            if (transaction.walletId) {
                const wallet = wallets.find(w => w._id === transaction.walletId);
                if (wallet) {
                    const newBalance = transaction.type === 'income' 
                        ? wallet.balance + transaction.amount
                        : wallet.balance - transaction.amount;
                    await walletsAPI.update(transaction.walletId, { balance: newBalance });
                    const updatedWallets = await walletsAPI.getAll();
                    setWallets(updatedWallets);
                }
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const deleteTransaction = async (id) => {
        try {
            const transaction = transactions.find(t => t._id === id);
            await transactionsAPI.delete(id);
            setTransactions((prev) => prev.filter((t) => t._id !== id));
            
            // Revert wallet balance if wallet specified
            if (transaction.walletId) {
                const wallet = wallets.find(w => w._id === transaction.walletId);
                if (wallet) {
                    const newBalance = transaction.type === 'income'
                        ? wallet.balance - transaction.amount
                        : wallet.balance + transaction.amount;
                    await walletsAPI.update(transaction.walletId, { balance: newBalance });
                    const updatedWallets = await walletsAPI.getAll();
                    setWallets(updatedWallets);
                }
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    // Semester Config Actions
    const setSemesterConfig = async (config) => {
        try {
            let updated;
            if (config._id) {
                // Update existing semester
                updated = await semesterAPI.updateConfig(config);
            } else {
                // Create new semester
                updated = await semesterAPI.createConfig(config);
            }
            setSemesterConfigState(updated);
            console.log('✅ Semester saved:', updated);
            return updated;
        } catch (error) {
            console.error('Error saving semester config:', error);
            throw error;
        }
    };

    // Timetable Actions
    const addTimetable = async (classData) => {
        try {
            if (!semesterConfig || !semesterConfig._id) {
                throw new Error('No active semester. Please create a semester first.');
            }
            const newClass = await timetableAPI.create({
                ...classData,
                semesterId: semesterConfig._id
            });
            setTimetable((prev) => [newClass, ...prev]);
        } catch (error) {
            console.error('Error adding class:', error);
            throw error;
        }
    };

    const deleteTimetable = async (id) => {
        try {
            await timetableAPI.delete(id);
            setTimetable((prev) => prev.filter((c) => (c._id || c.id) !== id));
        } catch (error) {
            console.error('Error deleting class:', error);
            throw error;
        }
    };

    // Assignment Actions
    const addAssignment = async (assignment) => {
        try {
            if (!semesterConfig || !semesterConfig._id) {
                throw new Error('No active semester. Please create a semester first.');
            }
            const newAssignment = await assignmentsAPI.create({
                ...assignment,
                semesterId: semesterConfig._id
            });
            setAssignments((prev) => [newAssignment, ...prev]);
        } catch (error) {
            console.error('Error adding assignment:', error);
            throw error;
        }
    };

    const updateAssignment = async (id, updates) => {
        try {
            const updated = await assignmentsAPI.update(id, updates);
            setAssignments((prev) => prev.map((a) => ((a._id || a.id) === id ? updated : a)));
        } catch (error) {
            console.error('Error updating assignment:', error);
            throw error;
        }
    };

    const deleteAssignment = async (id) => {
        try {
            await assignmentsAPI.delete(id);
            setAssignments((prev) => prev.filter((a) => (a._id || a.id) !== id));
        } catch (error) {
            console.error('Error deleting assignment:', error);
            throw error;
        }
    };

    // Exam Actions
    const addExam = async (exam) => {
        try {
            if (!semesterConfig || !semesterConfig._id) {
                throw new Error('No active semester. Please create a semester first.');
            }
            const newExam = await examsAPI.create({
                ...exam,
                semesterId: semesterConfig._id
            });
            setExams((prev) => [newExam, ...prev]);
        } catch (error) {
            console.error('Error adding exam:', error);
            throw error;
        }
    };

    const deleteExam = async (id) => {
        try {
            await examsAPI.delete(id);
            setExams((prev) => prev.filter((e) => (e._id || e.id) !== id));
        } catch (error) {
            console.error('Error deleting exam:', error);
            throw error;
        }
    };

    // Deadline Actions
    const addDeadline = async (deadline) => {
        try {
            if (!semesterConfig || !semesterConfig._id) {
                throw new Error('No active semester. Please create a semester first.');
            }
            const newDeadline = await deadlinesAPI.create({
                ...deadline,
                semesterId: semesterConfig._id
            });
            setDeadlines((prev) => [newDeadline, ...prev]);
        } catch (error) {
            console.error('Error adding deadline:', error);
            throw error;
        }
    };

    const updateDeadline = async (id, updates) => {
        try {
            const updated = await deadlinesAPI.update(id, updates);
            setDeadlines((prev) => prev.map((d) => ((d._id || d.id) === id ? updated : d)));
        } catch (error) {
            console.error('Error updating deadline:', error);
            throw error;
        }
    };

    const deleteDeadline = async (id) => {
        try {
            await deadlinesAPI.delete(id);
            setDeadlines((prev) => prev.filter((d) => (d._id || d.id) !== id));
        } catch (error) {
            console.error('Error deleting deadline:', error);
            throw error;
        }
    };

    // Debt Actions
    const addDebt = async (debt) => {
        try {
            const newDebt = await debtsAPI.create(debt);
            setDebts((prev) => [newDebt, ...prev]);
        } catch (error) {
            console.error('Error adding debt:', error);
        }
    };

    const updateDebt = async (id, updates) => {
        try {
            const updated = await debtsAPI.update(id, updates);
            setDebts((prev) => prev.map((d) => (d._id === id ? updated : d)));
        } catch (error) {
            console.error('Error updating debt:', error);
        }
    };

    const deleteDebt = async (id) => {
        try {
            await debtsAPI.delete(id);
            setDebts((prev) => prev.filter((d) => d._id !== id));
        } catch (error) {
            console.error('Error deleting debt:', error);
        }
    };

    // Note Actions
    const addNote = async (note) => {
        try {
            const newNote = await notesAPI.create(note);
            setNotes((prev) => [newNote, ...prev]);
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const updateNote = async (id, updates) => {
        try {
            const updated = await notesAPI.update(id, updates);
            setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const deleteNote = async (id) => {
        try {
            await notesAPI.delete(id);
            setNotes((prev) => prev.filter((n) => n._id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    // Shared Expense Actions
    const addSharedExpense = async (expense) => {
        try {
            const newExpense = await sharedExpensesAPI.create(expense);
            setSharedExpenses((prev) => [newExpense, ...prev]);
        } catch (error) {
            console.error('Error adding shared expense:', error);
        }
    };

    const updateSharedExpense = async (id, updates) => {
        try {
            const updated = await sharedExpensesAPI.update(id, updates);
            setSharedExpenses((prev) => prev.map((e) => (e._id === id ? updated : e)));
        } catch (error) {
            console.error('Error updating shared expense:', error);
        }
    };

    const deleteSharedExpense = async (id) => {
        try {
            await sharedExpensesAPI.delete(id);
            setSharedExpenses((prev) => prev.filter((e) => e._id !== id));
        } catch (error) {
            console.error('Error deleting shared expense:', error);
        }
    };

    // Event Actions
    const addEvent = async (event) => {
        try {
            const newEvent = await eventsAPI.create(event);
            setEvents((prev) => [newEvent, ...prev]);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const updateEvent = async (id, updates) => {
        try {
            const updated = await eventsAPI.update(id, updates);
            setEvents((prev) => prev.map((e) => (e._id === id ? updated : e)));
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const deleteEvent = async (id) => {
        try {
            await eventsAPI.delete(id);
            setEvents((prev) => prev.filter((e) => e._id !== id));
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    // Habit Actions
    const addHabit = async (habit) => {
        try {
            const newHabit = await habitsAPI.create(habit);
            setHabits((prev) => [newHabit, ...prev]);
        } catch (error) {
            console.error('Error adding habit:', error);
        }
    };

    const toggleHabitToday = async (id) => {
        try {
            const updated = await habitsAPI.toggleToday(id);
            setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    };

    const deleteHabit = async (id) => {
        try {
            await habitsAPI.delete(id);
            setHabits((prev) => prev.filter((h) => h._id !== id));
        } catch (error) {
            console.error('Error deleting habit:', error);
        }
    };

    const value = {
        // Data
        tasks,
        transactions,
        wallets,
        debts,
        semester,
        semesterConfig,
        timetable,
        assignments,
        exams,
        deadlines,
        sharedExpenses,
        notes,
        studySessions,
        habits,
        events,
        loading,
        
        // Task actions
        addTask,
        toggleTask,
        deleteTask,
        
        // Money actions
        addTransaction,
        deleteTransaction,
        
        // Wallet actions
        addWallet,
        updateWallet,
        deleteWallet,
        transferBetweenWallets,
        getWalletBalance,
        getBalance,
        
        // Debt actions
        addDebt,
        updateDebt,
        deleteDebt,
        
        // Note actions
        addNote,
        updateNote,
        deleteNote,
        
        // Shared Expense actions
        addSharedExpense,
        updateSharedExpense,
        deleteSharedExpense,
        
        // Event actions
        addEvent,
        updateEvent,
        deleteEvent,
        
        // Habit actions
        addHabit,
        toggleHabitToday,
        deleteHabit,
        
        // Semester actions
        setSemesterConfig,
        
        // Timetable actions
        addTimetable,
        deleteTimetable,
        
        // Assignment actions
        addAssignment,
        updateAssignment,
        deleteAssignment,
        
        // Exam actions
        addExam,
        deleteExam,
        
        // Deadline actions
        addDeadline,
        updateDeadline,
        deleteDeadline,
        
        // Utility
        refreshData: loadAllData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
