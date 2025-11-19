import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskItem from '../components/TaskItem';

const ToDo = () => {
    const { tasks, addTask, toggleTask, deleteTask } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', priority: 'medium', dueDate: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        addTask(newTask);
        setNewTask({ title: '', priority: 'medium', dueDate: '' });
        setIsAdding(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-3"
        >
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-bold text-slate-800">My Tasks</h1>
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
            </div>

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
                    {tasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-slate-500 py-8"
                        >
                            <p className="text-sm">No tasks yet.</p>
                            <p className="text-xs mt-1">Tap + to add your first task! 🎯</p>
                        </motion.div>
                    ) : (
                        tasks.map((task) => (
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

export default ToDo;
