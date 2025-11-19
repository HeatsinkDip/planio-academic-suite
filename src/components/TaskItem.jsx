import React from 'react';
import { Check, Trash2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const TaskItem = ({ task, onToggle, onDelete }) => {
    const priorityColors = {
        high: 'bg-red-100 text-red-600 border-red-200',
        medium: 'bg-orange-100 text-orange-600 border-orange-200',
        low: 'bg-green-100 text-green-600 border-green-200',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${task.completed ? 'bg-gray-50 border-gray-100 opacity-75' : 'bg-white border-gray-100'
                }`}
        >
            <button
                onClick={() => onToggle(task._id || task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-300 text-transparent hover:border-indigo-600'
                    }`}
            >
                <Check size={12} strokeWidth={3} />
            </button>

            <div className="flex-1 min-w-0">
                <h3
                    className={`text-xs font-semibold truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'
                        }`}
                >
                    {task.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wide ${priorityColors[task.priority] || priorityColors.low
                            }`}
                    >
                        {task.priority}
                    </span>
                    {task.dueDate && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <Clock size={9} />
                            {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={() => onDelete(task._id || task.id)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors shrink-0"
            >
                <Trash2 size={14} />
            </button>
        </motion.div>
    );
};

export default TaskItem;
