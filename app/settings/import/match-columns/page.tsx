'use client';

import React, { useEffect, useState } from 'react';

export default function MatchColumnsPage() {
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('imported_columns');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setColumns(parsed);
        }
      } catch (err) {
        console.error('Erreur de parsing des colonnes :', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Faire correspondre les colonnes</h1>
        <p className="text-gray-600 text-center text-sm">
          Associez les colonnes de votre fichier avec les champs attendus (nom, prénom, email, etc.).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {columns.length > 0 ? (
            columns.map((col, i) => (
              <div key={i} className="border border-green-300 rounded-lg bg-green-50 p-4">
                <div className="font-medium text-green-900 mb-1">Colonne détectée</div>
                <div className="text-sm text-gray-800">{col}</div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500 italic">Aucune colonne détectée</p>
          )}
        </div>
      </div>
    </div>
  );
}