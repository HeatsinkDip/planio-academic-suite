import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FocusTimer = () => {
    const { addStudySession, studySessions } = useApp();
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [mode, setMode] = useState(25); // 25 or 50 minutes
    const [subject, setSubject] = useState('');
    const [sessionStart, setSessionStart] = useState(null);

    React.useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            // Session completed
            if (subject && sessionStart) {
                addStudySession({
                    subject,
                    duration: mode,
                    startTime: sessionStart,
                    endTime: new Date().toISOString(),
                    date: new Date().toISOString(),
                });
            }
            setIsRunning(false);
            alert('Focus session completed! Great job! 🎉');
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const startTimer = () => {
        if (!subject.trim()) {
            alert('Please enter what you\'re studying');
            return;
        }
        setIsRunning(true);
        setSessionStart(new Date().toISOString());
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode * 60);
        setSubject('');
        setSessionStart(null);
    };

    const changeMode = (minutes) => {
        setMode(minutes);
        setTimeLeft(minutes * 60);
        setIsRunning(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTodayStudyTime = () => {
        const today = new Date().toDateString();
        return studySessions
            .filter(s => new Date(s.date).toDateString() === today)
            .reduce((total, s) => total + s.duration, 0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 pt-12 pb-24"
        >
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Focus Timer</h1>

            {/* Mode Selection */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => changeMode(25)}
                    disabled={isRunning}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        mode === 25 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    } ${isRunning ? 'opacity-50' : ''}`}
                >
                    25 min
                </button>
                <button
                    onClick={() => changeMode(50)}
                    disabled={isRunning}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        mode === 50 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    } ${isRunning ? 'opacity-50' : ''}`}
                >
                    50 min
                </button>
            </div>

            {/* Subject Input */}
            {!isRunning && (
                <input
                    type="text"
                    placeholder="What are you studying?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-6 focus:border-indigo-600 outline-none"
                />
            )}

            {/* Timer Display */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 rounded-3xl text-white shadow-xl mb-6 text-center">
                <div className="text-7xl font-bold mb-4">{formatTime(timeLeft)}</div>
                {subject && <div className="text-xl opacity-90">{subject}</div>}
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-6">
                {!isRunning ? (
                    <button
                        onClick={startTimer}
                        className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Play size={24} /> Start
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Pause size={24} /> Pause
                    </button>
                )}
                <button
                    onClick={resetTimer}
                    className="bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-2"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Today's Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    Today's Focus Time
                </h3>
                <div className="text-4xl font-bold text-indigo-600">{getTodayStudyTime()} min</div>
                <p className="text-sm text-slate-500 mt-2">{studySessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length} sessions completed</p>
            </div>
        </motion.div>
    );
};

export default FocusTimer;
