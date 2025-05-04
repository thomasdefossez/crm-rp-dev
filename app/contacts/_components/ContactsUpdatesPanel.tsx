'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function ContactsUpdatesPanel() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            {/* Illustration */}
            <div className="mb-6">
                <Image
                    src="/media-database-placeholder.png" // Remplace par ton image dans /public/
                    alt="Media Database Illustration"
                    width={120}
                    height={120}
                />
            </div>
            {/* Titre */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                You will find updates about contacts added from Media Database here.
            </h2>
            {/* Sous-texte */}
            <p className="text-sm text-gray-600 max-w-md">
                We evaluate user feedback daily to keep the updated and ready to use, but certain updates can take up to a few weeks.
            </p>
            {/* Lien */}
            <Button
                variant="link"
                className="text-blue-600 text-sm mt-4"
                onClick={() => alert('Report outdated contact clicked!')}
            >
                How to report outdated contact
            </Button>
        </div>
    );
}