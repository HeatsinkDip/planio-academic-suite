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
        timetable, assignments, exams, deadlines, semester,
        addTimetable, addAssignment, addExam, addDeadline,
        updateAssignment, updateDeadline,
        deleteTimetable, deleteAssignment, deleteExam, deleteDeadline,
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
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
    
    // Tabs configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'classes', label: 'Classes', icon: Calendar },
        { id: 'assignments', label: 'Assignments', icon: FileText },
        { id: 'exams', label: 'Exams', icon: Clock },
        { id: 'deadlines', label: 'Deadlines', icon: AlertCircle }
    ];
    
    // Success notification
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Initialize semester form when modal opens
    React.useEffect(() => {
        if (showSemesterSetup && semesterConfig) {
            // Format dates to YYYY-MM-DD for date inputs
            const formatDateForInput = (dateStr) => {
                if (!dateStr) return '';
                try {
                    const date = new Date(dateStr);
                    return format(date, 'yyyy-MM-dd');
                } catch (e) {
                    return '';
                }
            };

            setSemesterForm({
                _id: semesterConfig._id, // Include _id for updates
                name: semesterConfig.name || '',
                startDate: formatDateForInput(semesterConfig.startDate),
                endDate: formatDateForInput(semesterConfig.endDate),
                courses: semesterConfig.courses || []
            });
        } else if (showSemesterSetup && !semesterConfig) {
            setSemesterForm({
                name: '',
                startDate: '',
                endDate: '',
                courses: []
            });
        }
    }, [showSemesterSetup, semesterConfig]);
    
    // Auto-hide success message
    React.useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // Get week dates
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Get unique courses from timetable
    const getUniqueCourses = () => {
        const coursesMap = new Map();
        timetable.forEach(cls => {
            const key = `${cls.code}-${cls.name}`;
            if (!coursesMap.has(key)) {
                coursesMap.set(key, {
                    code: cls.code,
                    name: cls.name,
                    displayName: `${cls.code} - ${cls.name}`
                });
            }
        });
        return Array.from(coursesMap.values());
    };

    const uniqueCourses = getUniqueCourses();

    // Get events for calendar dots
    const getEventsForDay = (day) => {
        const dayStr = format(day, 'EEEE');
        const dateStr = format(day, 'yyyy-MM-dd');
        
        const classes = timetable.filter(c => c.day === dayStr);
        const dayAssignments = assignments.filter(a => {
            if (!a.dueDate) return false;
            return a.dueDate === dateStr || format(parseISO(a.dueDate), 'yyyy-MM-dd') === dateStr;
        });
        const dayExams = exams.filter(e => {
            if (!e.date) return false;
            return e.date === dateStr || format(parseISO(e.date), 'yyyy-MM-dd') === dateStr;
        });
        
        return { 
            classes: classes.length, 
            assignments: dayAssignments.length, 
            exams: dayExams.length,
            items: { classes, assignments: dayAssignments, exams: dayExams }
        };
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
    const handleSemesterSetup = async (e) => {
        e.preventDefault();
        try {
            await setSemesterConfig(semesterForm);
            setShowSemesterSetup(false);
            setSuccessMessage('Semester configuration saved successfully!');
            setShowSuccess(true);
        } catch (error) {
            console.error('❌ Error saving semester configuration:', error);
            alert('Failed to save semester configuration. Please try again.');
        }
    };

    // Handle add class (manual)
    const handleAddClass = async (e) => {
        e.preventDefault();
        
        // Check if semester exists
        if (!semesterConfig || !semesterConfig._id) {
            alert('⚠️ Please create a semester first!\n\nGo to Settings (⚙️) → Fill in Semester Information → Save');
            setShowAddClass(false);
            setShowSemesterSetup(true);
            return;
        }
        
        // Validate that at least one day is selected
        if (!classForm.selectedDays || classForm.selectedDays.length === 0) {
            alert('Please select at least one day');
            return;
        }
        
        try {
            // Create a class entry for each selected day
            const { selectedDays, ...classData } = classForm;
            for (const day of selectedDays) {
                await addTimetable({
                    ...classData,
                    day: day,
                    subject: `${classData.code} - ${classData.name}`,
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`
                });
            }
            setClassForm({});
            setShowAddClass(false);
            setSuccessMessage(`Class added successfully for ${selectedDays.length} day(s)!`);
            setShowSuccess(true);
        } catch (error) {
            console.error('Error adding class:', error);
            if (error.message.includes('semester')) {
                alert('⚠️ ' + error.message);
                setShowAddClass(false);
                setShowSemesterSetup(true);
            } else {
                alert('Failed to add class. Please try again.');
            }
        }
    };

    // Handle auto-schedule - Shows existing schedule for review
    const generateAutoSchedule = () => {
        if (timetable.length === 0) {
            alert('Please add classes first using the "Add Class" button or auto-fill feature');
            return;
        }
        
        // Show existing timetable as auto-schedule review
        setAutoScheduleData(timetable.map(cls => ({
            subject: cls.subject || `${cls.code} - ${cls.name}`,
            type: cls.type || 'Lecture',
            day: cls.day,
            startTime: cls.startTime,
            endTime: cls.endTime,
            location: cls.location || 'TBA'
        })));
        setAutoScheduleMode(true);
    };

    const applyAutoSchedule = async () => {
        try {
            for (const cls of autoScheduleData) {
                await addTimetable({
                    ...cls,
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`
                });
            }
            setAutoScheduleMode(false);
            setAutoScheduleData([]);
            setSuccessMessage(`${autoScheduleData.length} classes added to schedule!`);
            setShowSuccess(true);
        } catch (error) {
            console.error('Error applying auto schedule:', error);
            alert('Failed to apply schedule. Please try again.');
        }
    };

    // Handle add assignment
    const handleAddAssignment = async (e) => {
        e.preventDefault();
        
        // Check if semester exists
        if (!semesterConfig || !semesterConfig._id) {
            alert('⚠️ Please create a semester first!\n\nGo to Settings (⚙️) → Fill in Semester Information → Save');
            setShowAddAssignment(false);
            setShowSemesterSetup(true);
            return;
        }
        
        try {
            await addAssignment({
                ...assignmentForm,
                completed: false
            });
            setAssignmentForm({});
            setShowAddAssignment(false);
            setSuccessMessage('Assignment added successfully!');
            setShowSuccess(true);
        } catch (error) {
            console.error('Error adding assignment:', error);
            if (error.message.includes('semester')) {
                alert('⚠️ ' + error.message);
                setShowAddAssignment(false);
                setShowSemesterSetup(true);
            } else {
                alert('Failed to add assignment. Please try again.');
            }
        }
    };    // Handle add exam
    const handleAddExam = async (e) => {
        e.preventDefault();
        
        // Check if semester exists
        if (!semesterConfig || !semesterConfig._id) {
            alert('⚠️ Please create a semester first!\n\nGo to Settings (⚙️) → Fill in Semester Information → Save');
            setShowAddExam(false);
            setShowSemesterSetup(true);
            return;
        }
        
        try {
            await addExam({
                ...examForm
            });
            setExamForm({});
            setShowAddExam(false);
            setSuccessMessage('Exam added successfully!');
            setShowSuccess(true);
        } catch (error) {
            console.error('Error adding exam:', error);
            if (error.message.includes('semester')) {
                alert('⚠️ ' + error.message);
                setShowAddExam(false);
                setShowSemesterSetup(true);
            } else {
                alert('Failed to add exam. Please try again.');
            }
        }
    };

    // Handle add deadline
    const handleAddDeadline = async (e) => {
        e.preventDefault();
        
        // Check if semester exists
        if (!semesterConfig || !semesterConfig._id) {
            alert('⚠️ Please create a semester first!\n\nGo to Settings (⚙️) → Fill in Semester Information → Save');
            setShowAddDeadline(false);
            setShowSemesterSetup(true);
            return;
        }
        
        try {
            await addDeadline({
                ...deadlineForm,
                completed: false
            });
            setDeadlineForm({});
            setShowAddDeadline(false);
            setSuccessMessage('Deadline added successfully!');
            setShowSuccess(true);
        } catch (error) {
            console.error('Error adding deadline:', error);
            if (error.message.includes('semester')) {
                alert('⚠️ ' + error.message);
                setShowAddDeadline(false);
                setShowSemesterSetup(true);
            } else {
                alert('Failed to add deadline. Please try again.');
            }
        }
    };

    // Toggle assignment completion
    const toggleAssignmentComplete = (id) => {
        const assignment = assignments.find(a => (a._id || a.id) === id);
        if (assignment) {
            updateAssignment(id, { ...assignment, completed: !assignment.completed });
        }
    };

    // Parse auto-fill text
    const [autoFillText, setAutoFillText] = useState('');
    const [parsedClasses, setParsedClasses] = useState([]);
    const [showAutoFillPreview, setShowAutoFillPreview] = useState(false);
    
    const parseAutoFillText = (text) => {
        const lines = text.trim().split('\n');
        const parsed = [];
        
        lines.forEach((line, lineIndex) => {
            const parts = line.trim().split(/\t+/); // Split by one or more tabs
            
            if (parts.length >= 4) {
                const [code, name, section, room, timeInfo, ...rest] = parts;
                
                // Parse time info (e.g., "MW:13:00-14:30" or "S:18:30-21:30")
                let days = [];
                let startTime = '';
                let endTime = '';
                
                if (timeInfo && timeInfo.includes(':')) {
                    // Find the first colon position to separate days from time
                    const firstColonIndex = timeInfo.indexOf(':');
                    const dayPart = timeInfo.substring(0, firstColonIndex);
                    const timePart = timeInfo.substring(firstColonIndex + 1);
                    
                    // Convert day codes to full names
                    const dayMap = { 
                        M: 'Monday', 
                        T: 'Tuesday', 
                        W: 'Wednesday', 
                        R: 'Thursday', 
                        F: 'Friday', 
                        S: 'Sunday', 
                        A: 'Saturday' ,
                        Mon: 'Monday',
                        Tue: 'Tuesday',
                        Wed: 'Wednesday',
                        Thu: 'Thursday',
                        Fri: 'Friday',
                        Sat: 'Saturday',
                        Sun: 'Sunday'
                    };
                    days = dayPart.split('').map(d => dayMap[d] || d).filter(Boolean);
                    
                    // Parse time range (e.g., "13:00-14:30")
                    if (timePart && timePart.includes('-')) {
                        [startTime, endTime] = timePart.split('-').map(t => t.trim());
                    }
                }
                
                // Create class entry for each day
                if (days.length > 0) {
                    days.forEach(day => {
                        parsed.push({
                            subject: `${code.trim()} - ${name.trim()}`,
                            code: code.trim(),
                            name: name.trim(),
                            section: section.trim(),
                            type: name.toLowerCase().includes('lab') ? 'Lab' : 'Lecture',
                            day: day,
                            startTime: startTime,
                            endTime: endTime,
                            location: room.trim(),
                            faculty: ''
                        });
                    });
                }
            }
        });
        
        return parsed;
    };
    
    const handleAutoFillParse = () => {
        const parsed = parseAutoFillText(autoFillText);
        setParsedClasses(parsed);
        setShowAutoFillPreview(true);
    };
    
    const applyParsedClasses = async () => {
        // Check if semester exists
        if (!semesterConfig || !semesterConfig._id) {
            alert('⚠️ Please create a semester first!\n\nGo to Settings (⚙️) → Fill in Semester Information → Save');
            setShowAutoFillPreview(false);
            setShowAddClass(false);
            setShowSemesterSetup(true);
            return;
        }
        
        try {
            for (const cls of parsedClasses) {
                await addTimetable({
                    ...cls,
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`
                });
            }
            setAutoFillText('');
            setParsedClasses([]);
            setShowAutoFillPreview(false);
            setShowAddClass(false);
            setSuccessMessage(`${parsedClasses.length} classes added successfully!`);
            setShowSuccess(true);
        } catch (error) {
            console.error('Error adding parsed classes:', error);
            if (error.message.includes('semester')) {
                alert('⚠️ ' + error.message);
                setShowAutoFillPreview(false);
                setShowAddClass(false);
                setShowSemesterSetup(true);
            } else {
                alert('Failed to add classes. Please try again or Add Manually.');
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 pt-12 pb-20"
        >
            {/* Success Notification */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
                    >
                        <CheckCircle size={20} />
                        <span className="text-sm font-semibold">{successMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap text-xs font-semibold ${
                                        isActive
                                            ? 'bg-indigo-500 text-white shadow-lg'
                                            : 'bg-white text-slate-600 shadow-sm border border-gray-200'
                                    }`}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
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
                                <div className="space-y-3">
                                    {/* Today's Classes Section */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <BookOpen size={16} className="text-blue-500" />
                                                Today's Classes
                                            </h3>
                                            <button
                                                onClick={() => setActiveTab('classes')}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                View All →
                                            </button>
                                        </div>
                                <div className="space-y-2">
                                    {timetable.filter(c => c.day === format(today, 'EEEE')).length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-4">Hurray! No classes today</p>
                                    ) : (
                                        timetable.filter(c => c.day === format(today, 'EEEE')).slice(0, 3).map((classItem) => (
                                            <div key={classItem.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                <div
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: classItem.color }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800 truncate">{classItem.subject}</p>
                                                    <p className="text-[10px] text-slate-500">{classItem.startTime} - {classItem.endTime}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                                    {/* Upcoming Assignments */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <FileText size={16} className="text-amber-500" />
                                                Upcoming Assignments
                                            </h3>
                                            <button
                                                onClick={() => setActiveTab('assignments')}
                                                className="text-xs text-amber-600 hover:text-amber-700"
                                            >
                                                View All →
                                            </button>
                                        </div>
                                <div className="space-y-2">
                                    {assignments.filter(a => !a.completed).slice(0, 3).length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-4">No pending assignments</p>
                                    ) : (
                                        assignments.filter(a => !a.completed).slice(0, 3).map((assignment) => (
                                            <div key={assignment.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800 truncate">{assignment.title}</p>
                                                    <p className={`text-[10px] font-semibold ${getUrgencyColor(assignment.dueDate)}`}>
                                                        Due: {format(parseISO(assignment.dueDate), 'MMM d')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                                    {/* Upcoming Exams */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <Clock size={16} className="text-cyan-500" />
                                                Upcoming Exams
                                            </h3>
                                            <button
                                                onClick={() => setActiveTab('exams')}
                                                className="text-xs text-cyan-600 hover:text-cyan-700"
                                            >
                                                View All →
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {exams.slice(0, 3).length === 0 ? (
                                                <p className="text-xs text-slate-400 text-center py-4">No upcoming exams</p>
                                            ) : (
                                                exams
                                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                    .slice(0, 3)
                                                    .map((exam) => {
                                                        const daysLeft = differenceInDays(parseISO(exam.date), today);
                                                        return (
                                                            <div key={exam.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-slate-800 truncate">{exam.title}</p>
                                                                    <p className="text-[10px] text-slate-500">{format(parseISO(exam.date), 'MMM d, yyyy')}</p>
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
                                                        );
                                                    })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Classes Tab */}
                            {activeTab === 'classes' && (
                                <div className="space-y-3 relative">
                                    {/* Floating Add Button */}
                                    {timetable.length > 0 && (
                                        <button
                                            onClick={() => setShowAddClass(true)}
                                            className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all hover:scale-110"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    )}
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
                                                key={classItem._id || classItem.id}
                                                whileHover={{ scale: 1.01 }}
                                                className="bg-white p-3 rounded-xl shadow-sm border border-gray-200"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div
                                                                className="w-3 h-3 rounded-full shrink-0"
                                                                style={{ backgroundColor: classItem.color }}
                                                            />
                                                            <h3 className="font-bold text-sm text-slate-800 truncate">
                                                                {classItem.code || classItem.subject}
                                                                {classItem.section && <span className="text-xs ml-1 text-slate-500">Sec {classItem.section}</span>}
                                                            </h3>
                                                        </div>
                                                        {classItem.name && (
                                                            <p className="text-xs text-slate-600 mb-1">{classItem.name}</p>
                                                        )}
                                                        <p className="text-xs text-slate-500">{classItem.type} • {classItem.day}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-600">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {classItem.startTime} - {classItem.endTime}
                                                            </span>
                                                            {classItem.location && (
                                                                <span className="text-slate-500">📍 {classItem.location}</span>
                                                            )}
                                                            {classItem.faculty && (
                                                                <span className="text-slate-500">👤 {classItem.faculty}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setItemToDelete({ 
                                                                type: 'class', 
                                                                id: classItem._id || classItem.id, 
                                                                name: classItem.code || classItem.subject 
                                                            });
                                                            setShowDeleteConfirm(true);
                                                        }}
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
                                <div className="space-y-3 relative">
                                    {/* Floating Add Button */}
                                    {assignments.length > 0 && (
                                        <button
                                            onClick={() => setShowAddAssignment(true)}
                                            className="fixed bottom-24 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all hover:scale-110"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    )}
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
                                                key={assignment._id || assignment.id}
                                                whileHover={{ scale: 1.01 }}
                                                className={`bg-white p-3 rounded-xl shadow-sm border ${
                                                    assignment.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        onClick={() => toggleAssignmentComplete(assignment._id || assignment.id)}
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
                                                        onClick={() => deleteAssignment(assignment._id || assignment.id)}
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
                                <div className="space-y-3 relative">
                                    {/* Floating Add Button */}
                                    {exams.length > 0 && (
                                        <button
                                            onClick={() => setShowAddExam(true)}
                                            className="fixed bottom-24 right-6 w-14 h-14 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all hover:scale-110"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    )}
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
                                                        key={exam._id || exam.id}
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
                                                                    onClick={() => deleteExam(exam._id || exam.id)}
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
                                <div className="space-y-3 relative">
                                    <button
                                        onClick={() => setShowAddDeadline(true)}
                                        className="w-full p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:from-rose-600 hover:to-pink-600 transition-all"
                                    >
                                        <Plus size={18} />
                                        Add Deadline
                                    </button>

                                    {deadlines.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">No deadlines yet</p>
                                            <p className="text-xs mt-1">Click the button above to add your first deadline</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {deadlines.map((deadline) => (
                                                <motion.div
                                                    key={deadline._id || deadline.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`bg-white rounded-xl p-4 border-l-4 ${
                                                        deadline.completed ? 'border-green-500' : 'border-rose-500'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className={`font-bold text-sm ${
                                                                    deadline.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                                                                }`}>
                                                                    {deadline.title}
                                                                </h3>
                                                            </div>
                                                            {deadline.course && (
                                                                <p className="text-xs text-slate-600 mb-1">{deadline.course}</p>
                                                            )}
                                                            {deadline.description && (
                                                                <p className="text-xs text-slate-500 mb-2">{deadline.description}</p>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={12} className={getUrgencyColor(deadline.dueDate)} />
                                                                <span className={`text-xs font-semibold ${getUrgencyColor(deadline.dueDate)}`}>
                                                                    {format(parseISO(deadline.dueDate), 'MMM d, yyyy')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const updated = { ...deadline, completed: !deadline.completed };
                                                                    updateDeadline(deadline._id || deadline.id, updated);
                                                                }}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                    deadline.completed
                                                                        ? 'bg-green-100 text-green-600'
                                                                        : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'
                                                                }`}
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setItemToDelete({ id: deadline._id || deadline.id, type: 'deadline', name: deadline.title });
                                                                    setShowDeleteConfirm(true);
                                                                }}
                                                                className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
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
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-4 md:p-6 w-full md:max-w-3xl md:mx-auto max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Semester Dashboard</h2>
                                    <p className="text-xs text-slate-500 mt-1">Manage your academic semester</p>
                                </div>
                                <button onClick={() => setShowSemesterSetup(false)} className="text-slate-400 hover:text-slate-600 p-2">
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 md:p-4 rounded-xl border border-indigo-200">
                                    <div className="text-2xl md:text-3xl font-bold text-indigo-600">{stats.totalClasses}</div>
                                    <div className="text-[10px] md:text-xs text-indigo-700 mt-1 font-medium">Classes</div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 md:p-4 rounded-xl border border-amber-200">
                                    <div className="text-2xl md:text-3xl font-bold text-amber-600">{stats.totalAssignments}</div>
                                    <div className="text-[10px] md:text-xs text-amber-700 mt-1 font-medium">Assignments</div>
                                </div>
                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 md:p-4 rounded-xl border border-cyan-200">
                                    <div className="text-2xl md:text-3xl font-bold text-cyan-600">{stats.totalExams}</div>
                                    <div className="text-[10px] md:text-xs text-cyan-700 mt-1 font-medium">Exams</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 md:p-4 rounded-xl border border-green-200">
                                    <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.completionRate}%</div>
                                    <div className="text-[10px] md:text-xs text-green-700 mt-1 font-medium">Completed</div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-5">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Quick Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSemesterSetup(false);
                                            setShowAddClass(true);
                                        }}
                                        className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors"
                                    >
                                        <Plus size={18} />
                                        <span>Add Class</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSemesterSetup(false);
                                            setShowAddAssignment(true);
                                        }}
                                        className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors"
                                    >
                                        <Plus size={18} />
                                        <span>Assignment</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSemesterSetup(false);
                                            setShowAddExam(true);
                                        }}
                                        className="p-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors"
                                    >
                                        <Plus size={18} />
                                        <span>Add Exam</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSemesterSetup(false);
                                            generateAutoSchedule();
                                        }}
                                        className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors"
                                    >
                                        <Calendar size={18} />
                                        <span>Auto Schedule</span>
                                    </button>
                                </div>
                            </div>

                            {/* Semester Info Form */}
                            <div className="border-t border-gray-200 pt-5">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Semester Information</h3>
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

                                    <button
                                        type="submit"
                                        className="w-full p-3 md:p-3.5 bg-indigo-500 text-white rounded-xl font-semibold text-sm hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
                                    >
                                        Save Semester Setup
                                    </button>
                                </form>
                            </div>
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
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-4 md:p-6 w-full md:max-w-2xl md:mx-auto max-h-[85vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-slate-800">Add Class</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Add a new class to your schedule</p>
                                </div>
                                <button onClick={() => setShowAddClass(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Auto-Fill Section */}
                            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-purple-700">Quick Import from Schedule</label>
                                    <span className="text-[10px] text-purple-600">Paste your schedule</span>
                                </div>
                                <textarea
                                    placeholder="Paste schedule here (e.g., CSE310    Electronics II    4    BC6012    MW:13:00-14:30)"
                                    rows={3}
                                    value={autoFillText}
                                    onChange={(e) => setAutoFillText(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-purple-200 text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-mono"
                                />
                                {autoFillText && (
                                    <button
                                        type="button"
                                        onClick={handleAutoFillParse}
                                        className="mt-2 w-full p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold"
                                    >
                                        Parse Schedule
                                    </button>
                                )}
                            </div>

                            <div className="relative mb-3">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-white text-slate-500">or add manually</span>
                                </div>
                            </div>

                            <form onSubmit={handleAddClass} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">Course Code</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., CSE310"
                                            required
                                            value={classForm.code || ''}
                                            onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">Section</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 4"
                                            required
                                            value={classForm.section || ''}
                                            onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Course Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Electronics II"
                                        required
                                        value={classForm.name || ''}
                                        onChange={(e) => setClassForm({ ...classForm, name: e.target.value, subject: `${classForm.code || ''} - ${e.target.value}` })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Type</label>
                                    <select
                                        value={classForm.type || 'Lecture'}
                                        onChange={(e) => setClassForm({ ...classForm, type: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Lecture">Lecture</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Tutorial">Tutorial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Room</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., BC6012"
                                        required
                                        value={classForm.location || ''}
                                        onChange={(e) => setClassForm({ ...classForm, location: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Faculty Name (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Dr. John Doe"
                                        value={classForm.faculty || ''}
                                        onChange={(e) => setClassForm({ ...classForm, faculty: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Days (Select one or more)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <label
                                                key={day}
                                                className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                                                    (classForm.selectedDays || []).includes(day)
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={(classForm.selectedDays || []).includes(day)}
                                                    onChange={(e) => {
                                                        const selectedDays = classForm.selectedDays || [];
                                                        const newSelectedDays = e.target.checked
                                                            ? [...selectedDays, day]
                                                            : selectedDays.filter(d => d !== day);
                                                        setClassForm({ ...classForm, selectedDays: newSelectedDays });
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-xs font-medium">{day.substring(0, 3)}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {(!classForm.selectedDays || classForm.selectedDays.length === 0) && (
                                        <p className="text-xs text-rose-500 mt-1">Please select at least one day</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={classForm.startTime || ''}
                                            onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={classForm.endTime || ''}
                                            onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
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
                                    {uniqueCourses.length > 0 ? (
                                        <select
                                            required
                                            value={assignmentForm.course || ''}
                                            onChange={(e) => setAssignmentForm({ ...assignmentForm, course: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            <option value="">Select Course</option>
                                            {uniqueCourses.map((course, index) => (
                                                <option key={index} value={course.displayName}>
                                                    {course.displayName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-700">
                                            No classes added yet. Please add classes first.
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
                                    disabled={uniqueCourses.length === 0}
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
                                    {uniqueCourses.length > 0 ? (
                                        <select
                                            required
                                            value={examForm.subject || ''}
                                            onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        >
                                            <option value="">Select Subject</option>
                                            {uniqueCourses.map((course, index) => (
                                                <option key={index} value={course.displayName}>
                                                    {course.displayName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-3 rounded-lg border border-cyan-200 bg-cyan-50 text-xs text-cyan-700">
                                            No classes added yet. Please add classes first.
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
                                    disabled={uniqueCourses.length === 0}
                                    className="w-full p-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Add Exam
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Deadline Modal */}
            <AnimatePresence>
                {showAddDeadline && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
                        onClick={() => setShowAddDeadline(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl md:rounded-2xl p-5 w-full md:max-w-md md:mx-auto max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Add Deadline</h2>
                                <button onClick={() => setShowAddDeadline(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddDeadline} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Deadline title"
                                        required
                                        value={deadlineForm.title || ''}
                                        onChange={(e) => setDeadlineForm({ ...deadlineForm, title: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Course (optional)</label>
                                    {uniqueCourses.length > 0 ? (
                                        <select
                                            value={deadlineForm.course || ''}
                                            onChange={(e) => setDeadlineForm({ ...deadlineForm, course: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                        >
                                            <option value="">Select Course (Optional)</option>
                                            {uniqueCourses.map((course, index) => (
                                                <option key={index} value={course.displayName}>
                                                    {course.displayName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Course name (optional)"
                                            value={deadlineForm.course || ''}
                                            onChange={(e) => setDeadlineForm({ ...deadlineForm, course: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={deadlineForm.dueDate || ''}
                                        onChange={(e) => setDeadlineForm({ ...deadlineForm, dueDate: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Description (optional)</label>
                                    <textarea
                                        placeholder="Deadline details"
                                        rows={3}
                                        value={deadlineForm.description || ''}
                                        onChange={(e) => setDeadlineForm({ ...deadlineForm, description: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Add Deadline
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auto-Fill Preview Modal */}
            <AnimatePresence>
                {showAutoFillPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
                        onClick={() => setShowAutoFillPreview(false)}
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
                                    <h2 className="text-lg font-bold text-slate-800">Parsed Classes - Review</h2>
                                    <p className="text-xs text-slate-500 mt-1">Check if everything looks correct</p>
                                </div>
                                <button onClick={() => setShowAutoFillPreview(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4">
                                {parsedClasses.map((cls, index) => (
                                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-gray-200">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="font-bold text-slate-700">Code:</span>
                                                <span className="ml-1 text-slate-600">{cls.code}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700">Section:</span>
                                                <span className="ml-1 text-slate-600">{cls.section}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-bold text-slate-700">Name:</span>
                                                <span className="ml-1 text-slate-600">{cls.name}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700">Day:</span>
                                                <span className="ml-1 text-slate-600">{cls.day}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700">Time:</span>
                                                <span className="ml-1 text-slate-600">{cls.startTime} - {cls.endTime}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-bold text-slate-700">Room:</span>
                                                <span className="ml-1 text-slate-600">{cls.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowAutoFillPreview(false);
                                        setParsedClasses([]);
                                        setAutoFillText('');
                                    }}
                                    className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyParsedClasses}
                                    className="flex-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Add All Classes ({parsedClasses.length})
                                </button>
                            </div>
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

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && itemToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setItemToDelete(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                                    <AlertCircle className="text-rose-600" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-slate-800 mb-2">Delete {itemToDelete.type === 'class' ? 'Class' : 'Item'}?</h2>
                                    <p className="text-sm text-slate-600">
                                        Are you sure you want to delete <span className="font-semibold text-slate-800">"{itemToDelete.name}"</span>? This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setItemToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            if (itemToDelete.type === 'class') {
                                                await deleteTimetable(itemToDelete.id);
                                            }
                                            setShowDeleteConfirm(false);
                                            setItemToDelete(null);
                                        } catch (error) {
                                            console.error('Error deleting item:', error);
                                            alert('Failed to delete. Please try again.');
                                        }
                                    }}
                                    className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete
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
