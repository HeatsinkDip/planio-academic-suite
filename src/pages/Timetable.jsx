import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, MapPin, Bell, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, isToday, parse } from 'date-fns';

const Timetable = () => {
    const { timetable, addTimetableClass, updateTimetableClass, deleteTimetableClass } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('today'); // today, week
    const [formData, setFormData] = useState({
        subject: '',
        type: 'lecture', // lecture, lab, tutorial
        day: 'Monday',
        startTime: '',
        endTime: '',
        location: '',
        instructor: '',
        color: '#6366f1',
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const colors = [
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Purple', value: '#9333ea' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Green', value: '#10b981' },
        { name: 'Orange', value: '#f59e0b' },
        { name: 'Red', value: '#ef4444' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.startTime || !formData.endTime) return;

        if (editingId) {
            updateTimetableClass(editingId, formData);
            setEditingId(null);
        } else {
            addTimetableClass(formData);
        }

        setFormData({
            subject: '',
            type: 'lecture',
            day: 'Monday',
            startTime: '',
            endTime: '',
            location: '',
            instructor: '',
            color: '#6366f1',
        });
        setIsAdding(false);
    };

    const handleEdit = (classItem) => {
        setFormData({ ...classItem });
        setEditingId(classItem.id);
        setIsAdding(true);
    };

    const getTodayClasses = () => {
        const today = format(new Date(), 'EEEE');
        return timetable
            .filter(c => c.day === today)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const getClassesByDay = (day) => {
        return timetable
            .filter(c => c.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const isClassNow = (startTime, endTime) => {
        if (!isToday(new Date())) return false;
        const now = new Date();
        const currentTime = format(now, 'HH:mm');
        return currentTime >= startTime && currentTime <= endTime;
    };

    const todayClasses = getTodayClasses();
    const currentDay = format(new Date(), 'EEEE');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 pt-12 pb-24"
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Timetable</h1>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setEditingId(null);
                        setFormData({
                            subject: '',
                            type: 'lecture',
                            day: currentDay,
                            startTime: '',
                            endTime: '',
                            location: '',
                            instructor: '',
                            color: '#6366f1',
                        });
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg"
                >
                    <motion.div animate={{ rotate: isAdding ? 45 : 0 }} transition={{ duration: 0.2 }}>
                        <Plus size={24} />
                    </motion.div>
                </motion.button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setViewMode('today')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        viewMode === 'today'
                            ? 'bg-indigo-100 text-indigo-600 shadow-sm'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Today's Classes
                </button>
                <button
                    onClick={() => setViewMode('week')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        viewMode === 'week'
                            ? 'bg-indigo-100 text-indigo-600 shadow-sm'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Weekly View
                </button>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                    >
                        <input
                            type="text"
                            placeholder="Subject Name (e.g., Data Structures)"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full text-lg font-medium placeholder:text-gray-400 border-b border-gray-200 focus:border-indigo-600 focus:ring-0 p-2 mb-4 outline-none"
                            autoFocus
                        />

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {['lecture', 'lab', 'tutorial'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                        formData.type === type
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <select
                            value={formData.day}
                            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                        >
                            {days.map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 outline-none"
                                />
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="Location (e.g., Room 101, Lab 3)"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm focus:border-indigo-600 outline-none"
                        />

                        <input
                            type="text"
                            placeholder="Instructor Name (optional)"
                            value={formData.instructor}
                            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm focus:border-indigo-600 outline-none"
                        />

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-600 mb-2">Color</label>
                            <div className="flex gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        className={`w-8 h-8 rounded-full transition-all ${
                                            formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium shadow-md"
                        >
                            {editingId ? 'Update Class' : 'Add Class'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Today's Classes View */}
            {viewMode === 'today' && (
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-3">
                        {currentDay}'s Schedule ({todayClasses.length} classes)
                    </h2>
                    {todayClasses.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl">
                            <CalendarIcon size={64} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500">No classes today! 🎉</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todayClasses.map((classItem) => {
                                const isNow = isClassNow(classItem.startTime, classItem.endTime);
                                
                                return (
                                    <motion.div
                                        key={classItem.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-4 rounded-2xl shadow-sm border-l-4 relative ${
                                            isNow ? 'bg-gradient-to-r from-green-50 to-white border-green-500' : 'bg-white border-gray-200'
                                        }`}
                                        style={{ borderLeftColor: classItem.color }}
                                    >
                                        {isNow && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                                Now
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="px-3 py-2 rounded-xl text-white font-bold text-sm shrink-0"
                                                style={{ backgroundColor: classItem.color }}
                                            >
                                                {classItem.startTime}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800">{classItem.subject}</h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {classItem.type.toUpperCase()} • {classItem.startTime} - {classItem.endTime}
                                                </p>
                                                {classItem.location && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                                                        <MapPin size={12} />
                                                        {classItem.location}
                                                    </div>
                                                )}
                                                {classItem.instructor && (
                                                    <p className="text-xs text-slate-500 mt-1">👨‍🏫 {classItem.instructor}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    onClick={() => handleEdit(classItem)}
                                                    className="text-slate-400 hover:text-indigo-600 p-1"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteTimetableClass(classItem.id)}
                                                    className="text-slate-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Weekly View */}
            {viewMode === 'week' && (
                <div className="space-y-6">
                    {days.map((day) => {
                        const classes = getClassesByDay(day);
                        const isCurrentDay = day === currentDay;
                        
                        return (
                            <div key={day}>
                                <h3 className={`text-md font-bold mb-3 ${isCurrentDay ? 'text-indigo-600' : 'text-slate-700'}`}>
                                    {day} {isCurrentDay && '(Today)'}
                                    <span className="text-sm font-normal text-slate-400 ml-2">
                                        {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                                    </span>
                                </h3>
                                {classes.length === 0 ? (
                                    <p className="text-slate-400 text-sm pl-4">No classes</p>
                                ) : (
                                    <div className="space-y-2">
                                        {classes.map((classItem) => (
                                            <motion.div
                                                key={classItem.id}
                                                className="bg-white p-3 rounded-xl shadow-sm border-l-4 flex items-center justify-between"
                                                style={{ borderLeftColor: classItem.color }}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        className="px-2 py-1 rounded text-white text-xs font-bold"
                                                        style={{ backgroundColor: classItem.color }}
                                                    >
                                                        {classItem.startTime}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-800 text-sm truncate">
                                                            {classItem.subject}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {classItem.type} • {classItem.startTime}-{classItem.endTime}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(classItem)}
                                                        className="text-slate-400 hover:text-indigo-600 p-1"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTimetableClass(classItem.id)}
                                                        className="text-slate-400 hover:text-red-600 p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default Timetable;
