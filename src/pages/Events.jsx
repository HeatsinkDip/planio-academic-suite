import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Calendar, Plus, X, Trophy, Mic, Code, Music, Gift, AlertCircle, MapPin, Clock, Trash2 } from 'lucide-react';
import { format, isFuture, isPast, isToday, differenceInDays, differenceInHours } from 'date-fns';

export default function Events() {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    type: 'Hackathon',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    description: '',
    registrationLink: '',
    reminder: true
  });

  const eventTypes = [
    { name: 'Hackathon', icon: Code, color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50', text: 'text-purple-700' },
    { name: 'Seminar', icon: Mic, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    { name: 'Sports', icon: Trophy, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700' },
    { name: 'Cultural', icon: Music, color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', text: 'text-pink-700' },
    { name: 'Workshop', icon: Gift, color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', text: 'text-orange-700' },
    { name: 'Other', icon: Calendar, color: 'from-gray-500 to-slate-600', bg: 'bg-gray-50', text: 'text-gray-700' },
  ];

  const getEventTypeConfig = (type) => {
    return eventTypes.find(t => t.name === type) || eventTypes[eventTypes.length - 1];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert('Please fill in title and date');
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    };

    addEvent(newEvent);
    setFormData({
      title: '',
      type: 'Hackathon',
      date: new Date().toISOString().split('T')[0],
      time: '',
      location: '',
      description: '',
      registrationLink: '',
      reminder: true
    });
    setShowForm(false);
  };

  const getCountdown = (date, time) => {
    const eventDate = time ? new Date(`${date}T${time}`) : new Date(date);
    const now = new Date();
    
    if (isPast(eventDate) && !isToday(eventDate)) {
      return { text: 'Past event', color: 'text-gray-500' };
    }
    
    if (isToday(eventDate)) {
      if (time) {
        const hours = differenceInHours(eventDate, now);
        return { 
          text: hours > 0 ? `In ${hours}h` : 'Happening now!', 
          color: 'text-green-600 font-bold' 
        };
      }
      return { text: 'Today!', color: 'text-green-600 font-bold' };
    }
    
    const days = differenceInDays(eventDate, now);
    if (days === 0) return { text: 'Today', color: 'text-green-600 font-bold' };
    if (days === 1) return { text: 'Tomorrow', color: 'text-orange-600 font-bold' };
    if (days <= 3) return { text: `In ${days} days`, color: 'text-orange-600 font-bold' };
    if (days <= 7) return { text: `In ${days} days`, color: 'text-blue-600' };
    return { text: `In ${days} days`, color: 'text-gray-600' };
  };

  const filteredEvents = selectedType === 'All' 
    ? events 
    : events.filter(event => event.type === selectedType);

  const upcomingEvents = filteredEvents
    .filter(event => isFuture(new Date(event.date)) || isToday(new Date(event.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = filteredEvents
    .filter(event => isPast(new Date(event.date)) && !isToday(new Date(event.date)))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Events</h1>
              <p className="text-sm text-indigo-100">Stay updated with campus activities</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-indigo-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {showForm ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        {events.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Upcoming</span>
              </div>
              <p className="text-3xl font-bold">{upcomingEvents.length}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Total Events</span>
              </div>
              <p className="text-3xl font-bold">{events.length}</p>
            </div>
          </div>
        )}

        {/* Add Event Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Annual Tech Fest 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {eventTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.name })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.type === type.name
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1 text-gray-700" />
                        <div className="text-xs font-medium text-gray-700">{type.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Main Auditorium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Event details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Link</label>
                <input
                  type="url"
                  value={formData.registrationLink}
                  onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Add Event
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
          </motion.div>
        )}

        {/* Filter Tabs */}
        {events.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedType('All')}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedType === 'All'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Events
              </button>
              {eventTypes.map(type => (
                <button
                  key={type.name}
                  onClick={() => setSelectedType(type.name)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                    selectedType === type.name
                      ? `${type.bg} ${type.text} border-2 border-current`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {React.createElement(type.icon, { className: 'w-4 h-4' })}
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
            {upcomingEvents.map((event) => {
              const typeConfig = getEventTypeConfig(event.type);
              const Icon = typeConfig.icon;
              const countdown = getCountdown(event.date, event.time);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${typeConfig.color} p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="w-6 h-6 text-white mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">{event.title}</h3>
                          <p className="text-sm text-white/90">{event.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{format(new Date(event.date), 'PP')}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                      )}
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-gray-700 text-sm mb-3">{event.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${countdown.color}`}>
                        {countdown.text}
                      </span>
                      {event.registrationLink && (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Register
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Past Events</h2>
            {pastEvents.map((event) => {
              const typeConfig = getEventTypeConfig(event.type);
              const Icon = typeConfig.icon;
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 rounded-2xl shadow-md overflow-hidden opacity-60"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="w-6 h-6 text-gray-500 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{event.title}</h3>
                          <p className="text-sm text-gray-500">{event.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.date), 'PP')}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No events yet</p>
            <p className="text-gray-400 text-sm">Add your s and stay organized!</p>
          </div>
        )}
      </div>
    </div>
  );
}
