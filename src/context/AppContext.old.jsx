import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const userKey = currentUser ? `user_${currentUser.id}` : 'guest';
    
    const [tasks, setTasks] = useLocalStorage(`${userKey}_tasks`, []);
    const [transactions, setTransactions] = useLocalStorage(`${userKey}_transactions`, []);
    const [wallets, setWallets] = useLocalStorage(`${userKey}_wallets`, [
        { id: 1, name: 'Cash', type: 'cash', balance: 0, icon: '💵' },
        { id: 2, name: 'Bank Account', type: 'bank', balance: 0, icon: '🏦' },
        { id: 3, name: 'Credit Card', type: 'card', balance: 0, icon: '💳' },
        { id: 4, name: 'Mobile Banking', type: 'mobile', balance: 0, icon: '📱' },
    ]);
    const [debts, setDebts] = useLocalStorage(`${userKey}_debts`, []);
    const [semester, setSemester] = useLocalStorage(`${userKey}_semester`, []);
    const [semesterConfig, setSemesterConfig] = useLocalStorage(`${userKey}_semesterConfig`, null);
    const [timetable, setTimetable] = useLocalStorage(`${userKey}_timetable`, []);
    const [assignments, setAssignments] = useLocalStorage(`${userKey}_assignments`, []);
    const [exams, setExams] = useLocalStorage(`${userKey}_exams`, []);
    const [sharedExpenses, setSharedExpenses] = useLocalStorage(`${userKey}_sharedExpenses`, []);
    const [notes, setNotes] = useLocalStorage(`${userKey}_notes`, []);
    const [studySessions, setStudySessions] = useLocalStorage(`${userKey}_studySessions`, []);
    const [habits, setHabits] = useLocalStorage(`${userKey}_habits`, []);
    const [events, setEvents] = useLocalStorage(`${userKey}_events`, []);

    // Task Actions
    const addTask = (task) => {
        setTasks((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), completed: false, ...task }, ...prev]);
    };

    const toggleTask = (id) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    // Wallet Actions
    const addWallet = (wallet) => {
        setWallets((prev) => [{ id: Date.now(), balance: 0, ...wallet }, ...prev]);
    };

    const updateWallet = (id, updates) => {
        setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    };

    const deleteWallet = (id) => {
        setWallets((prev) => prev.filter((w) => w.id !== id));
    };

    const transferBetweenWallets = (fromWalletId, toWalletId, amount, description = 'Wallet Transfer') => {
        if (!fromWalletId || !toWalletId || amount <= 0) return;
        
        // Create transfer transaction record
        const transferTransaction = {
            id: Date.now(),
            title: description,
            amount: amount,
            type: 'transfer',
            fromWalletId: fromWalletId,
            toWalletId: toWalletId,
            date: new Date().toISOString(),
        };
        
        setTransactions((prev) => [transferTransaction, ...prev]);
        
        // Update both wallet balances
        setWallets((prev) =>
            prev.map((w) => {
                if (w.id === fromWalletId) {
                    return { ...w, balance: w.balance - amount };
                }
                if (w.id === toWalletId) {
                    return { ...w, balance: w.balance + amount };
                }
                return w;
            })
        );
    };

    const getWalletBalance = (walletId) => {
        const wallet = wallets.find(w => w.id === walletId);
        return wallet ? wallet.balance : 0;
    };

    // Money Actions (with wallet support)
    const addTransaction = (transaction) => {
        const newTransaction = { id: Date.now(), date: new Date().toISOString(), ...transaction };
        setTransactions((prev) => [newTransaction, ...prev]);

        // Update wallet balance if wallet is specified
        if (transaction.walletId) {
            setWallets((prev) =>
                prev.map((w) => {
                    if (w.id === transaction.walletId) {
                        const change = transaction.type === 'income' ? transaction.amount : -transaction.amount;
                        return { ...w, balance: w.balance + change };
                    }
                    return w;
                })
            );
        }
    };

    const deleteTransaction = (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (transaction && transaction.walletId) {
            // Reverse the wallet balance change
            setWallets((prev) =>
                prev.map((w) => {
                    if (w.id === transaction.walletId) {
                        const change = transaction.type === 'income' ? -transaction.amount : transaction.amount;
                        return { ...w, balance: w.balance + change };
                    }
                    return w;
                })
            );
        }
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    };

    const getBalance = () => {
        return wallets.reduce((total, wallet) => total + wallet.balance, 0);
    };

    // Debt Actions
    const addDebt = (debt) => {
        setDebts((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), status: 'pending', ...debt }, ...prev]);
    };

    const updateDebt = (id, updates) => {
        setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    };

    const deleteDebt = (id) => {
        setDebts((prev) => prev.filter((d) => d.id !== id));
    };

    const markDebtPaid = (id, amountPaid) => {
        setDebts((prev) =>
            prev.map((d) => {
                if (d.id === id) {
                    const totalPaid = (d.paidAmount || 0) + amountPaid;
                    const status = totalPaid >= d.amount ? 'paid' : 'partial';
                    return { ...d, paidAmount: totalPaid, status, lastPaymentDate: new Date().toISOString() };
                }
                return d;
            })
        );
    };

    // Semester Actions
    const addSemesterEvent = (event) => {
        setSemester((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), ...event }, ...prev]);
    };

    const updateSemesterEvent = (id, updates) => {
        setSemester((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    };

    const deleteSemesterEvent = (id) => {
        setSemester((prev) => prev.filter((e) => e.id !== id));
    };

    // Semester Configuration Actions
    const updateSemesterConfig = (config) => {
        setSemesterConfig(config);
    };

    const deleteSemesterConfig = () => {
        setSemesterConfig(null);
    };

    // Timetable Actions
    const addTimetableClass = (classItem) => {
        setTimetable((prev) => [{ id: Date.now() + Math.random(), ...classItem }, ...prev]);
    };

    const addMultipleTimetableClasses = (classItems) => {
        setTimetable((prev) => {
            const newClasses = classItems.map((classItem, index) => ({
                id: Date.now() + index,
                ...classItem
            }));
            return [...newClasses, ...prev];
        });
    };

    const updateTimetableClass = (id, updates) => {
        setTimetable((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    };

    const deleteTimetableClass = (id) => {
        setTimetable((prev) => prev.filter((c) => c.id !== id));
    };

    // Assignment Actions
    const addAssignment = (assignment) => {
        setAssignments((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), completed: false, ...assignment }, ...prev]);
    };

    const updateAssignment = (id, updates) => {
        setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    };

    const deleteAssignment = (id) => {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
    };

    const toggleAssignmentComplete = (id) => {
        setAssignments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
        );
    };

    // Exam Actions
    const addExam = (exam) => {
        setExams((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), ...exam }, ...prev]);
    };

    const updateExam = (id, updates) => {
        setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    };

    const deleteExam = (id) => {
        setExams((prev) => prev.filter((e) => e.id !== id));
    };

    // Shared Expenses Actions
    const addSharedExpense = (expense) => {
        setSharedExpenses((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), ...expense }, ...prev]);
    };

    const updateSharedExpense = (id, updates) => {
        setSharedExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    };

    const deleteSharedExpense = (id) => {
        setSharedExpenses((prev) => prev.filter((e) => e.id !== id));
    };

    // Notes Actions
    const addNote = (note) => {
        setNotes((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), ...note }, ...prev]);
    };

    const updateNote = (id, updates) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    };

    const deleteNote = (id) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    // Study Sessions Actions
    const addStudySession = (session) => {
        setStudySessions((prev) => [{ id: Date.now(), ...session }, ...prev]);
    };

    const updateStudySession = (id, updates) => {
        setStudySessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    };

    // Habits Actions
    const addHabit = (habit) => {
        setHabits((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), streak: 0, ...habit }, ...prev]);
    };

    const toggleHabitToday = (id) => {
        const today = new Date().toDateString();
        setHabits((prev) =>
            prev.map((h) => {
                if (h.id === id) {
                    const completedDates = h.completedDates || [];
                    const isCompletedToday = completedDates.includes(today);
                    
                    if (isCompletedToday) {
                        return {
                            ...h,
                            completedDates: completedDates.filter(d => d !== today),
                            streak: Math.max(0, h.streak - 1),
                        };
                    } else {
                        return {
                            ...h,
                            completedDates: [...completedDates, today],
                            streak: h.streak + 1,
                            lastCompleted: today,
                        };
                    }
                }
                return h;
            })
        );
    };

    const deleteHabit = (id) => {
        setHabits((prev) => prev.filter((h) => h.id !== id));
    };

    // Events Actions
    const addEvent = (event) => {
        setEvents((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), ...event }, ...prev]);
    };

    const updateEvent = (id, updates) => {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    };

    const deleteEvent = (id) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
    };

    const value = {
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        transactions,
        addTransaction,
        deleteTransaction,
        getBalance,
        wallets,
        addWallet,
        updateWallet,
        deleteWallet,
        transferBetweenWallets,
        getWalletBalance,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        markDebtPaid,
        semester,
        addSemesterEvent,
        updateSemesterEvent,
        deleteSemesterEvent,
        semesterConfig,
        updateSemesterConfig,
        deleteSemesterConfig,
        timetable,
        addTimetableClass,
        addMultipleTimetableClasses,
        updateTimetableClass,
        deleteTimetableClass,
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        toggleAssignmentComplete,
        exams,
        addExam,
        updateExam,
        deleteExam,
        sharedExpenses,
        addSharedExpense,
        updateSharedExpense,
        deleteSharedExpense,
        notes,
        addNote,
        updateNote,
        deleteNote,
        studySessions,
        addStudySession,
        updateStudySession,
        habits,
        addHabit,
        toggleHabitToday,
        deleteHabit,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
