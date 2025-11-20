import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Wallet as WalletIcon, CreditCard, Building, Smartphone, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const walletIcons = {
    cash: { icon: '💵', label: 'Cash' },
    bank: { icon: '🏦', label: 'Bank Account' },
    card: { icon: '💳', label: 'Credit/Debit Card' },
    mobile: { icon: '📱', label: 'Mobile Banking' },
};

const Wallets = () => {
    const { wallets, addWallet, updateWallet, deleteWallet, transactions } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'cash',
        balance: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const walletData = {
            ...formData,
            balance: parseFloat(formData.balance) || 0,
            icon: walletIcons[formData.type].icon,
        };

        if (editingId) {
            updateWallet(editingId, walletData);
            setEditingId(null);
        } else {
            addWallet(walletData);
        }

        setFormData({ name: '', type: 'cash', balance: 0 });
        setIsAdding(false);
    };

    const handleEdit = (wallet) => {
        setFormData({
            name: wallet.name,
            type: wallet.type,
            balance: wallet.balance,
        });
        setEditingId(wallet._id || wallet.id);
        setIsAdding(true);
    };

    const getTotalBalance = () => {
        return wallets.reduce((sum, w) => sum + w.balance, 0);
    };

    const getWalletTransactions = (walletId) => {
        return transactions.filter(t => t.walletId === walletId);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 pt-12"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Wallets</h1>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setEditingId(null);
                        setFormData({ name: '', type: 'cash', balance: 0 });
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg shadow-indigo-300"
                >
                    <motion.div animate={{ rotate: isAdding ? 45 : 0 }} transition={{ duration: 0.2 }}>
                        <Plus size={24} />
                    </motion.div>
                </motion.button>
            </div>

            {/* Total Balance */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 mb-6"
            >
                <h3 className="text-sm font-medium opacity-90">Total Balance (All Wallets)</h3>
                <p className="text-5xl font-bold mt-2">${getTotalBalance().toFixed(2)}</p>
                <p className="text-sm opacity-75 mt-2">{wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}</p>
            </motion.div>

            {/* Add/Edit Wallet Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                    >
                        <h3 className="font-semibold text-slate-800 mb-4">
                            {editingId ? 'Edit Wallet' : 'Add New Wallet'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-600 mb-2 block">Wallet Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(walletIcons).map(([type, { icon, label }]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`p-3 rounded-xl border-2 transition-all ${formData.type === type
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{icon}</div>
                                            <div className="text-xs font-medium text-slate-700">{label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-slate-600 mb-2 block">Wallet Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., bKash, DBL Credit Card"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-sm text-slate-600 mb-2 block">Initial Balance</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-md"
                            >
                                {editingId ? 'Update Wallet' : 'Add Wallet'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Wallet List */}
            <div className="space-y-4">
                {wallets.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <WalletIcon size={48} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-lg">No wallets yet</p>
                        <p className="text-sm mt-2">Add your first wallet to start tracking!</p>
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
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">{wallet.icon}</div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{wallet.name}</h3>
                                            <p className="text-xs text-slate-500 capitalize">{walletIcons[wallet.type]?.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(wallet)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Delete ${wallet.name}?`)) {
                                                    deleteWallet(walletId);
                                                }
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div>
                                        <div className="text-sm text-slate-500">Balance</div>
                                        <div className="text-2xl font-bold text-slate-800">${wallet.balance.toFixed(2)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500">Transactions</div>
                                        <div className="text-lg font-semibold text-slate-600">{txCount}</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};

export default Wallets;
