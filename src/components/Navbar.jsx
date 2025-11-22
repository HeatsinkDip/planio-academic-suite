import React, { useState } from 'react';
import { Home, CheckSquare, DollarSign, Grid, User, Settings, GraduationCap, Calendar, Clock, Users, BookOpen, Target, Sparkles, History, Wallet, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ activeTab, setActiveTab }) => {
    const [showAllServices, setShowAllServices] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const mainTabs = [
        { id: 'dashboard', icon: Home, label: 'Overview' },
        { id: 'todo', icon: CheckSquare, label: 'Tasks' },
        { id: 'money', icon: DollarSign, label: 'Money' },
    ];

    const allServices = [
        { id: 'semester', icon: GraduationCap, label: 'Semester Tracker', color: 'from-purple-500 to-pink-500' },
        { id: 'focus', icon: Clock, label: 'Focus Timer', color: 'from-orange-500 to-red-500' },
        { id: 'sharedExpenses', icon: Users, label: 'Shared Expenses', color: 'from-green-500 to-emerald-500' },
        { id: 'notes', icon: BookOpen, label: 'Notes', color: 'from-indigo-500 to-purple-500' },
        { id: 'habits', icon: Target, label: 'Habit Tracker', color: 'from-pink-500 to-rose-500' },
        { id: 'events', icon: Sparkles, label: 'Events', color: 'from-yellow-500 to-orange-500' },

        { id: 'debts', icon: DollarSign, label: 'Debts & Loans', color: 'from-red-500 to-pink-500' },
    ];

    const settingsItems = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setShowAllServices(false);
        setShowSettings(false);
    };

    return (
        <>
            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 safe-area-inset-bottom">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
                    {mainTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                    isActive ? 'text-indigo-600' : 'text-slate-500'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -top-0.5 w-10 h-0.5 bg-indigo-600 rounded-full"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                    
                    {/* All Services Button */}
                    <button
                        onClick={() => setShowAllServices(!showAllServices)}
                        className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                            showAllServices ? 'text-indigo-600' : 'text-slate-500'
                        }`}
                    >
                        {showAllServices && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute -top-0.5 w-10 h-0.5 bg-indigo-600 rounded-full"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <Grid size={22} strokeWidth={showAllServices ? 2.5 : 2} />
                        <span className="text-xs mt-0.5 font-medium">Services</span>
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                            showSettings || activeTab === 'profile' || activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-500'
                        }`}
                    >
                        {(showSettings || activeTab === 'profile' || activeTab === 'settings') && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute -top-0.5 w-10 h-0.5 bg-indigo-600 rounded-full"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <Settings size={22} strokeWidth={showSettings || activeTab === 'profile' || activeTab === 'settings' ? 2.5 : 2} />
                        <span className="text-xs mt-0.5 font-medium">Settings</span>
                    </button>
                </div>
            </div>

            {/* All Services Modal */}
            <AnimatePresence>
                {showAllServices && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAllServices(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 max-w-md mx-auto max-h-[70vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">All Services</h2>
                                <button 
                                    onClick={() => setShowAllServices(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 pb-6">
                                <div className="grid grid-cols-3 gap-3">
                                    {allServices.map((item) => {
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
                                                        ? 'bg-indigo-50 ring-2 ring-indigo-500' 
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color}`}>
                                                    <Icon size={20} className="text-white" />
                                                </div>
                                                <span className="text-xs font-medium text-center text-slate-700 leading-tight">{item.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettings(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 max-w-md mx-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">Settings</h2>
                                <button 
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 pb-8">
                                <div className="space-y-3">
                                    {settingsItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        
                                        return (
                                            <motion.button
                                                key={item.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleTabClick(item.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                                                    isActive 
                                                        ? 'bg-indigo-50 text-indigo-600' 
                                                        : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                <Icon size={24} />
                                                <span className="font-medium">{item.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
