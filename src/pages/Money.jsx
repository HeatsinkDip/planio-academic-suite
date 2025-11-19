import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const Money = () => {
    const { transactions, addTransaction, deleteTransaction, getBalance, wallets, transferBetweenWallets } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        title: '',
        amount: '',
        type: 'expense',
        walletId: null,
    });
    const [transferData, setTransferData] = useState({
        fromWalletId: null,
        toWalletId: null,
        amount: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTransaction.title.trim() || !newTransaction.amount) return;
        addTransaction({
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
        });
        setNewTransaction({ title: '', amount: '', type: 'expense', walletId: null });
        setIsAdding(false);
    };

    const handleTransfer = (e) => {
        e.preventDefault();
        if (!transferData.fromWalletId || !transferData.toWalletId || !transferData.amount) return;
        if (transferData.fromWalletId === transferData.toWalletId) {
            alert('Cannot transfer to the same wallet!');
            return;
        }
        
        transferBetweenWallets(
            transferData.fromWalletId,
            transferData.toWalletId,
            parseFloat(transferData.amount),
            transferData.description || 'Wallet Transfer'
        );
        
        setTransferData({
            fromWalletId: null,
            toWalletId: null,
            amount: '',
            description: '',
        });
        setShowTransfer(false);
    };

    const balance = getBalance();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-3"
        >
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-bold text-slate-800">Wallet</h1>
                <div className="flex gap-2">
                    {wallets.length >= 2 && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setShowTransfer(!showTransfer);
                                setIsAdding(false);
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg text-[10px] font-semibold flex items-center gap-1.5"
                        >
                            <TrendingUp size={18} />
                            Transfer
                        </motion.button>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setIsAdding(!isAdding);
                            setShowTransfer(false);
                        }}
                        className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-full shadow-lg"
                    >
                        <motion.div
                            animate={{ rotate: isAdding ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Plus size={18} />
                        </motion.div>
                    </motion.button>
                </div>
            </div>

            <motion.div
                className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 rounded-xl text-white shadow-lg mb-3"
            >
                <div className="flex items-center gap-1.5 mb-1">
                    <Wallet size={14} className="opacity-90" />
                    <h3 className="text-[10px] font-medium opacity-90">Total Balance</h3>
                </div>
                <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
            </motion.div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 12 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white p-3 rounded-xl border border-gray-100 overflow-hidden"
                    >
                        <div className="flex gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${newTransaction.type === 'expense'
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-gray-50 text-gray-400'
                                    }`}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${newTransaction.type === 'income'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-50 text-gray-400'
                                    }`}
                            >
                                Income
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Description"
                            value={newTransaction.title}
                            onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
                            className="w-full text-sm font-medium placeholder:text-gray-400 border-b border-gray-200 focus:border-indigo-600 focus:ring-0 p-2 mb-3 outline-none"
                            autoFocus
                        />

                        <div className="relative mb-3">
                            <DollarSign size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newTransaction.amount}
                                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                className="w-full text-lg font-bold placeholder:text-gray-300 border-b border-gray-200 focus:border-indigo-600 focus:ring-0 pl-7 p-2 outline-none"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">Wallet</label>
                            <select
                                value={newTransaction.walletId || ''}
                                onChange={(e) => setNewTransaction({ ...newTransaction, walletId: parseInt(e.target.value) || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            >
                                <option value="">Select a wallet (optional)</option>
                                {wallets.map((wallet) => (
                                    <option key={wallet.id} value={wallet.id}>
                                        {wallet.icon} {wallet.name} (${wallet.balance.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg text-xs font-semibold"
                        >
                            Add Transaction
                        </button>
                    </motion.form>
                )}

                {showTransfer && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 12 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleTransfer}
                        className="bg-white p-3 rounded-xl border border-gray-100 overflow-hidden"
                    >
                        <h3 className="text-xs font-bold text-slate-800 mb-3">Transfer Between Wallets</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">From Wallet</label>
                                <select
                                    value={transferData.fromWalletId || ''}
                                    onChange={(e) => setTransferData({ ...transferData, fromWalletId: parseInt(e.target.value) })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    required
                                >
                                    <option value="">Select source wallet</option>
                                    {wallets.map((wallet) => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {wallet.icon} {wallet.name} (${wallet.balance.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">To Wallet</label>
                                <select
                                    value={transferData.toWalletId || ''}
                                    onChange={(e) => setTransferData({ ...transferData, toWalletId: parseInt(e.target.value) })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    required
                                >
                                    <option value="">Select destination wallet</option>
                                    {wallets.map((wallet) => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {wallet.icon} {wallet.name} (${wallet.balance.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={transferData.amount}
                                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">Description (optional)</label>
                                <input
                                    type="text"
                                    value={transferData.description}
                                    onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    placeholder="Wallet Transfer"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-semibold"
                            >
                                Transfer Funds
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <h3 className="text-xs font-bold text-slate-800 mb-2">Recent Transactions</h3>
            <div className="space-y-1.5">
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">No transactions yet.</p>
                        <p className="text-xs mt-1">Start tracking your money! 💰</p>
                    </div>
                ) : (
                    transactions.map((t) => {
                        const wallet = wallets.find(w => w.id === t.walletId);
                        return (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className={`p-1.5 rounded-full shrink-0 ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-xs text-slate-800 truncate">{t.title}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {format(new Date(t.date), 'MMM d, h:mm a')}
                                            {wallet && ` • ${wallet.icon} ${wallet.name}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-slate-800'
                                        }`}>
                                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-0.5"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};

export default Money;
