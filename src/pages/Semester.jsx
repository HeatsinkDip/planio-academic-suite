import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Calendar, Clock, Plus, X, ChevronDown, ChevronUp, 
    Settings, AlertCircle, Award, CheckCircle, XCircle, History,
    Edit, Trash2, Save, GraduationCap, FileText
} from 'lucide-react';
import { 
    format, addDays, startOfWeek, isSameDay, differenceInDays, parseISO,
    isWithinInterval
} from 'date-fns';
import { useApp } from '../context/AppContext';

const Semester = () => {
    const {
        timetable, assignments, exams, semester,
        addTimetable, addAssignment, addExam,
        updateAssignment, deleteTimetable, deleteAssignment, deleteExam,
        semesterConfig, setSemesterConfig
    } = useApp();

    // Main navigation
    const [mainView, setMainView] = useState('current'); // current, history
    const [activeTab, setActiveTab] = useState('overview');
    
    // Modals
    const [showSemesterSetup, setShowSemesterSetup] = useState(false);
    const [showAddClass, setShowAddClass] = useState(false);
    const [showAddAssignment, setShowAddAssignment] = useState(false);
    const [showAddExam, setShowAddExam] = useState(false);
    const [showAddDeadline, setShowAddDeadline] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    
    // Form states
    const [classForm, setClassForm] = useState({});
    const [assignmentForm, setAssignmentForm] = useState({});
    const [examForm, setExamForm] = useState({});
    const [deadlineForm, setDeadlineForm] = useState({});
    const [semesterForm, setSemesterForm] = useState({
        name: '',
        startDate: '',
        endDate: '',
        courses: []
    });
    
    // Auto-schedule state
    const [autoScheduleMode, setAutoScheduleMode] = useState(false);
    const [autoScheduleData, setAutoScheduleData] = useState([]);
    
    // History
    const [selectedHistorySemester, setSelectedHistorySemester] = useState(null);
    const [historyView, setHistoryView] = useState('summary');
    
    // Initialize semester form when modal opens
    React.useEffect(() => {
        if (showSemesterSetup) {
            setSemesterForm(semesterConfig || {
                name: '',
                startDate: '',
                endDate: '',
                courses: []
            });
        }
    }, [showSemesterSetup, semesterConfig]);

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

    // Calculate statistics
    const stats = {
        totalClasses: timetable.length,
        totalAssignments: assignments.length,
        completedAssignments: assignments.filter(a => a.completed).length,
        totalExams: exams.length,
        totalDeadlines: semester.filter(e => e.type === 'deadline').length,
        completionRate: assignments.length > 0 
            ? Math.round((assignments.filter(a => a.completed).length / assignments.length) * 100) 
            : 0
    };

    // Get urgency color for dates
    const getUrgencyColor = (dateStr) => {
        const daysLeft = differenceInDays(parseISO(dateStr), today);
        if (daysLeft < 0) return 'text-gray-500';
        if (daysLeft <= 2) return 'text-rose-600';
        if (daysLeft <= 5) return 'text-amber-600';
        return 'text-green-600';
    };

    // Handle semester setup submission
    const handleSemesterSetup = (e) => {
        e.preventDefault();
        setSemesterConfig(semesterForm);
        setShowSemesterSetup(false);
    };

    // Handle add class (manual)
    const handleAddClass = (e) => {
        e.preventDefault();
        addTimetable({
            ...classForm,
            id: Date.now().toString(),
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
        setClassForm({});
        setShowAddClass(false);
    };

    // Handle auto-schedule
    const generateAutoSchedule = () => {
        if (!semesterForm.courses || semesterForm.courses.length === 0) {
            alert('Please add courses first in Semester Setup');
            return;
        }
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const timeSlots = [
            { start: '09:00', end: '10:30' },
            { start: '10:45', end: '12:15' },
            { start: '13:00', end: '14:30' },
            { start: '14:45', end: '16:15' }
        ];
        
        const schedule = [];
        let dayIndex = 0;
        let slotIndex = 0;
        
        semesterForm.courses.forEach(course => {
            // Add 2 lectures per course
            for (let i = 0; i < 2; i++) {
                schedule.push({
                    subject: `${course.code} - ${course.name}`,
                    type: 'Lecture',
                    day: days[dayIndex],
                    startTime: timeSlots[slotIndex].start,
                    endTime: timeSlots[slotIndex].end,
                    location: 'TBA'
                });
                
                slotIndex++;
                if (slotIndex >= timeSlots.length) {
                    slotIndex = 0;
                    dayIndex++;
                    if (dayIndex >= days.length) dayIndex = 0;
                }
            }
        });
        
        setAutoScheduleData(schedule);
        setAutoScheduleMode(true);
    };

    const applyAutoSchedule = () => {
        autoScheduleData.forEach(cls => {
            addTimetable({
                ...cls,
                id: Date.now().toString() + Math.random(),
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        });
        setAutoScheduleMode(false);
        setAutoScheduleData([]);
    };

    // Handle add assignment
    const handleAddAssignment = (e) => {
        e.preventDefault();
        addAssignment({
            ...assignmentForm,
            id: Date.now().toString(),
            completed: false
        });
        setAssignmentForm({});
        setShowAddAssignment(false);
    };

    // Handle add exam
    const handleAddExam = (e) => {
        e.preventDefault();
        addExam({
            ...examForm,
            id: Date.now().toString()
        });
        setExamForm({});
        setShowAddExam(false);
    };

    // Toggle assignment completion
    const toggleAssignmentComplete = (id) => {
        const assignment = assignments.find(a => a.id === id);
        updateAssignment(id, { ...assignment, completed: !assignment.completed });
    };

    // Tabs configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'classes', label: 'Classes', icon: Calendar },
        { id: 'assignments', label: 'Assignments', icon: FileText },
        { id: 'exams', label: 'Exams', icon: Clock },
        { id: 'deadlines', label: 'Deadlines', icon: AlertCircle }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 pt-12 pb-20"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Academic Semester</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {semesterConfig?.name || 'No active semester'}
                        {semesterConfig?.startDate && semesterConfig?.endDate && (
                            <span className="ml-1">
                                • {format(parseISO(semesterConfig.startDate), 'MMM d')} - {format(parseISO(semesterConfig.endDate), 'MMM d, yyyy')}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setShowSemesterSetup(true)}
                    className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                >
                    <Settings size={18} />
                </button>
            </div>

            {/* Main View Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMainView('current')}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-semibold ${
                        mainView === 'current'
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-white text-slate-600 border border-gray-200'
                    }`}
                >
                    <GraduationCap size={16} />
                    Current Semester
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMainView('history')}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-semibold ${
                        mainView === 'history'
                            ? 'bg-violet-500 text-white shadow-lg'
                            : 'bg-white text-slate-600 border border-gray-200'
                    }`}
                >
                    <History size={16} />
                    History
                </motion.button>
            </div>

            {/* CURRENT SEMESTER VIEW */}
            {mainView === 'current' && (
                <>
                    {/* Week Calendar */}
                    <motion.div className="mb-4">
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-200 mb-2"
                        >
                            <span className="text-sm font-semibold text-slate-700">This Week</span>
                            {showCalendar ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <AnimatePresence>
                            {showCalendar && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-7 gap-1.5 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
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
                                                        {events.classes > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                        {events.assignments > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                                        {events.exams > 0 && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
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
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'bg-indigo-500 text-white shadow-lg'
                                            : 'bg-white text-slate-600 shadow-sm border border-gray-200'
                                    }`}
                                >
                                    <Icon size={14} />
                                    <span className="text-xs font-semibold">{tab.label}</span>
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
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-4">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <div className="text-3xl font-bold text-indigo-600">{stats.totalClasses}</div>
                                            <div className="text-xs text-slate-500 mt-1">Total Classes</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <div className="text-3xl font-bold text-amber-600">{stats.totalAssignments}</div>
                                            <div className="text-xs text-slate-500 mt-1">Assignments</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <div className="text-3xl font-bold text-cyan-600">{stats.totalExams}</div>
                                            <div className="text-xs text-slate-500 mt-1">Exams</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <div className="text-3xl font-bold text-green-600">{stats.completionRate}%</div>
                                            <div className="text-xs text-slate-500 mt-1">Completed</div>
                                        </div>
                                    </div>

                                    {/* Enrolled Courses */}
                                    {semesterConfig?.courses && semesterConfig.courses.length > 0 && (
                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <h3 className="text-sm font-bold text-slate-800 mb-3">Enrolled Courses</h3>
                                            <div className="space-y-2">
                                                {semesterConfig.courses.map((course, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{course.code}</p>
                                                            <p className="text-xs text-slate-500">{course.name}</p>
                                                        </div>
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setShowAddClass(true)}
                                            className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                                        >
                                            <Plus size={16} />
                                            Add Class
                                        </button>
                                        <button
                                            onClick={() => setShowAddAssignment(true)}
                                            className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                                        >
                                            <Plus size={16} />
                                            Add Assignment
                                        </button>
                                        <button
                                            onClick={() => setShowAddExam(true)}
                                            className="p-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                                        >
                                            <Plus size={16} />
                                            Add Exam
                                        </button>
                                        <button
                                            onClick={generateAutoSchedule}
                                            className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                                        >
                                            <Calendar size={16} />
                                            Auto Schedule
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Classes Tab */}
                            {activeTab === 'classes' && (
                                <div className="space-y-3">
                                    {timetable.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">No classes added yet</p>
                                            <button
                                                onClick={() => setShowAddClass(true)}
                                                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                                            >
                                                Add Your First Class
                                            </button>
                                        </div>
                                    ) : (
                                        timetable.map((classItem) => (
                                            <motion.div
                                                key={classItem.id}
                                                whileHover={{ scale: 1.01 }}
                                                className="bg-white p-3 rounded-xl shadow-sm border border-gray-200"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full shrink-0"
                                                                style={{ backgroundColor: classItem.color }}
                                                            />
                                                            <h3 className="font-bold text-sm text-slate-800 truncate">{classItem.subject}</h3>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">{classItem.type} • {classItem.day}</p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {classItem.startTime} - {classItem.endTime}
                                                            </span>
                                                            {classItem.location && (
                                                                <span className="text-slate-400">{classItem.location}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteTimetable(classItem.id)}
                                                        className="text-rose-500 p-1.5 hover:bg-rose-50 rounded shrink-0"
                                                    >
                                                        <Trash2 size={14} />
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
                                        <div className="text-center py-12 text-slate-400">
                                            <FileText size={48} className="mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">No assignments yet</p>
                                            <button
                                                onClick={() => setShowAddAssignment(true)}
                                                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold"
                                            >
                                                Add Your First Assignment
                                            </button>
                                        </div>
                                    ) : (
                                        assignments.map((assignment) => (
                                            <motion.div
                                                key={assignment.id}
                                                whileHover={{ scale: 1.01 }}
                                                className={`bg-white p-3 rounded-xl shadow-sm border ${
                                                    assignment.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        onClick={() => toggleAssignmentComplete(assignment.id)}
                                                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                            assignment.completed
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'border-slate-300'
                                                        }`}
                                                    >
                                                        {assignment.completed && <CheckCircle size={12} />}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={`font-bold text-sm ${
                                                            assignment.completed ? 'text-slate-500 line-through' : 'text-slate-800'
                                                        } truncate`}>
                                                            {assignment.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 mt-1">{assignment.course}</p>
                                                        <div className={`text-xs font-semibold mt-2 ${getUrgencyColor(assignment.dueDate)}`}>
                                                            Due: {format(parseISO(assignment.dueDate), 'MMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteAssignment(assignment.id)}
                                                        className="text-rose-500 p-1.5 hover:bg-rose-50 rounded shrink-0"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Exams Tab */}
                            {activeTab === 'exams' && (
                                <div className="space-y-3">
                                    {exams.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <Clock size={48} className="mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">No exams scheduled</p>
                                            <button
                                                onClick={() => setShowAddExam(true)}
                                                className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                                            >
                                                Add Your First Exam
                                            </button>
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
                                                        className="bg-white p-3 rounded-xl shadow-sm border border-gray-200"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-sm text-slate-800 truncate">{exam.title}</h3>
                                                                <p className="text-xs text-slate-500 mt-1">{exam.subject}</p>
                                                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                                                                    <span>{format(parseISO(exam.date), 'MMM d, yyyy')}</span>
                                                                    {exam.time && <span>• {exam.time}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`text-xs font-bold px-2.5 py-1 rounded shrink-0 ${
                                                                    daysLeft < 0 ? 'bg-gray-100 text-gray-500' :
                                                                    daysLeft <= 2 ? 'bg-rose-100 text-rose-600' :
                                                                    daysLeft <= 7 ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-cyan-100 text-cyan-600'
                                                                }`}>
                                                                    {daysLeft < 0 ? 'Past' : `${daysLeft}d`}
                                                                </div>
                                                                <button
                                                                    onClick={() => deleteExam(exam.id)}
                                                                    className="text-rose-500 p-1.5 hover:bg-rose-50 rounded"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                    )}
                                </div>
                            )}

                            {/* Deadlines Tab */}
                            {activeTab === 'deadlines' && (
                                <div className="space-y-3">
                                    {semester.filter(e => e.type === 'deadline').length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
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
                                                        className="bg-white p-3 rounded-xl shadow-sm border border-gray-200"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-sm text-slate-800 truncate">{deadline.title}</h3>
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    {format(parseISO(deadline.date), 'MMM d, yyyy')}
                                                                </p>
                                                            </div>
                                                            <div className={`text-xs font-bold px-2.5 py-1 rounded shrink-0 ${
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
                        </motion.div>
                    </AnimatePresence>
                </>
            )}

            {/* HISTORY VIEW */}
            {mainView === 'history' && (
                <div className="space-y-4">
                    <div className="text-center py-12 text-slate-400">
                        <History size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-semibold mb-2">Semester History</p>
                        <p className="text-xs">Past semester data will appear here</p>
                    </div>
                </div>
            )}

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
                            className="bg-white rounded-t-3xl md:rounded-2xl p-5 w-full md:max-w-lg md:mx-auto max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Semester Setup</h2>
                                <button onClick={() => setShowSemesterSetup(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSemesterSetup} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Semester Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Spring 2025"
                                        required
                                        autoComplete="off"
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={semesterForm.name}
                                        onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={semesterForm.startDate}
                                            onChange={(e) => setSemesterForm({ ...semesterForm, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={semesterForm.endDate}
                                            onChange={(e) => setSemesterForm({ ...semesterForm, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Courses</label>
                                    <div className="space-y-2">
                                        {(semesterForm.courses || []).map((course, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Course Code"
                                                    autoComplete="off"
                                                    value={course.code}
                                                    onChange={(e) => {
                                                        const newCourses = [...semesterForm.courses];
                                                        newCourses[index].code = e.target.value;
                                                        setSemesterForm({ ...semesterForm, courses: newCourses });
                                                    }}
                                                    className="flex-1 p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Course Name"
                                                    autoComplete="off"
                                                    value={course.name}
                                                    onChange={(e) => {
                                                        const newCourses = [...semesterForm.courses];
                                                        newCourses[index].name = e.target.value;
                                                        setSemesterForm({ ...semesterForm, courses: newCourses });
                                                    }}
                                                    className="flex-1 p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newCourses = semesterForm.courses.filter((_, i) => i !== index);
                                                        setSemesterForm({ ...semesterForm, courses: newCourses });
                                                    }}
                                                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSemesterForm({
                                                    ...semesterForm,
                                                    courses: [...(semesterForm.courses || []), { code: '', name: '' }]
                                                });
                                            }}
                                            className="w-full p-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                        >
                                            + Add Course
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full p-3 bg-indigo-500 text-white rounded-xl font-semibold text-sm mt-4 hover:bg-indigo-600 transition-colors"
                                >
                                    Save Semester Setup
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Class Modal */}
            <AnimatePresence>
                {showAddClass && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
                        onClick={() => setShowAddClass(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-5 w-full md:max-w-md md:mx-auto max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Add Class</h2>
                                <button onClick={() => setShowAddClass(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddClass} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="Course name"
                                        required
                                        value={classForm.subject || ''}
                                        onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Type</label>
                                    <select
                                        value={classForm.type || 'Lecture'}
                                        onChange={(e) => setClassForm({ ...classForm, type: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Lecture">Lecture</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Tutorial">Tutorial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Day</label>
                                    <select
                                        required
                                        value={classForm.day || ''}
                                        onChange={(e) => setClassForm({ ...classForm, day: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Day</option>
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={classForm.startTime || ''}
                                            onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={classForm.endTime || ''}
                                            onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Location (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Room number or location"
                                        value={classForm.location || ''}
                                        onChange={(e) => setClassForm({ ...classForm, location: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Add Class
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Assignment Modal */}
            <AnimatePresence>
                {showAddAssignment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
                        onClick={() => setShowAddAssignment(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-5 w-full md:max-w-md md:mx-auto max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Add Assignment</h2>
                                <button onClick={() => setShowAddAssignment(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddAssignment} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Assignment title"
                                        required
                                        value={assignmentForm.title || ''}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Course</label>
                                    {semesterConfig?.courses && semesterConfig.courses.length > 0 ? (
                                        <select
                                            required
                                            value={assignmentForm.course || ''}
                                            onChange={(e) => setAssignmentForm({ ...assignmentForm, course: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            <option value="">Select Course</option>
                                            {semesterConfig.courses.map((course, index) => (
                                                <option key={index} value={`${course.code} - ${course.name}`}>
                                                    {course.code} - {course.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-700">
                                            No courses configured. Please setup semester first.
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={assignmentForm.dueDate || ''}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Description (optional)</label>
                                    <textarea
                                        placeholder="Assignment details"
                                        rows={3}
                                        value={assignmentForm.description || ''}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!semesterConfig?.courses || semesterConfig.courses.length === 0}
                                    className="w-full p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Add Assignment
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Exam Modal */}
            <AnimatePresence>
                {showAddExam && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
                        onClick={() => setShowAddExam(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-5 w-full md:max-w-md md:mx-auto max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Add Exam</h2>
                                <button onClick={() => setShowAddExam(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddExam} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Exam title"
                                        required
                                        value={examForm.title || ''}
                                        onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Subject</label>
                                    {semesterConfig?.courses && semesterConfig.courses.length > 0 ? (
                                        <select
                                            required
                                            value={examForm.subject || ''}
                                            onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        >
                                            <option value="">Select Subject</option>
                                            {semesterConfig.courses.map((course, index) => (
                                                <option key={index} value={`${course.code} - ${course.name}`}>
                                                    {course.code} - {course.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-3 rounded-lg border border-cyan-200 bg-cyan-50 text-xs text-cyan-700">
                                            No courses configured. Please setup semester first.
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={examForm.date || ''}
                                        onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Time (optional)</label>
                                    <input
                                        type="time"
                                        value={examForm.time || ''}
                                        onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!semesterConfig?.courses || semesterConfig.courses.length === 0}
                                    className="w-full p-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Add Exam
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auto Schedule Modal */}
            <AnimatePresence>
                {autoScheduleMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
                        onClick={() => setAutoScheduleMode(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-5 w-full md:max-w-2xl md:mx-auto max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Auto-Generated Schedule</h2>
                                    <p className="text-xs text-slate-500 mt-1">Review and apply the schedule</p>
                                </div>
                                <button onClick={() => setAutoScheduleMode(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4">
                                {autoScheduleData.map((cls, index) => (
                                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm text-slate-800">{cls.subject}</h3>
                                                <p className="text-xs text-slate-500 mt-1">{cls.type} • {cls.day}</p>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    <Clock size={10} className="inline mr-1" />
                                                    {cls.startTime} - {cls.endTime}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAutoScheduleMode(false)}
                                    className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyAutoSchedule}
                                    className="flex-1 p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Apply Schedule
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Semester;
