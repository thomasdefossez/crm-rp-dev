'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import type { Session } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';

interface ProvidersProps {
    children: React.ReactNode;
    initialSession?: Session | null;
}

export function Providers({ children, initialSession }: ProvidersProps) {
    return (
        <SessionContextProvider
            supabaseClient={supabase}
            initialSession={initialSession}
        >
            {children}
        </SessionContextProvider>
    );
}