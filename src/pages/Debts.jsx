import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, User, Calendar, DollarSign, Bell, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, differenceInDays } from 'date-fns';

const Debts = () => {
    const { debts, addDebt, updateDebt, deleteDebt, markDebtPaid } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [paymentModal, setPaymentModal] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [newDebt, setNewDebt] = useState({
        type: 'lent', // lent (you gave) or borrowed (you owe)
        person: '',
        amount: '',
        loanDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newDebt.person.trim() || !newDebt.amount) return;
        
        addDebt({
            ...newDebt,
            amount: parseFloat(newDebt.amount),
        });
        setNewDebt({
            type: 'lent',
            person: '',
            amount: '',
            loanDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            description: '',
        });
        setIsAdding(false);
    };

    const handlePayment = (debtId) => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
        markDebtPaid(debtId, parseFloat(paymentAmount));
        setPaymentModal(null);
        setPaymentAmount('');
    };

    const sendReminder = (debt) => {
        // Create a mailto link with pre-filled reminder message
        const subject = `Reminder: Loan Payment Due`;
        const body = `Hi ${debt.person},\n\nThis is a friendly reminder about the loan of $${debt.amount.toFixed(2)} that was provided on ${format(new Date(debt.loanDate), 'MMM d, yyyy')}.\n\n${debt.dueDate ? `The promised return date is ${format(new Date(debt.dueDate), 'MMM d, yyyy')}.\n\n` : ''}${debt.description ? `Note: ${debt.description}\n\n` : ''}Please let me know if you need any clarification.\n\nThank you!`;
        
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const getDaysOverdue = (dueDate) => {
        if (!dueDate) return null;
        const days = differenceInDays(new Date(), new Date(dueDate));
        return days > 0 ? days : null;
    };

    const lentDebts = debts.filter(d => d.type === 'lent');
    const borrowedDebts = debts.filter(d => d.type === 'borrowed');

    const totalLent = lentDebts.reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);
    const totalBorrowed = borrowedDebts.reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 pt-12 pb-24"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Debts & Loans</h1>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg shadow-indigo-300"
                >
                    <motion.div animate={{ rotate: isAdding ? 45 : 0 }} transition={{ duration: 0.2 }}>
                        <Plus size={24} />
                    </motion.div>
                </motion.button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl text-white shadow-lg"
                >
                    <h3 className="text-sm font-medium opacity-90">Money Lent</h3>
                    <p className="text-3xl font-bold mt-2">${totalLent.toFixed(2)}</p>
                    <p className="text-xs opacity-75 mt-1">{lentDebts.length} active loans</p>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-2xl text-white shadow-lg"
                >
                    <h3 className="text-sm font-medium opacity-90">Money Owed</h3>
                    <p className="text-3xl font-bold mt-2">${totalBorrowed.toFixed(2)}</p>
                    <p className="text-xs opacity-75 mt-1">{borrowedDebts.length} active debts</p>
                </motion.div>
            </div>

            {/* Add Debt Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                    >
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setNewDebt({ ...newDebt, type: 'lent' })}
                                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                                    newDebt.type === 'lent'
                                        ? 'bg-green-100 text-green-600 shadow-sm'
                                        : 'bg-gray-50 text-gray-400'
                                }`}
                            >
                                I Lent Money
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewDebt({ ...newDebt, type: 'borrowed' })}
                                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                                    newDebt.type === 'borrowed'
                                        ? 'bg-red-100 text-red-600 shadow-sm'
                                        : 'bg-gray-50 text-gray-400'
                                }`}
                            >
                                I Borrowed Money
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <User className="inline w-4 h-4 mr-1" />
                                    Person's Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={newDebt.person}
                                    onChange={(e) => setNewDebt({ ...newDebt, person: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <DollarSign className="inline w-4 h-4 mr-1" />
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={newDebt.amount}
                                    onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Loan Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newDebt.loanDate}
                                        onChange={(e) => setNewDebt({ ...newDebt, loanDate: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Due Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={newDebt.dueDate}
                                        onChange={(e) => setNewDebt({ ...newDebt, dueDate: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    placeholder="Purpose or notes..."
                                    value={newDebt.description}
                                    onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-indigo-200 hover:shadow-lg transition-shadow mt-4"
                        >
                            Add Record
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Lent Money Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Money I Lent ({lentDebts.length})
                </h2>
                <div className="space-y-3">
                    {lentDebts.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No records of money lent.</p>
                        </div>
                    ) : (
                        lentDebts.map((debt) => {
                            const remaining = debt.amount - (debt.paidAmount || 0);
                            const daysOverdue = getDaysOverdue(debt.dueDate);
                            
                            return (
                                <motion.div
                                    key={debt.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`bg-white p-4 rounded-2xl border shadow-sm ${
                                        debt.status === 'paid' ? 'border-green-200 bg-green-50' : 'border-gray-100'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800">{debt.person}</h3>
                                                {debt.status === 'paid' && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                        Paid
                                                    </span>
                                                )}
                                                {debt.status === 'partial' && (
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                                                        Partial
                                                    </span>
                                                )}
                                                {daysOverdue && debt.status !== 'paid' && (
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                                        {daysOverdue}d overdue
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                <Calendar className="inline w-3 h-3 mr-1" />
                                                Lent: {format(new Date(debt.loanDate), 'MMM d, yyyy')}
                                                {debt.dueDate && ` • Due: ${format(new Date(debt.dueDate), 'MMM d, yyyy')}`}
                                            </p>
                                            {debt.description && (
                                                <p className="text-sm text-slate-600 mt-2">{debt.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteDebt(debt.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">${remaining.toFixed(2)}</p>
                                            {debt.paidAmount > 0 && (
                                                <p className="text-xs text-slate-500">
                                                    ${debt.paidAmount.toFixed(2)} paid of ${debt.amount.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {debt.status !== 'paid' && (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => sendReminder(debt)}
                                                        className="bg-blue-100 text-blue-600 px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <Bell size={14} />
                                                        Remind
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setPaymentModal(debt._id || debt.id)}
                                                        className="bg-green-100 text-green-600 px-3 py-2 rounded-xl text-sm font-medium"
                                                    >
                                                        Mark Paid
                                                    </motion.button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Borrowed Money Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Money I Borrowed ({borrowedDebts.length})
                </h2>
                <div className="space-y-3">
                    {borrowedDebts.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No records of money borrowed.</p>
                        </div>
                    ) : (
                        borrowedDebts.map((debt) => {
                            const remaining = debt.amount - (debt.paidAmount || 0);
                            const daysOverdue = getDaysOverdue(debt.dueDate);
                            
                            return (
                                <motion.div
                                    key={debt.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`bg-white p-4 rounded-2xl border shadow-sm ${
                                        debt.status === 'paid' ? 'border-green-200 bg-green-50' : 'border-gray-100'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800">{debt.person}</h3>
                                                {debt.status === 'paid' && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                        Paid
                                                    </span>
                                                )}
                                                {debt.status === 'partial' && (
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                                                        Partial
                                                    </span>
                                                )}
                                                {daysOverdue && debt.status !== 'paid' && (
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                                        {daysOverdue}d overdue
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                <Calendar className="inline w-3 h-3 mr-1" />
                                                Borrowed: {format(new Date(debt.loanDate), 'MMM d, yyyy')}
                                                {debt.dueDate && ` • Due: ${format(new Date(debt.dueDate), 'MMM d, yyyy')}`}
                                            </p>
                                            {debt.description && (
                                                <p className="text-sm text-slate-600 mt-2">{debt.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteDebt(debt.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-red-600">${remaining.toFixed(2)}</p>
                                            {debt.paidAmount > 0 && (
                                                <p className="text-xs text-slate-500">
                                                    ${debt.paidAmount.toFixed(2)} paid of ${debt.amount.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        {debt.status !== 'paid' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setPaymentModal(debt.id)}
                                                className="bg-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-medium"
                                            >
                                                Mark Paid
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {paymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setPaymentModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-sm w-full"
                        >
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Record Payment</h3>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Payment amount"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPaymentModal(null)}
                                    className="flex-1 bg-gray-100 text-slate-700 py-3 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handlePayment(paymentModal)}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Debts;
