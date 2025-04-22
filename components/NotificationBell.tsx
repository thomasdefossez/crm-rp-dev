"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

export default function NotificationBell() {
    const [open, setOpen] = useState(false);

    const notifications = [
        {
            id: 1,
            message: "Un nouveau contact a été ajouté.",
            time: "Il y a 3 min",
        },
        {
            id: 2,
            message: "Votre communiqué a été ouvert.",
            time: "Il y a 1 h",
        },
        {
            id: 3,
            message: "Nouvelle réponse à votre email.",
            time: "Hier",
        },
    ];

    return (
        <div className="relative">
            {/* Cloche */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-full text-gray-500 hover:text-violet-600 hover:bg-gray-100"
            >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
                )}
            </button>

            {/* Menu notifications */}
            {open && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                        Notifications
                    </div>
                    <ul className="divide-y text-sm text-gray-600 max-h-72 overflow-y-auto">
                        {notifications.map((notif) => (
                            <li key={notif.id} className="px-4 py-3 hover:bg-gray-50">
                                <div>{notif.message}</div>
                                <div className="text-xs text-gray-400 mt-1">{notif.time}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}