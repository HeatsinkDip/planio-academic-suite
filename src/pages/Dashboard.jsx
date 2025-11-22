import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, CheckCircle, Calendar, Clock, BookOpen, Flame, GraduationCap, Wallet, ListTodo } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const Dashboard = () => {
    const { tasks, getBalance, transactions, semester, timetable, habits, studySessions, assignments, exams } = useApp();
    const { currentUser } = useAuth();
    const { isDarkMode } = useTheme();
    const balance = getBalance();
    const pendingTasks = tasks.filter(t => !t.completed).slice(0, 4);
    const completedToday = tasks.filter(t => t.completed).length;

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Last 30 days income/expense
    const totalIncome = transactions
        .filter(t => t.type === 'income' && new Date(t.date) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);

    // Urgent assignments (due within 3 days)
    const urgentAssignments = assignments.filter(a => {
        if (a.completed) return false;
        const daysLeft = differenceInDays(new Date(a.dueDate), new Date());
        return daysLeft >= 0 && daysLeft <= 3;
    }).length;

    // Upcoming exams (within 7 days)
    const upcomingExamsCount = exams.filter(e => {
        const daysLeft = differenceInDays(new Date(e.date), new Date());
        return daysLeft >= 0 && daysLeft <= 7;
    }).length;

    // Semester countdown
    const upcomingSemesterEvents = semester
        .filter(e => {
            const eventDate = new Date(e.date);
            return eventDate >= new Date();
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4);

    // Upcoming assignments
    const upcomingAssignments = assignments
        .filter(a => !a.completed)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    // Upcoming exams
    const upcomingExams = exams
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    // Today's classes
    const todayClasses = timetable
        .filter(c => c.day === format(new Date(), 'EEEE'))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, 4);

    // Habits streak
    const activeHabits = habits.slice(0, 3);
    const todayDate = new Date().toDateString();

    // Study time today
    const todayStudyTime = studySessions
        .filter(s => new Date(s.date).toDateString() === todayDate)
        .reduce((total, s) => total + s.duration, 0);

    // Task completion rate
    const taskCompletionRate = tasks.length > 0 
        ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 space-y-3"
        >
            {/* Header with Wallet Info */}
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Hello, <span className="text-indigo-600">{currentUser?.name || 'User'}</span>
                    </h1>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{format(new Date(), 'EEEE, MMMM d')}</p>
                </div>
                
                {/* Compact Wallet Info */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-linear-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg"
                >
                    <div className="flex items-center gap-1.5">
                        <Wallet size={14} />
                        <div>
                            <p className="text-[10px] opacity-80">Balance</p>
                            <p className="text-sm font-bold">${balance.toFixed(0)}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{pendingTasks.length}</div>
                    <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pending</div>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <div className="text-lg font-bold text-green-600">{taskCompletionRate}%</div>
                    <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Complete</div>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <div className="text-lg font-bold text-amber-600">{urgentAssignments}</div>
                    <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Urgent</div>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <div className="text-lg font-bold text-cyan-600">{upcomingExamsCount}</div>
                    <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Exams</div>
                </div>
            </div>

            {/* Financial Overview - Last 30 Days */}
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    <TrendingUp size={14} />
                    Last 30 Days
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Income</p>
                        <p className="text-sm font-bold text-emerald-600">${totalIncome.toFixed(0)}</p>
                    </div>
                    <div>
                        <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Expense</p>
                        <p className="text-sm font-bold text-rose-600">${totalExpense.toFixed(0)}</p>
                    </div>
                    <div>
                        <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Net</p>
                        <p className={`text-sm font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.abs(totalIncome - totalExpense).toFixed(0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Today's Classes */}
            {todayClasses.length > 0 && (
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        <Calendar size={14} />
                        Today's Classes
                    </h3>
                    <div className="space-y-1.5">
                        {todayClasses.map((classItem) => (
                            <div 
                                key={classItem.id} 
                                className={`flex items-center gap-2 p-2 rounded-lg border-l-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}
                                style={{ borderLeftColor: classItem.color }}
                            >
                                <div className="text-[10px] font-bold" style={{ color: classItem.color }}>
                                    {classItem.startTime}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{classItem.subject}</p>
                                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{classItem.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Assignments & Exams Grid */}
            <div className="grid grid-cols-2 gap-2">
                {/* Assignments */}
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        <BookOpen size={14} />
                        Assignments
                    </h3>
                    <div className="space-y-1.5">
                        {upcomingAssignments.length === 0 ? (
                            <p className="text-[10px] text-slate-400 text-center py-2">No assignments</p>
                        ) : (
                            upcomingAssignments.map((assignment) => {
                                const daysLeft = differenceInDays(new Date(assignment.dueDate), new Date());
                                return (
                                    <div key={assignment.id} className={`p-1.5 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-amber-50'}`}>
                                        <p className={`font-semibold text-[10px] truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{assignment.title}</p>
                                        <p className={`text-[9px] font-bold ${
                                            daysLeft <= 2 ? 'text-rose-600' : 
                                            daysLeft <= 5 ? 'text-amber-600' : 'text-green-600'
                                        }`}>
                                            {daysLeft}d left
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Exams */}
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        <GraduationCap size={14} />
                        Exams
                    </h3>
                    <div className="space-y-1.5">
                        {upcomingExams.length === 0 ? (
                            <p className="text-[10px] text-slate-400 text-center py-2">No exams</p>
                        ) : (
                            upcomingExams.map((exam) => {
                                const daysLeft = differenceInDays(new Date(exam.date), new Date());
                                return (
                                    <div key={exam.id} className={`p-1.5 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-cyan-50'}`}>
                                        <p className={`font-semibold text-[10px] truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{exam.title}</p>
                                        <p className={`text-[9px] font-bold ${
                                            daysLeft <= 2 ? 'text-rose-600' : 
                                            daysLeft <= 7 ? 'text-amber-600' : 'text-cyan-600'
                                        }`}>
                                            {format(new Date(exam.date), 'MMM d')}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Deadlines */}
            {upcomingSemesterEvents.length > 0 && (
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <h3 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        <Clock size={14} />
                        Upcoming Deadlines
                    </h3>
                    <div className="space-y-1.5">
                        {upcomingSemesterEvents.map((event) => {
                            const daysLeft = differenceInDays(new Date(event.date), new Date());
                            return (
                                <div key={event.id} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                                    <div className="flex-1">
                                        <p className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{event.title}</p>
                                        <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{format(new Date(event.date), 'MMM d')}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        daysLeft <= 3 ? 'bg-rose-100 text-rose-600' : 
                                        daysLeft <= 7 ? 'bg-amber-100 text-amber-600' : 
                                        'bg-green-100 text-green-600'
                                    }`}>
                                        {daysLeft}d
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Focus Time & Habits Grid */}
            {(todayStudyTime > 0 || activeHabits.length > 0) && (
                <div className="grid grid-cols-2 gap-2">
                    {/* Focus Time */}
                    {todayStudyTime > 0 && (
                        <div className="bg-linear-to-r from-purple-500 to-pink-500 p-3 rounded-xl text-white">
                            <div className="flex items-center gap-1 mb-1">
                                <Clock size={12} />
                                <span className="text-[10px] font-medium opacity-90">Focus Time</span>
                            </div>
                            <div className="text-xl font-bold">{todayStudyTime}m</div>
                        </div>
                    )}

                    {/* Habit Streaks */}
                    {activeHabits.length > 0 && (
                        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                            <h3 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                <Flame size={14} className="text-orange-500" />
                                Habits
                            </h3>
                            <div className="space-y-1">
                                {activeHabits.map((habit) => {
                                    const isCompletedToday = habit.completedDates?.includes(todayDate);
                                    return (
                                        <div key={habit.id} className="flex items-center justify-between text-[10px]">
                                            <span className={`truncate flex-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{habit.name}</span>
                                            <div key={`${habit.id}-actions`} className="flex items-center gap-1">
                                                <span className="text-orange-500 font-bold">{habit.streak}🔥</span>
                                                {isCompletedToday && <span className="text-green-500">✓</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Pending Tasks */}
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    <ListTodo size={14} />
                    Pending Tasks
                </h3>
                <div className="space-y-1.5">
                    {pendingTasks.length === 0 ? (
                        <div className="text-center py-4">
                            <CheckCircle size={24} className="mx-auto text-green-500 mb-1" />
                            <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>All done! 🎉</p>
                        </div>
                    ) : (
                        pendingTasks.map((task) => (
                            <div key={task.id} className={`flex items-center gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                                <div className={`w-2 h-2 rounded-full shrink-0 ${
                                    task.priority === 'high' ? 'bg-rose-500' :
                                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                }`}></div>
                                <span className={`text-xs font-medium truncate flex-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{task.title}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
