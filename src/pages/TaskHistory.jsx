import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskItem from '../components/TaskItem';
import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

const TaskHistory = () => {
    const { tasks, toggleTask, deleteTask } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending
    const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Filter and search tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Search filter
            if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Status filter
            if (filterStatus === 'completed' && !task.completed) return false;
            if (filterStatus === 'pending' && task.completed) return false;

            // Priority filter
            if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

            // Date range filter
            if (dateRange.start && dateRange.end && task.createdAt) {
                try {
                    const taskDate = new Date(task.createdAt);
                    const start = startOfDay(parseISO(dateRange.start));
                    const end = endOfDay(parseISO(dateRange.end));
                    if (!isWithinInterval(taskDate, { start, end })) return false;
                } catch (e) {
                    // If date parsing fails, skip this filter
                }
            }

            return true;
        });
    }, [tasks, searchTerm, filterStatus, filterPriority, dateRange]);

    // Statistics
    const stats = useMemo(() => ({
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
    }), [tasks]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 pt-12"
        >
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Task History</h1>
                <p className="text-slate-500">View and manage all your tasks</p>
            </header>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                    <div className="text-xs text-slate-500 mt-1">Total</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-slate-500 mt-1">Done</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                    <div className="text-xs text-slate-500 mt-1">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</div>
                    <div className="text-xs text-slate-500 mt-1">Rate</div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={18} className="text-slate-600" />
                    <span className="font-medium text-slate-800">Filters</span>
                </div>

                <div className="space-y-3">
                    {/* Status Filter */}
                    <div>
                        <label className="text-xs text-slate-600 mb-2 block">Status</label>
                        <div className="flex gap-2">
                            {['all', 'pending', 'completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === status
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <label className="text-xs text-slate-600 mb-2 block">Priority</label>
                        <div className="flex gap-2">
                            {['all', 'high', 'medium', 'low'].map((priority) => (
                                <button
                                    key={priority}
                                    onClick={() => setFilterPriority(priority)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterPriority === priority
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="text-xs text-slate-600 mb-2 block">Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-1">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800">
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
                    </h3>
                    {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || dateRange.start ? (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterPriority('all');
                                setDateRange({ start: '', end: '' });
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                            Clear Filters
                        </button>
                    ) : null}
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 text-slate-500"
                        >
                            <AlertCircle size={48} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-lg">No tasks found</p>
                            <p className="text-sm mt-2">Try adjusting your filters</p>
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
        </motion.div>
    );
};

export default TaskHistory;
