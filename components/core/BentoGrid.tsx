'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BentoGridProps {
    className?: string
    children: ReactNode
}

export function BentoGrid({ className, children }: BentoGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto",
                className
            )}
        >
            {children}
        </div>
    )
}
