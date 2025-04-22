'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Mail, MoreHorizontal } from 'lucide-react';

import { ContactsTable } from './_components/contacts-table';
import { CreateContactDrawer } from './_components/CreateContactDrawer';

// Initialisation Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ContactsPage() {
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [totalContacts, setTotalContacts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch total contacts au chargement
    useEffect(() => {
        const fetchTotalContacts = async () => {
            const { count, error } = await supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true });
            if (!error && count !== null) {
                setTotalContacts(count);
            }
        };
        fetchTotalContacts();
    }, [refreshCounter]); // Recharge si refreshCounter change (nouveau contact)

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Breadcrumb */}
            <div className="px-8 pt-6 pb-2 text-sm text-gray-500">
                <span className="text-gray-700">Home</span> <span className="mx-1">&rarr;</span> <span className="font-medium text-gray-400">Contacts</span>
            </div>

            {/* Header */}
            <div className="px-8 pb-4 flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contacts</h1>
                    <span className="text-sm text-purple-600">({totalContacts})</span>
                </div>
            </div>

            {/* Tabs and Actions */}
            <div className="flex items-end justify-between px-8 border-b">
                <Tabs defaultValue="contacts">
                    <TabsList className="bg-transparent p-0 border-none">
                        <TabsTrigger value="contacts" className="text-sm relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-purple-600">Contacts</TabsTrigger>
                        <TabsTrigger value="updates" className="text-sm relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-purple-600">Contacts updates</TabsTrigger>
                        <TabsTrigger value="media" className="text-sm relative data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-purple-600">Media lists</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex gap-2 pb-4">
                    <Button variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" />Settings</Button>
                    <Button variant="outline" size="sm">Export</Button>
                    <Button variant="outline" size="sm">New list</Button>
                    <CreateContactDrawer onContactCreated={() => setRefreshCounter(c => c + 1)} />
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90">Send email</Button>
                </div>
            </div>

            {/* Content layout */}
            <div className="flex flex-1">
                {/* Sidebar Filters */}
                <aside className="w-64 border-r bg-gray-50 p-6">
                    <div className="text-sm font-medium text-gray-700 mb-4">Saved filters</div>
                    <Input placeholder="Type to search..." className="mb-4" />
                    <div className="text-sm text-gray-700 mb-6">All contacts</div>
                    <div className="space-y-6">
                        {['Contact information', 'Location', 'Email engagement', 'Created by', 'Created at', 'Social media profiles'].map((section) => (
                            <div key={section}>
                                <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                                    <span>{section}</span>
                                    <span className="text-lg font-bold text-primary">+</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-8">
                    {/* Actions + Search */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Add to lists</Button>
                            <Button variant="ghost" size="sm">Add tags</Button>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="mr-2 h-4 w-4" />More actions</Button>
                        </div>
                        <Input placeholder="Search contacts" className="w-[300px] rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm" />
                    </div>

                    {/* Contacts Table */}
                    <ContactsTable refreshTrigger={refreshCounter} onTotalContactsChange={(total) => setTotalContacts(total)} />

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-6 space-x-4">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                        <span className="text-sm text-gray-600">Page {currentPage}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => prev + 1)}>Next</Button>
                    </div>
                </main>
            </div>
        </div>
    );
}