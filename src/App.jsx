import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ToDo from './pages/ToDo';
import Money from './pages/Money';
import Wallets from './pages/Wallets';
import Debts from './pages/Debts';
import TaskHistory from './pages/TaskHistory';
import TransactionHistory from './pages/TransactionHistory';
import Semester from './pages/Semester';
import Timetable from './pages/Timetable';
import FocusTimer from './pages/FocusTimer';
import SharedExpenses from './pages/SharedExpenses';
import Notes from './pages/Notes';
import Habits from './pages/Habits';
import Events from './pages/Events';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AcademicHistory from './pages/AcademicHistory';
import Login from './pages/Login';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg font-semibold">Loading Planio...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Login />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard key="dashboard" />;
            case 'todo':
                return <ToDo key="todo" />;
            case 'taskHistory':
                return <TaskHistory key="taskHistory" />;
            case 'money':
                return <Money key="money" />;
            case 'wallets':
                return <Wallets key="wallets" />;
            case 'transactionHistory':
                return <TransactionHistory key="transactionHistory" />;
            case 'debts':
                return <Debts key="debts" />;
            case 'semester':
                return <Semester key="semester" />;
            case 'timetable':
                return <Timetable key="timetable" />;
            case 'focus':
                return <FocusTimer key="focus" />;
            case 'sharedExpenses':
                return <SharedExpenses key="sharedExpenses" />;
            case 'notes':
                return <Notes key="notes" />;
            case 'habits':
                return <Habits key="habits" />;
            case 'events':
                return <Events key="events" />;
            case 'academicHistory':
                return <AcademicHistory key="academicHistory" />;
            case 'profile':
                return <Profile key="profile" />;
            case 'settings':
                return <Settings key="settings" />;
            default:
                return <Dashboard key="dashboard" />;
        }
    };

    return (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </Layout>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </AuthProvider>
    );
}

export default App;
