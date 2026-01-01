
import React, { useState, useEffect } from 'react';
import CareerTrajectoryView from './CareerTrajectoryView';
import { notificationService } from './services';
import { Notification } from './types';
import { Bell, User, LayoutDashboard, Settings } from 'lucide-react';

const App: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const unsubscribe = notificationService.subscribe((notes) => {
            setNotifications(notes);
        });
        return () => unsubscribe();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Sticky Navigation */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            AetherCareer <span className="font-light text-slate-400">Blueprint 108</span>
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                                    <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                                        <span className="font-semibold text-sm">Notifications</span>
                                        <button 
                                            onClick={() => notificationService.clearNotifications()}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-sm italic">No notifications</div>
                                        ) : (
                                            notifications.map(note => (
                                                <div 
                                                    key={note.id} 
                                                    className={`p-4 border-b hover:bg-slate-50 transition-colors ${note.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                                                    onClick={() => notificationService.markAsRead(note.id)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                                            note.type === 'error' ? 'bg-red-500' : 
                                                            note.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                                        }`} />
                                                        <div className="ml-3 flex-1">
                                                            <p className="text-sm font-medium text-slate-800">{note.message}</p>
                                                            <p className="text-[10px] text-slate-500 mt-1">{new Date(note.timestamp).toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200" />
                        <button className="flex items-center space-x-2 p-1 pl-1 pr-3 hover:bg-slate-100 rounded-full transition-colors">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Jane Doe</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar & Content Layout */}
            <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <main className="w-full">
                    <CareerTrajectoryView />
                </main>
            </div>

            <footer className="py-6 border-t border-slate-200 bg-white text-center">
                <p className="text-slate-400 text-sm">© 2025 AetherCareer Blueprint Infrastructure. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default App;
