import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Clock, BookOpen, GraduationCap, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, differenceInDays, differenceInHours } from 'date-fns';

const Semester = () => {
    const { semester, addSemesterEvent, updateSemesterEvent, deleteSemesterEvent, timetable, addTimetableClass, deleteTimetableClass } = useApp();
    const [activeTab, setActiveTab] = useState('deadlines'); // deadlines or schedule
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'exam', // exam, assignment, semester_end
        date: '',
        time: '',
        description: '',
    });
    const [classFormData, setClassFormData] = useState({
        subject: '',
        type: 'lecture',
        day: 'Monday',
        startTime: '',
        endTime: '',
        location: '',
        instructor: '',
        color: 'from-blue-500 to-indigo-600'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.date) return;

        if (editingId) {
            updateSemesterEvent(editingId, formData);
            setEditingId(null);
        } else {
            addSemesterEvent(formData);
        }

        setFormData({ title: '', type: 'exam', date: '', time: '', description: '' });
        setIsAdding(false);
    };

    const handleEdit = (event) => {
        setFormData({
            title: event.title,
            type: event.type,
            date: event.date,
            time: event.time || '',
            description: event.description || '',
        });
        setEditingId(event.id);
        setIsAdding(true);
    };

    const getDaysLeft = (date, time) => {
        const targetDate = time ? new Date(`${date}T${time}`) : new Date(date);
        const now = new Date();
        const days = differenceInDays(targetDate, now);
        const hours = differenceInHours(targetDate, now) % 24;
        
        if (days < 0) return { text: 'Passed', color: 'text-gray-400', isPast: true };
        if (days === 0 && hours > 0) return { text: `${hours}h left`, color: 'text-red-500', isPast: false };
        if (days === 0) return { text: 'Today', color: 'text-red-500', isPast: false };
        if (days === 1) return { text: 'Tomorrow', color: 'text-orange-500', isPast: false };
        if (days <= 3) return { text: `${days} days`, color: 'text-orange-500', isPast: false };
        if (days <= 7) return { text: `${days} days`, color: 'text-yellow-600', isPast: false };
        return { text: `${days} days`, color: 'text-green-600', isPast: false };
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'exam': return BookOpen;
            case 'assignment': return Clock;
            case 'semester_end': return GraduationCap;
            default: return Calendar;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'exam': return 'Exam';
            case 'assignment': return 'Assignment';
            case 'semester_end': return 'Semester End';
            default: return 'Event';
        }
    };

    const sortedEvents = [...semester].sort((a, b) => {
        const dateA = new Date(a.time ? `${a.date}T${a.time}` : a.date);
        const dateB = new Date(b.time ? `${b.date}T${b.time}` : b.date);
        return dateA - dateB;
    });

    const upcomingEvents = sortedEvents.filter(e => !getDaysLeft(e.date, e.time).isPast);
    const pastEvents = sortedEvents.filter(e => getDaysLeft(e.date, e.time).isPast);

    const handleClassSubmit = (e) => {
        e.preventDefault();
        if (!classFormData.subject || !classFormData.startTime || !classFormData.endTime) return;
        
        addTimetableClass(classFormData);
        setClassFormData({
            subject: '',
            type: 'lecture',
            day: 'Monday',
            startTime: '',
            endTime: '',
            location: '',
            instructor: '',
            color: 'from-blue-500 to-indigo-600'
        });
        setIsAdding(false);
    };

    const colorOptions = [
        { value: 'from-blue-500 to-indigo-600', label: 'Blue' },
        { value: 'from-purple-500 to-pink-600', label: 'Purple' },
        { value: 'from-green-500 to-teal-600', label: 'Green' },
        { value: 'from-orange-500 to-red-600', label: 'Orange' },
        { value: 'from-yellow-500 to-amber-600', label: 'Yellow' },
        { value: 'from-cyan-500 to-blue-600', label: 'Cyan' },
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const todayClasses = timetable.filter(c => c.day === format(new Date(), 'EEEE'));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 pt-12 pb-24"
        >
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-slate-800">Academic Planner</h1>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setEditingId(null);
                        if (activeTab === 'deadlines') {
                            setFormData({ title: '', type: 'exam', date: '', time: '', description: '' });
                        } else {
                            setClassFormData({
                                subject: '',
                                type: 'lecture',
                                day: 'Monday',
                                startTime: '',
                                endTime: '',
                                location: '',
                                instructor: '',
                                color: 'from-blue-500 to-indigo-600'
                            });
                        }
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg"
                >
                    <motion.div animate={{ rotate: isAdding ? 45 : 0 }} transition={{ duration: 0.2 }}>
                        <Plus size={24} />
                    </motion.div>
                </motion.button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('deadlines');
                        setIsAdding(false);
                    }}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        activeTab === 'deadlines'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Deadlines
                </button>
                <button
                    onClick={() => {
                        setActiveTab('schedule');
                        setIsAdding(false);
                    }}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        activeTab === 'schedule'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Clock className="w-5 h-5 inline mr-2" />
                    Class Schedule
                </button>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {isAdding && activeTab === 'deadlines' && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                    >
                        <input
                            type="text"
                            placeholder="Event Title (e.g., Data Structures Final)"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full text-lg font-medium placeholder:text-gray-400 border-b border-gray-200 focus:border-indigo-600 focus:ring-0 p-2 mb-4 outline-none"
                            autoFocus
                        />

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {['exam', 'assignment', 'semester_end'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                                        formData.type === type
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {getTypeLabel(type)}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Time (optional)</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                />
                            </div>
                        </div>

                        <textarea
                            placeholder="Description (optional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm"
                            rows={2}
                        />

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium shadow-md"
                        >
                            {editingId ? 'Update Event' : 'Add Event'}
                        </button>
                    </motion.form>
                )}

                {isAdding && activeTab === 'schedule' && (
                    <motion.form
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        onSubmit={handleClassSubmit}
                        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                    >
                        <input
                            type="text"
                            placeholder="Subject Name (e.g., Data Structures)"
                            value={classFormData.subject}
                            onChange={(e) => setClassFormData({ ...classFormData, subject: e.target.value })}
                            className="w-full text-lg font-medium placeholder:text-gray-400 border-b border-gray-200 focus:border-indigo-600 focus:ring-0 p-2 mb-4 outline-none"
                            autoFocus
                        />

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {['lecture', 'lab', 'tutorial'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setClassFormData({ ...classFormData, type })}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                                        classFormData.type === type
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Day</label>
                                <select
                                    value={classFormData.day}
                                    onChange={(e) => setClassFormData({ ...classFormData, day: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                >
                                    {days.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
                                <select
                                    value={classFormData.color}
                                    onChange={(e) => setClassFormData({ ...classFormData, color: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                >
                                    {colorOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={classFormData.startTime}
                                    onChange={(e) => setClassFormData({ ...classFormData, startTime: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={classFormData.endTime}
                                    onChange={(e) => setClassFormData({ ...classFormData, endTime: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <input
                                type="text"
                                placeholder="Location (optional)"
                                value={classFormData.location}
                                onChange={(e) => setClassFormData({ ...classFormData, location: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Instructor (optional)"
                                value={classFormData.instructor}
                                onChange={(e) => setClassFormData({ ...classFormData, instructor: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium shadow-md"
                        >
                            Add Class
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Deadlines Section */}
            {activeTab === 'deadlines' && upcomingEvents.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-3">Upcoming</h2>
                    <div className="space-y-3">
                        {upcomingEvents.map((event) => {
                            const Icon = getTypeIcon(event.type);
                            const countdown = getDaysLeft(event.date, event.time);

                            return (
                                <motion.div
                                    key={event.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl shrink-0">
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 truncate">{event.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {format(new Date(event.date), 'MMM d, yyyy')}
                                                {event.time && ` at ${event.time}`}
                                            </p>
                                            {event.description && (
                                                <p className="text-sm text-slate-600 mt-2">{event.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs font-bold ${countdown.color}`}>
                                                    {countdown.text}
                                                </span>
                                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                                                    {getTypeLabel(event.type)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="text-slate-400 hover:text-indigo-600 p-1"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteSemesterEvent(event.id)}
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
                </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-slate-400 mb-3">Past Events</h2>
                    <div className="space-y-3 opacity-60">
                        {pastEvents.map((event) => {
                            const Icon = getTypeIcon(event.type);

                            return (
                                <motion.div
                                    key={event.id}
                                    layout
                                    className="bg-gray-50 p-4 rounded-2xl border border-gray-200"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-gray-200 text-gray-500 p-2.5 rounded-xl shrink-0">
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-600 truncate line-through">
                                                {event.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {format(new Date(event.date), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteSemesterEvent(event.id)}
                                            className="text-slate-300 hover:text-red-500 p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'deadlines' && upcomingEvents.length === 0 && pastEvents.length === 0 && (
                <div className="text-center py-16">
                    <GraduationCap size={64} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 text-lg">No semester events yet</p>
                    <p className="text-slate-400 text-sm mt-2">Add your exams, assignments, and important dates!</p>
                </div>
            )}

            {/* Class Schedule Section */}
            {activeTab === 'schedule' && (
                <>
                    {/* Today's Classes */}
                    {todayClasses.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-3">Today's Classes</h2>
                            <div className="space-y-3">
                                {todayClasses.map((classItem) => (
                                    <motion.div
                                        key={classItem.id}
                                        layout
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`bg-gradient-to-r ${classItem.color} p-2.5 rounded-xl shrink-0 text-white`}>
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-800">{classItem.subject}</h3>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {classItem.startTime} - {classItem.endTime}
                                                    {classItem.location && ` • ${classItem.location}`}
                                                </p>
                                                {classItem.instructor && (
                                                    <p className="text-xs text-slate-500 mt-1">{classItem.instructor}</p>
                                                )}
                                                <span className="inline-block text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full mt-2">
                                                    {classItem.type}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => deleteTimetableClass(classItem.id)}
                                                className="text-slate-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Classes by Day */}
                    {days.map(day => {
                        const dayClasses = timetable.filter(c => c.day === day);
                        if (dayClasses.length === 0) return null;

                        return (
                            <div key={day} className="mb-6">
                                <h2 className="text-lg font-bold text-slate-800 mb-3">{day}</h2>
                                <div className="space-y-2">
                                    {dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((classItem) => (
                                        <motion.div
                                            key={classItem.id}
                                            layout
                                            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3"
                                        >
                                            <div className={`bg-gradient-to-r ${classItem.color} w-1 h-12 rounded-full`} />
                                            <div className="flex-1">
                                                <h3 className="font-medium text-slate-800">{classItem.subject}</h3>
                                                <p className="text-sm text-slate-600">
                                                    {classItem.startTime} - {classItem.endTime}
                                                    {classItem.location && ` • ${classItem.location}`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteTimetableClass(classItem.id)}
                                                className="text-slate-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {timetable.length === 0 && (
                        <div className="text-center py-16">
                            <Clock size={64} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 text-lg">No classes added yet</p>
                            <p className="text-slate-400 text-sm mt-2">Add your class schedule to stay organized!</p>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default Semester;
