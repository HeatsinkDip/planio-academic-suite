import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, History, Search, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskItem from '../components/TaskItem';
import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

const ToDo = () => {
    const { tasks, addTask, toggleTask, deleteTask } = useApp();
    const [activeView, setActiveView] = useState('tasks'); // tasks, history
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', priority: 'medium', dueDate: '' });
    
    // History filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Auto-archive completed tasks after 5 minutes
    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            tasks.forEach(task => {
                if (task.completed && task.completedAt) {
                    const completedTime = new Date(task.completedAt);
                    const minutesSinceComplete = (now - completedTime) / 1000 / 60;
                    if (minutesSinceComplete >= 5) {
                        // Task will be archived automatically - just needs completedAt field
                        console.log(`Task "${task.title}" auto-archived after 5 minutes`);
                    }
                }
            });
        }, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, [tasks]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        addTask(newTask);
        setNewTask({ title: '', priority: 'medium', dueDate: '' });
        setIsAdding(false);
    };

    // Show only active (non-archived) tasks in main view
    const activeTasks = tasks.filter(task => {
        if (!task.completed) return true;
        if (!task.completedAt) return true;
        const completedTime = new Date(task.completedAt);
        const minutesSinceComplete = (new Date() - completedTime) / 1000 / 60;
        return minutesSinceComplete < 5; // Show for 5 minutes after completion
    });

    // Filter tasks for history view
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            if (filterStatus === 'completed' && !task.completed) return false;
            if (filterStatus === 'pending' && task.completed) return false;

            if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

            if (dateRange.start && dateRange.end && task.createdAt) {
                try {
                    const taskDate = new Date(task.createdAt);
                    const start = startOfDay(parseISO(dateRange.start));
                    const end = endOfDay(parseISO(dateRange.end));
                    if (!isWithinInterval(taskDate, { start, end })) return false;
                } catch (e) {
                    // Skip date filter if parsing fails
                }
            }

            return true;
        });
    }, [tasks, searchTerm, filterStatus, filterPriority, dateRange]);

    const stats = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
    }), [tasks]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-3"
        >
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-bold text-slate-800">My Tasks</h1>
                {activeView === 'tasks' && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-full shadow-lg"
                    >
                        <motion.div
                            animate={{ rotate: isAdding ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Plus size={18} />
                        </motion.div>
                    </motion.button>
                )}
            </div>

            {/* View Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('tasks')}
                    className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs ${
                        activeView === 'tasks'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-white text-slate-600 border border-gray-100'
                    }`}
                >
                    <CheckCircle size={16} />
                    <span className="font-semibold">Active Tasks</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveView('history')}
                    className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all text-xs ${
                        activeView === 'history'
                            ? 'bg-slate-500 text-white shadow-lg'
                            : 'bg-white text-slate-600 border border-gray-100'
                    }`}
                >
                    <History size={16} />
                    <span className="font-semibold">History</span>
                </motion.button>
            </div>

            {/* TASKS VIEW */}
            {activeView === 'tasks' && (
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
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full text-sm font-medium placeholder:text-gray-400 border-none focus:ring-0 p-0 mb-3 outline-none"
                            autoFocus
                        />
                        <div className="flex gap-2 mb-3">
                            {['low', 'medium', 'high'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewTask({ ...newTask, priority: p })}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${newTask.priority === p
                                            ? 'bg-slate-800 text-white'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <input
                            type="date"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 text-xs focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                        />
                        <button
                            type="submit"
                            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                        >
                            Add Task
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-1.5">
                <AnimatePresence mode='popLayout'>
                    {activeTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-slate-500 py-8"
                        >
                            <p className="text-sm">No active tasks.</p>
                            <p className="text-xs mt-1">Tap + to add your first task! 🎯</p>
                        </motion.div>
                    ) : (
                        activeTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={toggleTask}
                                onDelete={deleteTask}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
            </>
            )}

            {/* HISTORY VIEW */}
            {activeView === 'history' && (
            <>
            <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <div className="text-xl font-bold text-slate-800">{stats.total}</div>
                    <div className="text-[9px] text-slate-500 mt-1">Total</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <div className="text-xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-[9px] text-slate-500 mt-1">Done</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <div className="text-xl font-bold text-orange-600">{stats.pending}</div>
                    <div className="text-[9px] text-slate-500 mt-1">Pending</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <div className="text-xl font-bold text-indigo-600">{stats.completionRate}%</div>
                    <div className="text-[9px] text-slate-500 mt-1">Rate</div>
                </div>
            </div>

            <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search tasks..."
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
                        <label className="text-[9px] text-slate-600 mb-1 block">Status</label>
                        <div className="flex gap-1.5">
                            {['all', 'pending', 'completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${filterStatus === status
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] text-slate-600 mb-1 block">Priority</label>
                        <div className="flex gap-1.5">
                            {['all', 'high', 'medium', 'low'].map((priority) => (
                                <button
                                    key={priority}
                                    onClick={() => setFilterPriority(priority)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${filterPriority === priority
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] text-slate-600 mb-1 block">Date Range</label>
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
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
                    </h3>
                    {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || dateRange.start) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterPriority('all');
                                setDateRange({ start: '', end: '' });
                            }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-700"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="space-y-1.5">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 text-slate-500"
                            >
                                <AlertCircle size={40} className="mx-auto mb-2 text-slate-300" />
                                <p className="text-sm">No tasks found</p>
                                <p className="text-xs mt-1">Try adjusting your filters</p>
                            </motion.div>
                        ) : (
                            filteredTasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
            </>
            )}
        </motion.div>
    );
};

export default ToDo;
