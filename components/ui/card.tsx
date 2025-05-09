// components/ui/card.tsx
import { ReactNode } from 'react';
import { cn } from "@/lib/utils";

export function Card({ children }: { children: ReactNode }) {
    return <div className="bg-white shadow-md rounded-lg p-6">{children}</div>;
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("text-xl font-semibold", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("text-sm", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("text-lg font-bold", className)}>{children}</div>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("text-gray-500", className)}>{children}</div>;
}