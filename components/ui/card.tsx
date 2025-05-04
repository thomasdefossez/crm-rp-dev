// components/ui/card.tsx
import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
    return <div className="bg-white shadow-md rounded-lg p-6">{children}</div>;
}

export function CardHeader({ children }: { children: ReactNode }) {
    return <div className="text-xl font-semibold">{children}</div>;
}

export function CardContent({ children }: { children: ReactNode }) {
    return <div className="text-sm">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
    return <div className="text-lg font-bold">{children}</div>;
}

export function CardDescription({ children }: { children: ReactNode }) {
    return <div className="text-gray-500">{children}</div>;
}