'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Papa from 'papaparse';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';

export default function FileUploadButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFormat, setSelectedFormat] = useState('');
    const router = useRouter();

    const handleUploadClick = () => {
        if (!selectedFormat) {
            toast.error('Veuillez sélectionner un format avant de continuer.');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const fileContent = event.target?.result;
                if (typeof fileContent === 'string') {
                    const parsed = Papa.parse(fileContent, { header: true });
                    const fields = parsed.meta.fields;

                    if (fields && Array.isArray(fields)) {
                        localStorage.setItem('imported_columns', JSON.stringify(fields));
                        toast.success(`Fichier "${file.name}" importé avec succès.`);
                        setTimeout(() => {
                            router.push('/settings/import/match-columns');
                        }, 1500);
                    } else {
                        toast.error("Aucune colonne détectée dans le fichier.");
                    }
                }
            };

            reader.onerror = () => {
                toast.error('Erreur lors de la lecture du fichier.');
            };

            reader.readAsText(file);
        } else {
            toast.error('Aucun fichier sélectionné.');
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Format du fichier
                </label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value=".csv">CSV (.csv)</SelectItem>
                        <SelectItem value=".txt">Texte (.txt)</SelectItem>
                        <SelectItem value=".xls">Excel (.xls)</SelectItem>
                        <SelectItem value=".xlsx">Excel (.xlsx)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={selectedFormat}
                onChange={handleFileChange}
            />

            <button
                onClick={handleUploadClick}
                disabled={!selectedFormat}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
                Importer
            </button>
        </div>
    );
}