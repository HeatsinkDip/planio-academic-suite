import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { BookOpen, Calendar, AlertCircle, Clock, Plus, X, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, differenceInDays, parseISO } from 'date-fns';

const Semester = () => {
    const {
        timetable, assignments, exams, semester,
        addTimetable, addAssignment, addExam,
        updateAssignment, deleteTimetable, deleteAssignment, deleteExam,
        semesterConfig, setSemesterConfig
    } = useApp();

    const [activeTab, setActiveTab] = useState('classes');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSemesterSetup, setShowSemesterSetup] = useState(false);

    // Form states
    const [formData, setFormData] = useState({});

    // Get week dates
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Get events for calendar dots
    const getEventsForDay = (day) => {
        const dayStr = format(day, 'EEEE');
        const dateStr = format(day, 'yyyy-MM-dd');
        
        const classes = timetable.filter(c => c.day === dayStr);
        const dayAssignments = assignments.filter(a => a.dueDate === dateStr);
        const dayExams = exams.filter(e => e.date === dateStr);
        
        return { classes: classes.length, assignments: dayAssignments.length, exams: dayExams.length };
    };

    const tabs = [
        { id: 'classes', label: 'Classes', icon: BookOpen, color: 'blue' },
        { id: 'assignments', label: 'Work', icon: AlertCircle, color: 'amber' },
        { id: 'deadlines', label: 'Deadlines', icon: Calendar, color: 'rose' },
        { id: 'exams', label: 'Exams', icon: Clock, color: 'cyan' }
    ];

    const handleAddClass = (e) => {
        e.preventDefault();
        addTimetable({
            ...formData,
            id: Date.now().toString(),
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
        setFormData({});
        setShowAddForm(false);
    };

    const handleAddAssignment = (e) => {
        e.preventDefault();
        addAssignment({
            ...formData,
            id: Date.now().toString(),
            completed: false
        });
        setFormData({});
        setShowAddForm(false);
    };

    const handleAddExam = (e) => {
        e.preventDefault();
        addExam({
            ...formData,
            id: Date.now().toString()
        });
        setFormData({});
        setShowAddForm(false);
    };

    const toggleAssignmentComplete = (id) => {
        const assignment = assignments.find(a => a.id === id);
        updateAssignment(id, { ...assignment, completed: !assignment.completed });
    };

    const getUrgencyColor = (dateStr) => {
        const daysLeft = differenceInDays(parseISO(dateStr), today);
        if (daysLeft < 0) return 'text-gray-400';
        if (daysLeft <= 2) return 'text-rose-600';
        if (daysLeft <= 5) return 'text-amber-600';
        return 'text-green-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 pt-12 pb-20"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h1 className="text-lg font-bold text-slate-800">Academic</h1>
                    <p className="text-[10px] text-slate-500 mt-0.5">Your semester at a glance</p>
                </div>
                <button
                    onClick={() => setShowSemesterSetup(true)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <Settings size={16} />
                </button>
            </div>

            {/* Week Calendar - Collapsible */}
            <motion.div className="mb-3">
                <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full flex items-center justify-between p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 mb-2"
                >
                    <span className="text-xs font-semibold text-slate-700">This Week</span>
                    {showCalendar ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <AnimatePresence>
                    {showCalendar && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-7 gap-1 bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
                                {weekDays.map((day, i) => {
                                    const isToday = isSameDay(day, today);
                                    const events = getEventsForDay(day);
                                    return (
                                        <div
                                            key={i}
                                            className={`text-center p-2 rounded-lg ${
                                                isToday ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-50'
                                            }`}
                                        >
                                            <div className={`text-[10px] font-medium ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                {format(day, 'EEE')}
                                            </div>
                                            <div className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>
                                                {format(day, 'd')}
                                            </div>
                                            <div className="flex justify-center gap-0.5 mt-1">
                                                {events.classes > 0 && <div className="w-1 h-1 rounded-full bg-blue-500" />}
                                                {events.assignments > 0 && <div className="w-1 h-1 rounded-full bg-amber-500" />}
                                                {events.exams > 0 && <div className="w-1 h-1 rounded-full bg-cyan-500" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <motion.button
                            key={tab.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                                isActive
                                    ? `bg-${tab.color}-500 text-white shadow-lg`
                                    : 'bg-white text-slate-600 shadow-sm border border-gray-100'
                            }`}
                        >
                            <Icon size={14} />
                            <span className="text-[10px] font-semibold">{tab.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                >
                    {/* Classes Tab */}
                    {activeTab === 'classes' && (
                        <div className="space-y-3">
                            {timetable.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No classes added yet</p>
                                </div>
                            ) : (
                                timetable.map((classItem) => (
                                    <motion.div
                                        key={classItem.id}
                                        whileHover={{ scale: 1.01 }}
                                        className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: classItem.color }}
                                                    />
                                                    <h3 className="font-bold text-xs text-slate-800 truncate">{classItem.subject}</h3>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{classItem.type} • {classItem.day}</p>
                                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-600">
                                                    <span className="flex items-center gap-0.5">
                                                        <Clock size={10} />
                                                        {classItem.startTime} - {classItem.endTime}
                                                    </span>
                                                    {classItem.location && (
                                                        <span className="text-slate-400 truncate">{classItem.location}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteTimetable(classItem.id)}
                                                className="text-rose-500 p-1 hover:bg-rose-50 rounded shrink-0"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Assignments Tab */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-3">
                            {assignments.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No assignments yet</p>
                                </div>
                            ) : (
                                assignments.map((assignment) => (
                                    <motion.div
                                        key={assignment.id}
                                        whileHover={{ scale: 1.01 }}
                                        className={`bg-white p-2.5 rounded-xl shadow-sm border ${
                                            assignment.completed ? 'border-green-200 bg-green-50' : 'border-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <button
                                                onClick={() => toggleAssignmentComplete(assignment.id)}
                                                className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                    assignment.completed
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-slate-300'
                                                }`}
                                            >
                                                {assignment.completed && <span className="text-[8px]">✓</span>}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-xs ${
                                                    assignment.completed ? 'text-slate-500 line-through' : 'text-slate-800'
                                                } truncate`}>
                                                    {assignment.title}
                                                </h3>
                                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{assignment.course}</p>
                                                <div className={`text-[10px] font-semibold mt-1 ${getUrgencyColor(assignment.dueDate)}`}>
                                                    Due: {format(parseISO(assignment.dueDate), 'MMM d')}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteAssignment(assignment.id)}
                                                className="text-rose-500 p-1 hover:bg-rose-50 rounded shrink-0"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Deadlines Tab */}
                    {activeTab === 'deadlines' && (
                        <div className="space-y-3">
                            {semester.filter(e => e.type === 'deadline').length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No deadlines set</p>
                                </div>
                            ) : (
                                semester
                                    .filter(e => e.type === 'deadline')
                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                    .map((deadline) => {
                                        const daysLeft = differenceInDays(parseISO(deadline.date), today);
                                        return (
                                            <motion.div
                                                key={deadline.id}
                                                whileHover={{ scale: 1.01 }}
                                                className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-xs text-slate-800 truncate">{deadline.title}</h3>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                                            {format(parseISO(deadline.date), 'MMM d, yyyy')}
                                                        </p>
                                                    </div>
                                                    <div className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 ${
                                                        daysLeft < 0 ? 'bg-gray-100 text-gray-500' :
                                                        daysLeft <= 2 ? 'bg-rose-100 text-rose-600' :
                                                        daysLeft <= 5 ? 'bg-amber-100 text-amber-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                        {daysLeft < 0 ? 'Past' : `${daysLeft}d`}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                            )}
                        </div>
                    )}

                    {/* Exams Tab */}
                    {activeTab === 'exams' && (
                        <div className="space-y-3">
                            {exams.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No exams scheduled</p>
                                </div>
                            ) : (
                                exams
                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                    .map((exam) => {
                                        const daysLeft = differenceInDays(parseISO(exam.date), today);
                                        return (
                                            <motion.div
                                                key={exam.id}
                                                whileHover={{ scale: 1.01 }}
                                                className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-xs text-slate-800 truncate">{exam.title}</h3>
                                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{exam.subject}</p>
                                                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-600">
                                                            <span>{format(parseISO(exam.date), 'MMM d')}</span>
                                                            {exam.time && <span>• {exam.time}</span>}
                                                        </div>
                                                    </div>
                                                    <div className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 ${
                                                        daysLeft < 0 ? 'bg-gray-100 text-gray-500' :
                                                        daysLeft <= 2 ? 'bg-rose-100 text-rose-600' :
                                                        daysLeft <= 7 ? 'bg-amber-100 text-amber-600' :
                                                        'bg-cyan-100 text-cyan-600'
                                                    }`}>
                                                        {daysLeft < 0 ? 'Past' : `${daysLeft}d`}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Floating Add Button */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddForm(true)}
                className="fixed bottom-20 right-4 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-xl flex items-center justify-center z-50"
            >
                <Plus size={20} />
            </motion.button>

            {/* Add Form Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
                        onClick={() => setShowAddForm(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full md:max-w-md md:mx-auto rounded-t-3xl md:rounded-2xl p-4 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-base font-bold text-slate-800">
                                    Add {activeTab === 'classes' ? 'Class' : activeTab === 'assignments' ? 'Assignment' : activeTab === 'exams' ? 'Exam' : 'Deadline'}
                                </h2>
                                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            </div>

                            {activeTab === 'classes' && (
                                <form onSubmit={handleAddClass} className="space-y-2.5">
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        required
                                        value={formData.subject || ''}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <select
                                        value={formData.type || 'lecture'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="lecture">Lecture</option>
                                        <option value="lab">Lab</option>
                                        <option value="tutorial">Tutorial</option>
                                    </select>
                                    <select
                                        required
                                        value={formData.day || ''}
                                        onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select Day</option>
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="time"
                                            placeholder="Start Time"
                                            required
                                            value={formData.startTime || ''}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <input
                                            type="time"
                                            placeholder="End Time"
                                            required
                                            value={formData.endTime || ''}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className="p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Location (optional)"
                                        value={formData.location || ''}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-xs transition-colors"
                                    >
                                        Add Class
                                    </button>
                                </form>
                            )}

                            {activeTab === 'assignments' && (
                                <form onSubmit={handleAddAssignment} className="space-y-2.5">
                                    <input
                                        type="text"
                                        placeholder="Assignment Title"
                                        required
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    {semesterConfig?.courses && semesterConfig.courses.length > 0 ? (
                                        <select
                                            required
                                            value={formData.course || ''}
                                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            <option value="">Select Course</option>
                                            {semesterConfig.courses.map((course, index) => (
                                                <option key={index} value={`${course.code} - ${course.name}`}>
                                                    {course.code} - {course.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-[10px] text-amber-700">
                                            No courses configured. Please setup semester first.
                                        </div>
                                    )}
                                    <input
                                        type="date"
                                        required
                                        value={formData.dueDate || ''}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <textarea
                                        placeholder="Description (optional)"
                                        rows={2}
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!semesterConfig?.courses || semesterConfig.courses.length === 0}
                                        className="w-full p-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-xs transition-colors"
                                    >
                                        Add Assignment
                                    </button>
                                </form>
                            )}

                            {activeTab === 'exams' && (
                                <form onSubmit={handleAddExam} className="space-y-2.5">
                                    <input
                                        type="text"
                                        placeholder="Exam Title"
                                        required
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                    {semesterConfig?.courses && semesterConfig.courses.length > 0 ? (
                                        <select
                                            required
                                            value={formData.subject || ''}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        >
                                            <option value="">Select Subject</option>
                                            {semesterConfig.courses.map((course, index) => (
                                                <option key={index} value={`${course.code} - ${course.name}`}>
                                                    {course.code} - {course.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-2.5 rounded-lg border border-cyan-200 bg-cyan-50 text-[10px] text-cyan-700">
                                            No courses configured. Please setup semester first.
                                        </div>
                                    )}
                                    <input
                                        type="date"
                                        required
                                        value={formData.date || ''}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                    <input
                                        type="time"
                                        placeholder="Time (optional)"
                                        value={formData.time || ''}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!semesterConfig?.courses || semesterConfig.courses.length === 0}
                                        className="w-full p-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-xs transition-colors"
                                    >
                                        Add Exam
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Semester Setup Modal */}
            <AnimatePresence>
                {showSemesterSetup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
                        onClick={() => setShowSemesterSetup(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-4 w-full md:max-w-lg md:mx-auto max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-base font-bold text-slate-800">Semester Setup</h2>
                                <button onClick={() => setShowSemesterSetup(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            </div>
                            <form className="space-y-3" onSubmit={(e) => {
                                e.preventDefault();
                                if (semesterConfig?.name && semesterConfig?.startDate && semesterConfig?.endDate) {
                                    setShowSemesterSetup(false);
                                }
                            }}>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">Semester Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Spring 2025"
                                        required
                                        autoComplete="off"
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={semesterConfig?.name || ''}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            setSemesterConfig({ ...(semesterConfig || {}), name: e.target.value });
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={semesterConfig?.startDate || ''}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setSemesterConfig({ ...(semesterConfig || {}), startDate: e.target.value });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={semesterConfig?.endDate || ''}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setSemesterConfig({ ...(semesterConfig || {}), endDate: e.target.value });
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <label className="block text-[10px] font-semibold text-slate-600 mb-1.5">Courses</label>
                                    <div className="space-y-2">
                                        {(semesterConfig?.courses || []).map((course, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Course Code (e.g., CSE101)"
                                                    autoComplete="off"
                                                    value={course.code || ''}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        const newCourses = [...(semesterConfig?.courses || [])];
                                                        newCourses[index] = { ...course, code: e.target.value };
                                                        setSemesterConfig({ ...(semesterConfig || {}), courses: newCourses });
                                                    }}
                                                    className="flex-1 p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Course Name"
                                                    autoComplete="off"
                                                    value={course.name || ''}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        const newCourses = [...(semesterConfig?.courses || [])];
                                                        newCourses[index] = { ...course, name: e.target.value };
                                                        setSemesterConfig({ ...(semesterConfig || {}), courses: newCourses });
                                                    }}
                                                    className="flex-1 p-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newCourses = (semesterConfig?.courses || []).filter((_, i) => i !== index);
                                                        setSemesterConfig({ ...(semesterConfig || {}), courses: newCourses });
                                                    }}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newCourses = [...(semesterConfig?.courses || []), { code: '', name: '' }];
                                                setSemesterConfig({ ...(semesterConfig || {}), courses: newCourses });
                                            }}
                                            className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                        >
                                            + Add Course
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full p-3 bg-indigo-500 text-white rounded-xl font-semibold text-sm mt-4"
                                >
                                    Save Semester Setup
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Semester;
