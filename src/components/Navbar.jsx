import React, { useState } from 'react';
import { Home, CheckSquare, Wallet, Grid, User, Settings, GraduationCap, Clock, Users, BookOpen, Target, Sparkles, DollarSign, X, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ activeTab, setActiveTab }) => {
    const [showMoreServices, setShowMoreServices] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const { isDarkMode, toggleDarkMode } = useTheme();

    const mainTabs = [
        { id: 'dashboard', icon: Home, label: 'Overview' },
        { id: 'semester', icon: GraduationCap, label: 'Semester' },
        { id: 'todo', icon: CheckSquare, label: 'Task' },
        { id: 'money', icon: Wallet, label: 'Wallet' },
    ];

    const moreServices = [
        { id: 'focus', icon: Clock, label: 'Focus Timer', color: 'from-orange-500 to-red-500' },
        { id: 'sharedExpenses', icon: Users, label: 'Shared Expenses', color: 'from-green-500 to-emerald-500' },
        { id: 'notes', icon: BookOpen, label: 'Notes', color: 'from-indigo-500 to-purple-500' },
        { id: 'habits', icon: Target, label: 'Habit Tracker', color: 'from-pink-500 to-rose-500' },
        { id: 'events', icon: Sparkles, label: 'Events', color: 'from-yellow-500 to-orange-500' },
        { id: 'debts', icon: DollarSign, label: 'Debts & Loans', color: 'from-red-500 to-pink-500' },
    ];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setShowMoreServices(false);
        setShowSettingsDropdown(false);
    };

    return (
        <>
            {/* Top Right Settings Button */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                <button
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg ${
                        isDarkMode 
                            ? 'bg-slate-800/90 text-white hover:bg-slate-700' 
                            : 'bg-white/90 text-slate-700 hover:bg-gray-100'
                    } ${showSettingsDropdown || activeTab === 'profile' || activeTab === 'settings' ? 'ring-2 ring-indigo-500' : ''}`}
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Bottom Navigation Bar */}
            <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-md border-t z-50 safe-area-inset-bottom ${
                isDarkMode 
                    ? 'bg-slate-900/90 border-slate-700' 
                    : 'bg-white/90 border-gray-200'
            }`}>
                <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
                    {mainTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                    isActive 
                                        ? 'text-indigo-500' 
                                        : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -top-0.5 w-10 h-0.5 bg-indigo-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                    
                    {/* More Services Button */}
                    <button
                        onClick={() => setShowMoreServices(!showMoreServices)}
                        className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                            showMoreServices 
                                ? 'text-indigo-500' 
                                : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                    >
                        {showMoreServices && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute -top-0.5 w-10 h-0.5 bg-indigo-500 rounded-full"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <Grid size={22} strokeWidth={showMoreServices ? 2.5 : 2} />
                        <span className="text-xs mt-0.5 font-medium">More</span>
                    </button>
                </div>
            </div>

            {/* More Services Modal */}
            <AnimatePresence>
                {showMoreServices && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMoreServices(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className={`fixed bottom-16 left-0 right-0 rounded-t-3xl shadow-2xl z-40 max-w-md mx-auto max-h-[70vh] overflow-y-auto ${
                                isDarkMode ? 'bg-slate-900' : 'bg-white'
                            }`}
                        >
                            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${
                                isDarkMode 
                                    ? 'bg-slate-900 border-slate-700' 
                                    : 'bg-white border-gray-100'
                            }`}>
                                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                    More Services
                                </h2>
                                <button 
                                    onClick={() => setShowMoreServices(false)}
                                    className={`p-2 rounded-full transition-colors ${
                                        isDarkMode 
                                            ? 'hover:bg-slate-800 text-slate-300' 
                                            : 'hover:bg-gray-100 text-slate-700'
                                    }`}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 pb-6">
                                <div className="grid grid-cols-3 gap-3">
                                    {moreServices.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        
                                        return (
                                            <motion.button
                                                key={item.id}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleTabClick(item.id)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                                                    isActive 
                                                        ? isDarkMode
                                                            ? 'bg-indigo-900/50 ring-2 ring-indigo-500'
                                                            : 'bg-indigo-50 ring-2 ring-indigo-500'
                                                        : isDarkMode
                                                            ? 'bg-slate-800 hover:bg-slate-700'
                                                            : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color}`}>
                                                    <Icon size={20} className="text-white" />
                                                </div>
                                                <span className={`text-xs font-medium text-center leading-tight ${
                                                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Settings Dropdown */}
            <AnimatePresence>
                {showSettingsDropdown && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettingsDropdown(false)}
                            className="fixed inset-0 z-40"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className={`fixed top-16 right-4 w-64 rounded-2xl shadow-2xl z-50 overflow-hidden ${
                                isDarkMode ? 'bg-slate-800' : 'bg-white'
                            }`}
                        >
                            <div className="p-3 space-y-1">
                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDarkMode();
                                    }}
                                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-colors ${
                                        isDarkMode 
                                            ? 'hover:bg-slate-700 text-slate-200' 
                                            : 'hover:bg-gray-100 text-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                                        <span className="font-medium">Dark Mode</span>
                                    </div>
                                    <div className={`w-11 h-6 rounded-full transition-colors relative ${
                                        isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'
                                    }`}>
                                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                            isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                                        }`} />
                                    </div>
                                </button>

                                <div className={`h-px my-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />

                                {/* Profile */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleTabClick('profile')}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                        activeTab === 'profile'
                                            ? isDarkMode
                                                ? 'bg-indigo-900/50 text-indigo-300'
                                                : 'bg-indigo-50 text-indigo-600'
                                            : isDarkMode
                                                ? 'hover:bg-slate-700 text-slate-200'
                                                : 'hover:bg-gray-100 text-slate-700'
                                    }`}
                                >
                                    <User size={20} />
                                    <span className="font-medium">Profile</span>
                                </motion.button>

                                {/* Settings */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleTabClick('settings')}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                        activeTab === 'settings'
                                            ? isDarkMode
                                                ? 'bg-indigo-900/50 text-indigo-300'
                                                : 'bg-indigo-50 text-indigo-600'
                                            : isDarkMode
                                                ? 'hover:bg-slate-700 text-slate-200'
                                                : 'hover:bg-gray-100 text-slate-700'
                                    }`}
                                >
                                    <Settings size={20} />
                                    <span className="font-medium">Settings</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
