import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from './Navbar';

const Layout = ({ children, activeTab, setActiveTab }) => {
    const { currentUser, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        logout();
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Header */}
            <header className={`border-b sticky top-0 z-40 shadow-sm ${
                isDarkMode 
                    ? 'bg-slate-900 border-slate-700' 
                    : 'bg-white border-gray-100'
            }`}>
                <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                    {/* App Name */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Planio
                        </h1>
                    </div>

                    {/* Profile - Hidden, moved to settings dropdown */}
                    <div className="relative opacity-0 pointer-events-none">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </button>

                        {/* Profile Dropdown */}
                        <AnimatePresence>
                            {showProfileMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowProfileMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                                    >
                                        <div className="p-3 border-b border-gray-100">
                                            <p className="font-semibold text-sm text-slate-800">{currentUser?.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                setActiveTab('profile');
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <User size={16} />
                                            Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto w-full flex-1 relative pb-24 pt-2">
                {children}
            </main>

            {/* Footer */            <footer className={`border-t py-3 text-center ${
                isDarkMode 
                    ? 'bg-slate-900 border-slate-700' 
                    : 'bg-white border-gray-100'
            }`}>
                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Made by Dip Kundu ❤️ for students
                </p>
            </footer>

            {/* Bottom Navigation */}
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
};

export default Layout;
