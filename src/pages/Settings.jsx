import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Moon, Globe, Lock, HelpCircle, Info, LogOut } from 'lucide-react';

export default function Settings() {
  const { logout } = useAuth();

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', description: 'Manage notification settings', action: () => alert('Notifications settings coming soon!') },
        { icon: Moon, label: 'Dark Mode', description: 'Toggle dark mode', action: () => alert('Dark mode coming soon!') },
        { icon: Globe, label: 'Language', description: 'Change app language', action: () => alert('Language settings coming soon!') },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: Lock, label: 'Change Password', description: 'Update your password', action: () => alert('Password change coming soon!') },
      ]
    },
    {
      title: 'About',
      items: [
        { icon: HelpCircle, label: 'Help & Support', description: 'Get help with the app', action: () => alert('Help center coming soon!') },
        { icon: Info, label: 'About', description: 'App version and info', action: () => alert('Student Life Manager v1.0.0') },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-indigo-100">Customize your experience</p>
      </div>

      <div className="p-4 space-y-6">
        {settingsGroups.map((group, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">{group.title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Icon size={20} className="text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 p-4 hover:bg-red-50 transition-colors text-left"
          >
            <div className="p-2 bg-red-50 rounded-lg">
              <LogOut size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-600">Logout</p>
              <p className="text-sm text-gray-500">Sign out of your account</p>
            </div>
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Student Life Manager</p>
          <p className="text-xs mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
