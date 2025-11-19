import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Target, Plus, X, Flame, CheckCircle, TrendingUp, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, parseISO } from 'date-fns';

export default function Habits() {
  const { habits, addHabit, toggleHabitToday, deleteHabit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    category: 'Study',
    icon: '📚',
    color: 'from-blue-500 to-indigo-600',
    target: 'daily'
  });

  const categories = [
    { name: 'Study', icon: '📚', color: 'from-blue-500 to-indigo-600' },
    { name: 'Health', icon: '💪', color: 'from-green-500 to-emerald-600' },
    { name: 'Sleep', icon: '😴', color: 'from-purple-500 to-pink-600' },
    { name: 'Water', icon: '💧', color: 'from-cyan-500 to-blue-600' },
    { name: 'Exercise', icon: '🏃', color: 'from-orange-500 to-red-600' },
    { name: 'Reading', icon: '📖', color: 'from-amber-500 to-yellow-600' },
  ];

  const predefinedHabits = [
    { name: 'Study 2 hours', category: 'Study', icon: '📚', color: 'from-blue-500 to-indigo-600' },
    { name: 'Drink 8 glasses of water', category: 'Water', icon: '💧', color: 'from-cyan-500 to-blue-600' },
    { name: 'Attend all classes', category: 'Study', icon: '🎓', color: 'from-purple-500 to-pink-600' },
    { name: 'Sleep before 11 PM', category: 'Sleep', icon: '😴', color: 'from-indigo-500 to-purple-600' },
    { name: 'Exercise 30 min', category: 'Exercise', icon: '🏃', color: 'from-orange-500 to-red-600' },
    { name: 'Read for 20 min', category: 'Reading', icon: '📖', color: 'from-amber-500 to-yellow-600' },
    { name: 'Prepare for exam', category: 'Study', icon: '📝', color: 'from-green-500 to-teal-600' },
    { name: 'Eat healthy', category: 'Health', icon: '🥗', color: 'from-green-500 to-emerald-600' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter a habit name');
      return;
    }

    const newHabit = {
      id: Date.now(),
      ...formData,
      completedDates: [],
      createdAt: new Date().toISOString()
    };

    addHabit(newHabit);
    setFormData({
      name: '',
      category: 'Study',
      icon: '📚',
      color: 'from-blue-500 to-indigo-600',
      target: 'daily'
    });
    setShowForm(false);
  };

  const handleQuickAdd = (habit) => {
    const newHabit = {
      id: Date.now(),
      ...habit,
      target: 'daily',
      completedDates: [],
      createdAt: new Date().toISOString()
    };
    addHabit(newHabit);
  };

  const getCurrentStreak = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const sortedDates = [...habit.completedDates].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const completedDate = new Date(sortedDates[i]);
      completedDate.setHours(0, 0, 0, 0);
      
      if (completedDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (completedDate.getTime() < checkDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const isHabitCompletedOnDate = (habit, date) => {
    if (!habit.completedDates) return false;
    return habit.completedDates.some(completedDate => 
      isSameDay(parseISO(completedDate), date)
    );
  };

  const weekDays = getWeekDays();
  const totalHabitsCompleted = habits.reduce((sum, habit) => 
    sum + (habit.completedDates?.length || 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Habit Tracker</h1>
              <p className="text-sm text-orange-100">Build your success routine</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-orange-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {showForm ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Active Habits</span>
            </div>
            <p className="text-3xl font-bold">{habits.length}</p>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Total Completed</span>
            </div>
            <p className="text-3xl font-bold">{totalHabitsCompleted}</p>
          </div>
        </div>

        {/* Add Habit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create Habit</h2>
            
            {/* Quick Add */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Add:</p>
              <div className="grid grid-cols-2 gap-2">
                {predefinedHabits.map((habit, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAdd(habit)}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-2xl">{habit.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{habit.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Or create custom:</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Morning meditation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.name, icon: cat.icon, color: cat.color })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.category === cat.name
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Create Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Week View */}
        {habits.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">This Week</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() - 7)))}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedWeek(new Date())}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200"
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() + 7)))}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  →
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-8 gap-2 mb-3">
              <div className="text-xs font-medium text-gray-500"></div>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center">
                  <div className="text-xs font-medium text-gray-500">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-sm font-bold ${isToday(day) ? 'text-orange-600' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Habit Rows */}
            <div className="space-y-2">
              {habits.map((habit) => (
                <div key={habit.id} className="grid grid-cols-8 gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <span className="text-sm font-medium text-gray-700 truncate">{habit.name}</span>
                  </div>
                  {weekDays.map((day) => {
                    const isCompleted = isHabitCompletedOnDate(habit, day);
                    const isPast = day < new Date() && !isToday(day);
                    const isTodayCell = isToday(day);
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => isTodayCell && toggleHabitToday(habit.id)}
                        disabled={!isTodayCell}
                        className={`aspect-square rounded-lg transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isTodayCell
                            ? 'bg-gray-100 hover:bg-orange-100 border-2 border-orange-300'
                            : isPast
                            ? 'bg-gray-50'
                            : 'bg-gray-50'
                        } ${isTodayCell && !isCompleted ? 'cursor-pointer' : ''}`}
                      >
                        {isCompleted && <CheckCircle className="w-4 h-4 mx-auto" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habit Cards */}
        {habits.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-800">Your Habits</h2>
            {habits.map((habit) => {
              const streak = getCurrentStreak(habit);
              const todayCompleted = habit.completedDates?.some(date => 
                isSameDay(parseISO(date), new Date())
              );
              
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${habit.color} p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{habit.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">{habit.name}</h3>
                          <p className="text-sm text-white/90">{habit.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-medium text-gray-600">Current Streak</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{streak} days</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-gray-600">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{habit.completedDates?.length || 0}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleHabitToday(habit.id)}
                      disabled={todayCompleted}
                      className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        todayCompleted
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      {todayCompleted ? 'Completed Today!' : 'Mark as Done Today'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {habits.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No habits yet</p>
            <p className="text-gray-400 text-sm">Start building your success routine!</p>
          </div>
        )}
      </div>
    </div>
  );
}
