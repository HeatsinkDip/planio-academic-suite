import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingUp, TrendingDown, DollarSign, Wallet as WalletIcon, Pencil, Trash2, Search, Filter, Download, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, startOfToday, startOfMonth, endOfDay } from 'date-fns';

const Money = () => {
    const { transactions, addTransaction, deleteTransaction, getBalance, wallets, transferBetweenWallets, addWallet, updateWallet, deleteWallet } = useApp();
    const [activeView, setActiveView] = useState('transactions'); // transactions, wallets, history
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
    
    // Wallet management states
    const [isAddingWallet, setIsAddingWallet] = useState(false);
    const [editingWalletId, setEditingWalletId] = useState(null);
    const [walletFormData, setWalletFormData] = useState({
        name: '',
        type: 'cash',
        balance: 0,
    });
    
    // Transaction history states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

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
    
    // Wallet helper functions
    const walletIcons = {
        cash: { icon: '💵', label: 'Cash' },
        bank: { icon: '🏦', label: 'Bank Account' },
        card: { icon: '💳', label: 'Credit/Debit Card' },
        mobile: { icon: '📱', label: 'Mobile Banking' },
    };

    const handleWalletSubmit = (e) => {
        e.preventDefault();
        if (!walletFormData.name.trim()) return;

        const walletData = {
            ...walletFormData,
            balance: parseFloat(walletFormData.balance) || 0,
            icon: walletIcons[walletFormData.type].icon,
        };

        if (editingWalletId) {
            updateWallet(editingWalletId, walletData);
            setEditingWalletId(null);
        } else {
            addWallet(walletData);
        }

        setWalletFormData({ name: '', type: 'cash', balance: 0 });
        setIsAddingWallet(false);
    };

    const handleEditWallet = (wallet) => {
        setWalletFormData({
            name: wallet.name,
            type: wallet.type,
            balance: wallet.balance,
        });
        setEditingWalletId(wallet._id || wallet.id);
        setIsAddingWallet(true);
    };

    const getTotalBalance = () => {
        return wallets.reduce((sum, w) => sum + w.balance, 0);
    };

    const getWalletTransactions = (walletId) => {
        return transactions.filter(t => t.walletId === walletId);
    };

    // Transaction history helper functions
    const setQuickDate = (range) => {
        const today = startOfToday();
        switch (range) {
            case 'today':
                setDateRange({ start: format(today, 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') });
                break;
            case 'thisMonth':
                setDateRange({ start: format(startOfMonth(today), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') });
                break;
            case 'all':
            default:
                setDateRange({ start: '', end: '' });
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;
            const tDate = new Date(t.date);
            
            const matchesDateRange = !dateRange.start || !dateRange.end ||
                (tDate >= new Date(dateRange.start) && tDate <= endOfDay(new Date(dateRange.end)));
            
            return matchesSearch && matchesType && matchesDateRange;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, searchTerm, filterType, dateRange]);

    const stats = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amount;
            } else {
                acc.expense += t.amount;
            }
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredTransactions]);

    const exportToCSV = () => {
        const csvContent = [
            ['Date', 'Title', 'Type', 'Amount'],
            ...filteredTransactions.map(t => [
                format(new Date(t.date), 'yyyy-MM-dd HH:mm'),
                t.title,
                t.type,
                t.amount.toFixed(2)
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-3"
        >
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-bold text-slate-800">Money</h1>
                <div className="flex gap-2">
                    {activeView === 'transactions' && wallets.length >= 2 && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setShowTransfer(!showTransfer);
                                setIsAdding(false);
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg text-[10px] font-semibold flex items-center gap-1.5"
                        >
                            <TrendingUp size={14} />
                            Transfer
                        </motion.button>
                    )}
                    {activeView === 'transactions' && (
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
                                <Plus size={16} />
                            </motion.div>
                        </motion.button>
                    )}
                    {activeView === 'wallets' && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIsAddingWallet(!isAddingWallet);
                                setEditingWalletId(null);
                                setWalletFormData({ name: '', type: 'cash', balance: 0 });
                            }}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-full shadow-lg"
                        >
                            <motion.div animate={{ rotate: isAddingWallet ? 45 : 0 }} transition={{ duration: 0.2 }}>
                                <Plus size={16} />
                            </motion.div>
                        </motion.button>
                    )}
                    {activeView === 'history' && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={exportToCSV}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg text-[10px] font-semibold flex items-center gap-1.5"
                        >
                            <Download size={14} />
                            Export
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('transactions')}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all text-xs ${
                        activeView === 'transactions'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-white text-slate-600 border border-gray-100'
                    }`}
                >
                    <DollarSign size={16} />
                    <span className="font-semibold">Transactions</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('wallets')}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all text-xs ${
                        activeView === 'wallets'
                            ? 'bg-teal-500 text-white shadow-lg'
                            : 'bg-white text-slate-600 border border-gray-100'
                    }`}
                >
                    <WalletIcon size={16} />
                    <span className="font-semibold">Wallets</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('history')}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all text-xs ${
                        activeView === 'history'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white text-slate-600 border border-gray-100'
                    }`}
                >
                    <TrendingUp size={16} />
                    <span className="font-semibold">History</span>
                </motion.button>
            </div>

            {/* Balance Card - Show on all views */}
            <motion.div
                className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 rounded-xl text-white shadow-lg mb-3"
            >
                <div className="flex items-center gap-1.5 mb-1">
                    <WalletIcon size={14} className="opacity-90" />
                    <h3 className="text-[10px] font-medium opacity-90">Total Balance</h3>
                </div>
                <p className="text-2xl font-bold">${getTotalBalance().toFixed(2)}</p>
            </motion.div>

            {/* TRANSACTIONS VIEW */}
            {activeView === 'transactions' && (
            <>
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
                                onChange={(e) => setNewTransaction({ ...newTransaction, walletId: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            >
                                <option value="">Select a wallet (optional)</option>
                                {wallets.map((wallet) => (
                                    <option key={wallet._id || wallet.id} value={wallet._id || wallet.id}>
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
                                    onChange={(e) => setTransferData({ ...transferData, fromWalletId: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    required
                                >
                                    <option value="">Select source wallet</option>
                                    {wallets.map((wallet) => (
                                        <option key={wallet._id || wallet.id} value={wallet._id || wallet.id}>
                                            {wallet.icon} {wallet.name} (${wallet.balance.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">To Wallet</label>
                                <select
                                    value={transferData.toWalletId || ''}
                                    onChange={(e) => setTransferData({ ...transferData, toWalletId: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    required
                                >
                                    <option value="">Select destination wallet</option>
                                    {wallets.map((wallet) => (
                                        <option key={wallet._id || wallet.id} value={wallet._id || wallet.id}>
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
            </>
            )}

            {/* WALLETS VIEW */}
            {activeView === 'wallets' && (
            <>
            <AnimatePresence>
                {isAddingWallet && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 12 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleWalletSubmit}
                        className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <h3 className="text-xs font-semibold text-slate-800 mb-3">
                            {editingWalletId ? 'Edit Wallet' : 'Add New Wallet'}
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] text-slate-600 mb-1.5 block">Wallet Type</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {Object.entries(walletIcons).map(([type, { icon, label }]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setWalletFormData({ ...walletFormData, type })}
                                            className={`p-2 rounded-lg border-2 transition-all text-xs ${walletFormData.type === type
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-xl mb-0.5">{icon}</div>
                                            <div className="text-[9px] font-medium text-slate-700">{label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-600 mb-1.5 block">Wallet Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., bKash, DBL Credit Card"
                                    value={walletFormData.name}
                                    onChange={(e) => setWalletFormData({ ...walletFormData, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-600 mb-1.5 block">Initial Balance</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={walletFormData.balance}
                                    onChange={(e) => setWalletFormData({ ...walletFormData, balance: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-xs shadow-sm"
                            >
                                {editingWalletId ? 'Update Wallet' : 'Add Wallet'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {wallets.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <WalletIcon size={40} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No wallets yet</p>
                        <p className="text-xs mt-1">Add your first wallet to start tracking!</p>
                    </div>
                ) : (
                    wallets.map((wallet) => {
                        const walletId = wallet._id || wallet.id;
                        const txCount = getWalletTransactions(walletId).length;
                        return (
                            <motion.div
                                key={walletId}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-2xl">{wallet.icon}</div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-800">{wallet.name}</h3>
                                            <p className="text-[9px] text-slate-500 capitalize">{walletIcons[wallet.type]?.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEditWallet(wallet)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Delete ${wallet.name}?`)) {
                                                    deleteWallet(walletId);
                                                }
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <div>
                                        <div className="text-[9px] text-slate-500">Balance</div>
                                        <div className="text-lg font-bold text-slate-800">${wallet.balance.toFixed(2)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] text-slate-500">Transactions</div>
                                        <div className="text-sm font-semibold text-slate-600">{txCount}</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
            </>
            )}

            {/* HISTORY VIEW */}
            {activeView === 'history' && (
            <>
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-[10px] opacity-90">Income</span>
                    </div>
                    <div className="text-xl font-bold">${stats.income.toFixed(2)}</div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingDown size={16} />
                        <span className="text-[10px] opacity-90">Expense</span>
                    </div>
                    <div className="text-xl font-bold">${stats.expense.toFixed(2)}</div>
                </div>
            </div>

            <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-100 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                    <Filter size={14} className="text-slate-600" />
                    <span className="text-xs font-medium text-slate-800">Filters</span>
                </div>

                <div className="space-y-2">
                    <div>
                        <label className="text-[9px] text-slate-600 mb-1 block">Type</label>
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'income', label: 'Income' },
                                { value: 'expense', label: 'Expense' }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setFilterType(type.value)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${filterType === type.value
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] text-slate-600 mb-1 block">Quick Date</label>
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all', label: 'All Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'thisMonth', label: 'This Month' }
                            ].map((quick) => (
                                <button
                                    key={quick.value}
                                    onClick={() => setQuickDate(quick.value)}
                                    className="px-2 py-1.5 rounded-lg text-[10px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    {quick.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] text-slate-600 mb-1 block">Custom Range</label>
                        <div className="grid grid-cols-2 gap-1.5">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-slate-800">
                        {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Transaction' : 'Transactions'}
                    </h3>
                    {(searchTerm || filterType !== 'all' || dateRange.start) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
                                setDateRange({ start: '', end: '' });
                            }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-700"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Calendar size={40} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">No transactions found</p>
                            <p className="text-xs mt-1">Try adjusting your filters</p>
                        </div>
                    ) : (
                        filteredTransactions.map((t) => (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className={`p-1.5 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-800 truncate">{t.title}</p>
                                        <p className="text-[9px] text-slate-500">{format(new Date(t.date), 'MMM d, yyyy - h:mm a')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
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
                        ))
                    )}
                </div>
            </div>
            </>
            )}
        </motion.div>
    );
};

export default Money;
