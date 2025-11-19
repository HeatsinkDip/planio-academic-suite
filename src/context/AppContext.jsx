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
            loadAllData();
        } else {
            // Clear data on logout
            clearAllData();
        }
    }, [isAuthenticated, currentUser]);

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
            ] = await Promise.allSettled([
                tasksAPI.getAll(),
                transactionsAPI.getAll(),
                walletsAPI.getAll(),
                semesterAPI.getConfig(),
                semesterAPI.getEvents(),
                timetableAPI.getAll(),
                assignmentsAPI.getAll(),
                examsAPI.getAll(),
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
        setTimetable([]);
        setAssignments([]);
        setExams([]);
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
            const updated = await tasksAPI.update(id, { ...task, completed: !task.completed });
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
            const updated = await semesterAPI.updateConfig(config);
            setSemesterConfigState(updated);
        } catch (error) {
            console.error('Error updating semester config:', error);
        }
    };

    // Timetable Actions
    const addTimetable = async (classData) => {
        try {
            const newClass = await timetableAPI.create(classData);
            setTimetable((prev) => [newClass, ...prev]);
        } catch (error) {
            console.error('Error adding class:', error);
        }
    };

    const deleteTimetable = async (id) => {
        try {
            await timetableAPI.delete(id);
            setTimetable((prev) => prev.filter((c) => c._id !== id));
        } catch (error) {
            console.error('Error deleting class:', error);
        }
    };

    // Assignment Actions
    const addAssignment = async (assignment) => {
        try {
            const newAssignment = await assignmentsAPI.create(assignment);
            setAssignments((prev) => [newAssignment, ...prev]);
        } catch (error) {
            console.error('Error adding assignment:', error);
        }
    };

    const updateAssignment = async (id, updates) => {
        try {
            const updated = await assignmentsAPI.update(id, updates);
            setAssignments((prev) => prev.map((a) => (a._id === id ? updated : a)));
        } catch (error) {
            console.error('Error updating assignment:', error);
        }
    };

    const deleteAssignment = async (id) => {
        try {
            await assignmentsAPI.delete(id);
            setAssignments((prev) => prev.filter((a) => a._id !== id));
        } catch (error) {
            console.error('Error deleting assignment:', error);
        }
    };

    // Exam Actions
    const addExam = async (exam) => {
        try {
            const newExam = await examsAPI.create(exam);
            setExams((prev) => [newExam, ...prev]);
        } catch (error) {
            console.error('Error adding exam:', error);
        }
    };

    const deleteExam = async (id) => {
        try {
            await examsAPI.delete(id);
            setExams((prev) => prev.filter((e) => e._id !== id));
        } catch (error) {
            console.error('Error deleting exam:', error);
        }
    };

    // Debt Actions (local storage for now)
    const addDebt = (debt) => {
        setDebts((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), ...debt }, ...prev]);
    };

    const updateDebt = (id, updates) => {
        setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    };

    const deleteDebt = (id) => {
        setDebts((prev) => prev.filter((d) => d.id !== id));
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
        
        // Utility
        refreshData: loadAllData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
