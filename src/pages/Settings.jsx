import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Lock, Info, LogOut, User, Mail, X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function Settings() {
  const { logout, currentUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update token if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setShowProfileModal(false);
        setMessage({ type: '', text: '' });
        window.location.reload(); // Reload to update user data
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pb-20 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-indigo-100">Customize your experience</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Account Section */}
        <div className={`rounded-2xl shadow-md overflow-hidden ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}>
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Account
            </h2>
          </div>
          <div className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
            <button
              onClick={() => {
                setProfileData({ name: currentUser?.name || '', email: currentUser?.email || '' });
                setShowProfileModal(true);
              }}
              className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${
                isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
              }`}
            >
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <User size={20} className="text-indigo-500" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Edit Profile
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Update your name and email
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className={`rounded-2xl shadow-md overflow-hidden ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}>
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Appearance
            </h2>
          </div>
          <div className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${
                isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-yellow-500/10' : 'bg-indigo-50'
              }`}>
                {isDarkMode ? (
                  <Moon size={20} className="text-yellow-400" />
                ) : (
                  <Sun size={20} className="text-indigo-600" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Dark Mode
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {isDarkMode ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative ${
                isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className={`rounded-2xl shadow-md overflow-hidden ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}>
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Security
            </h2>
          </div>
          <div className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
            <button
              onClick={() => setShowPasswordModal(true)}
              className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${
                isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
              }`}
            >
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Lock size={20} className="text-green-500" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Change Password
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Update your password
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className={`rounded-2xl shadow-md overflow-hidden ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}>
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              About
            </h2>
          </div>
          <div className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Info size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Planio - Academic Suite
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Version 1.0.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className={`rounded-2xl shadow-md overflow-hidden ${
          isDarkMode ? 'bg-slate-900' : 'bg-white'
        }`}>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${
              isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
            }`}
          >
            <div className="p-2 bg-red-500/10 rounded-lg">
              <LogOut size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-500">Logout</p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Sign out of your account
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto ${
                isDarkMode ? 'bg-slate-900' : 'bg-white'
              }`}
            >
              <div className={`sticky top-0 border-b p-4 flex items-center justify-between ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Change Password
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className={`p-2 rounded-full ${
                    isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} className={isDarkMode ? 'text-slate-400' : 'text-gray-600'} />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                {message.text && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                      ) : (
                        <Eye size={18} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                      ) : (
                        <Eye size={18} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                      ) : (
                        <Eye size={18} className={isDarkMode ? 'text-slate-400' : 'text-gray-400'} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl ${
                isDarkMode ? 'bg-slate-900' : 'bg-white'
              }`}
            >
              <div className={`sticky top-0 border-b p-4 flex items-center justify-between ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Edit Profile
                </h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className={`p-2 rounded-full ${
                    isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} className={isDarkMode ? 'text-slate-400' : 'text-gray-600'} />
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                {message.text && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Name
                  </label>
                  <div className="relative">
                    <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating Profile...' : 'Update Profile'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
