import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { BookOpen, Calendar, Clock, ChevronDown, ChevronUp, Award, CheckCircle, XCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

const AcademicHistory = () => {
    const { timetable, assignments, exams, semesterConfig } = useApp();
    const [expandedSemester, setExpandedSemester] = useState(null);
    const [activeView, setActiveView] = useState('summary'); // summary, assignments, exams, classes

    // Get semester stats
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.completed).length;
    const totalExams = exams.length;
    const totalClasses = timetable.length;

    // Group assignments by course
    const assignmentsByCourse = assignments.reduce((acc, assignment) => {
        const course = assignment.course || 'Uncategorized';
        if (!acc[course]) acc[course] = [];
        acc[course].push(assignment);
        return acc;
    }, {});

    // Group exams by subject
    const examsBySubject = exams.reduce((acc, exam) => {
        const subject = exam.subject || 'General';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(exam);
        return acc;
    }, {});

    const views = [
        { id: 'summary', label: 'Summary', icon: Award },
        { id: 'assignments', label: 'Assignments', icon: BookOpen },
        { id: 'exams', label: 'Exams', icon: Clock },
        { id: 'classes', label: 'Classes', icon: Calendar }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-3"
        >
            {/* Header */}
            <div className="mb-2">
                <h1 className="text-lg font-bold text-slate-800">Academic History</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    {semesterConfig?.name || 'No active semester'}
                    {semesterConfig?.startDate && semesterConfig?.endDate && (
                        <span> • {format(parseISO(semesterConfig.startDate), 'MMM d')} - {format(parseISO(semesterConfig.endDate), 'MMM d, yyyy')}</span>
                    )}
                </p>
            </div>

            {/* View Tabs */}
            <div className="grid grid-cols-4 gap-2">
                {views.map((view) => {
                    const Icon = view.icon;
                    const isActive = activeView === view.id;
                    return (
                        <motion.button
                            key={view.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveView(view.id)}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all text-xs font-semibold ${
                                isActive
                                    ? 'bg-indigo-500 text-white shadow-lg'
                                    : 'bg-white text-slate-600 border border-gray-100'
                            }`}
                        >
                            <Icon size={14} />
                            <span className="text-[10px]">{view.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                >
                    {/* Summary View */}
                    {activeView === 'summary' && (
                        <div className="space-y-3">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <div className="text-2xl font-bold text-slate-800">{totalClasses}</div>
                                    <div className="text-[10px] text-slate-500">Total Classes</div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <div className="text-2xl font-bold text-indigo-600">{totalAssignments}</div>
                                    <div className="text-[10px] text-slate-500">Assignments</div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <div className="text-2xl font-bold text-green-600">{completedAssignments}</div>
                                    <div className="text-[10px] text-slate-500">Completed</div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <div className="text-2xl font-bold text-cyan-600">{totalExams}</div>
                                    <div className="text-[10px] text-slate-500">Exams</div>
                                </div>
                            </div>

                            {/* Completion Rate */}
                            <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-800">Assignment Completion</span>
                                    <span className="text-xs font-bold text-indigo-600">
                                        {totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all"
                                        style={{ width: `${totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Courses List */}
                            {semesterConfig?.courses && semesterConfig.courses.length > 0 && (
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <h3 className="text-xs font-bold text-slate-800 mb-2">Enrolled Courses</h3>
                                    <div className="space-y-1.5">
                                        {semesterConfig.courses.map((course, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-800">{course.code}</p>
                                                    <p className="text-[10px] text-slate-500">{course.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assignments View */}
                    {activeView === 'assignments' && (
                        <div className="space-y-3">
                            {Object.keys(assignmentsByCourse).length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No assignments recorded</p>
                                </div>
                            ) : (
                                Object.entries(assignmentsByCourse).map(([course, courseAssignments]) => (
                                    <div key={course} className="bg-white p-3 rounded-xl border border-gray-100">
                                        <button
                                            onClick={() => setExpandedSemester(expandedSemester === course ? null : course)}
                                            className="w-full flex items-center justify-between mb-2"
                                        >
                                            <div className="text-left">
                                                <h3 className="text-xs font-bold text-slate-800">{course}</h3>
                                                <p className="text-[10px] text-slate-500">
                                                    {courseAssignments.filter(a => a.completed).length}/{courseAssignments.length} completed
                                                </p>
                                            </div>
                                            {expandedSemester === course ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        <AnimatePresence>
                                            {expandedSemester === course && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="space-y-1.5 overflow-hidden"
                                                >
                                                    {courseAssignments
                                                        .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
                                                        .map((assignment) => (
                                                            <div
                                                                key={assignment.id}
                                                                className={`p-2 rounded-lg flex items-start gap-2 ${
                                                                    assignment.completed ? 'bg-green-50' : 'bg-slate-50'
                                                                }`}
                                                            >
                                                                {assignment.completed ? (
                                                                    <CheckCircle size={14} className="text-green-600 shrink-0 mt-0.5" />
                                                                ) : (
                                                                    <XCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-xs font-semibold ${assignment.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                                                        {assignment.title}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500">
                                                                        Due: {format(parseISO(assignment.dueDate), 'MMM d, yyyy')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Exams View */}
                    {activeView === 'exams' && (
                        <div className="space-y-3">
                            {Object.keys(examsBySubject).length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No exams recorded</p>
                                </div>
                            ) : (
                                Object.entries(examsBySubject).map(([subject, subjectExams]) => (
                                    <div key={subject} className="bg-white p-3 rounded-xl border border-gray-100">
                                        <h3 className="text-xs font-bold text-slate-800 mb-2">{subject}</h3>
                                        <div className="space-y-1.5">
                                            {subjectExams
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                .map((exam) => (
                                                    <div key={exam.id} className="p-2 bg-cyan-50 rounded-lg">
                                                        <p className="text-xs font-semibold text-slate-800">{exam.title}</p>
                                                        <p className="text-[10px] text-slate-500">
                                                            {format(parseISO(exam.date), 'MMM d, yyyy')}
                                                            {exam.time && ` at ${exam.time}`}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Classes View */}
                    {activeView === 'classes' && (
                        <div className="space-y-3">
                            {timetable.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No classes recorded</p>
                                </div>
                            ) : (
                                ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                                    const dayClasses = timetable.filter(c => c.day === day);
                                    if (dayClasses.length === 0) return null;
                                    return (
                                        <div key={day} className="bg-white p-3 rounded-xl border border-gray-100">
                                            <h3 className="text-xs font-bold text-slate-800 mb-2">{day}</h3>
                                            <div className="space-y-1.5">
                                                {dayClasses
                                                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                                    .map((classItem) => (
                                                        <div
                                                            key={classItem.id}
                                                            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border-l-2"
                                                            style={{ borderLeftColor: classItem.color }}
                                                        >
                                                            <div className="text-[10px] font-bold" style={{ color: classItem.color }}>
                                                                {classItem.startTime}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-xs text-slate-800">{classItem.subject}</p>
                                                                <p className="text-[10px] text-slate-500">
                                                                    {classItem.type}
                                                                    {classItem.location && ` • ${classItem.location}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default AcademicHistory;
