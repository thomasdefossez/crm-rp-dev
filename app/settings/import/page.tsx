'use client';

import React from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';
import FileUploadButton from '@/components/ui/FileUploadButton';

export default function ImportSettingsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardNavbar />

      <main className="max-w-5xl mx-auto px-8 py-12 flex-grow">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 space-x-1">
          <span>Home</span>
          <span>&rarr;</span>
          <span>Contacts</span>
          <span>&rarr;</span>
          <span className="text-gray-400">Import contacts</span>
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 mb-10">Import contacts</h1>

        <div className="max-w-xl border rounded-xl px-8 py-10 shadow-sm mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            Import your own media contacts
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            Manage all of your contacts within Briefly. You can always update them<br />
            or upload more lists at any time.
          </p>

          <div className="space-y-6 text-sm text-gray-800">
            <div>
              <p className="mb-1 font-medium">Add contacts to lists?</p>
              <button className="text-blue-600 font-medium hover:underline">+ Add lists</button>
            </div>
            <div>
              <p className="mb-1 font-medium">Add tags to contacts?</p>
              <button className="text-blue-600 font-medium hover:underline">+ Add tags</button>
            </div>
          </div>

          <div className="flex justify-end mt-10 gap-3">
            <button className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <FileUploadButton className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" />
          </div>
        </div>
      </main>
      <footer className="border-t text-sm text-gray-500 px-6 py-4 text-center">
        Made in Paris with ❤️ — Briefly
      </footer>
    </div>
  );
}