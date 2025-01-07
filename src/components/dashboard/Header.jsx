import React, { useEffect, useState } from 'react';
import useStore from '../../lib/store';

export default function Header({ title }) {
  const { user, notifications, unreadNotificationsCount, fetchNotifications, markNotificationAsRead } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-6">
        <h1 className="text-xl font-semibold text-white">
          {title}
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-purple-500/10 transition-all duration-200 relative"
            >
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></span>
              )}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 cosmic-card rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-800/50 ${!notification.read ? 'bg-purple-500/5' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <p className="text-sm text-gray-400">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      Aucune notification
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-64 px-4 py-2 text-sm text-gray-300 bg-gray-900/50 border border-gray-700/50 rounded-lg focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button className="flex items-center space-x-3 p-2 text-gray-300 hover:text-white rounded-lg hover:bg-purple-500/10 transition-all duration-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium">{user?.email || 'Utilisateur'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
