import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Profile = () => {
    const { currentUser, updateProfile, logout } = useAuth();
    const { tasks, transactions, debts } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
    });

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: currentUser?.name || '',
            email: currentUser?.email || '',
        });
        setIsEditing(false);
    };

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 pt-12 pb-24"
        >
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Profile</h1>

            {/* Profile Card */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 mb-6"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                        {currentUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/60 outline-none"
                                placeholder="Your name"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                        )}
                        {isEditing ? (
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/60 outline-none mt-2"
                                placeholder="Your email"
                            />
                        ) : (
                            <p className="opacity-90 text-sm">{currentUser?.email}</p>
                        )}
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <Edit2 size={20} />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors"
                            >
                                <Save size={20} />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-sm opacity-75">
                    {currentUser?.createdAt 
                        ? `Member since ${new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                        : 'Welcome to Planio!'}
                </p>
            </motion.div>

            {/* Statistics */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Your Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="text-2xl font-bold text-indigo-600">{tasks.length}</div>
                        <div className="text-xs text-slate-500 mt-1">Total Tasks</div>
                        <div className="text-xs text-slate-400 mt-1">{completedTasks} completed</div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="text-2xl font-bold text-purple-600">{transactions.length}</div>
                        <div className="text-xs text-slate-500 mt-1">Transactions</div>
                        <div className="text-xs text-slate-400 mt-1">${Math.abs(totalIncome - totalExpense).toFixed(0)}</div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(0)}</div>
                        <div className="text-xs text-slate-500 mt-1">Total Income</div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="text-2xl font-bold text-red-600">${totalExpense.toFixed(0)}</div>
                        <div className="text-xs text-slate-500 mt-1">Total Expenses</div>
                    </motion.div>
                </div>
            </div>

            {/* Debt Summary */}
            {debts.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Debt Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                        >
                            <div className="text-2xl font-bold text-green-600">
                                {debts.filter(d => d.type === 'lent').length}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Money Lent</div>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                        >
                            <div className="text-2xl font-bold text-red-600">
                                {debts.filter(d => d.type === 'borrowed').length}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Money Borrowed</div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="w-full bg-red-500 text-white py-4 rounded-2xl font-medium shadow-md shadow-red-200 hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                    <LogOut size={20} />
                    Sign Out
                </motion.button>
            </div>
        </motion.div>
    );
};

export default Profile;
