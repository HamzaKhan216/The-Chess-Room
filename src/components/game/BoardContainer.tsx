"use client"

import React, { useRef, useEffect, useState } from 'react';

interface BoardContainerProps {
    children: (size: number) => React.ReactNode;
    widthPadding?: number;
    heightPadding?: number;
    maxSize?: number;
}

export function BoardContainer({ 
    children, 
    widthPadding = 500, 
    heightPadding = 100, 
    maxSize = 800 
}: BoardContainerProps) {
    const [size, setSize] = useState(400);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth - widthPadding;
            const height = window.innerHeight - heightPadding;
            const newSize = Math.min(width, height, maxSize);
            setSize(Math.max(Math.floor(newSize / 8) * 8, 320));
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [widthPadding, heightPadding, maxSize]);

    return (
        <div ref={containerRef} className="flex items-center justify-center w-full h-full relative">
            {children(size)}
        </div>
    );
}
