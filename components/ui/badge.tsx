'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-purple-600 text-white hover:bg-purple-700',
                secondary: 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
                outline: 'text-gray-800 border-gray-200 bg-transparent',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
        );
    }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
