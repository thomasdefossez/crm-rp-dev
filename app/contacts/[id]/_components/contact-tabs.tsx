'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home } from 'lucide-react';

export function ContactTabs() {
    return (
        <Tabs defaultValue="notes">
            <TabsList className="border-b border-gray-200 px-8">
                <TabsTrigger
                    value="home"
                    className="flex items-center gap-2 text-sm text-gray-700 data-[state=active]:text-blue-600"
                >
                    <Home className="w-4 h-4" /> {/* Icône maison */}
                </TabsTrigger>
                <TabsTrigger
                    value="notes"
                    className="text-sm text-gray-700 data-[state=active]:text-blue-600"
                >
                    Notes
                </TabsTrigger>
                <TabsTrigger
                    value="reminders"
                    className="text-sm text-gray-700 data-[state=active]:text-blue-600"
                >
                    Reminders
                </TabsTrigger>
                <TabsTrigger
                    value="emails"
                    className="text-sm text-gray-700 data-[state=active]:text-blue-600"
                >
                    Emails
                </TabsTrigger>
                <TabsTrigger
                    value="calls"
                    className="text-sm text-gray-700 data-[state=active]:text-blue-600"
                >
                    Calls
                </TabsTrigger>
                <TabsTrigger
                    value="meetings"
                    className="text-sm text-gray-700 data-[state=active]:text-blue-600"
                >
                    Meetings
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}