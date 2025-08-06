

"use client"

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function LiveClock() {
    const [currentTime, setCurrentTime] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const timer = setInterval(() => {
            const now = new Date();
            const timeZone = 'Africa/Nouakchott';
            const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone });
            const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone, hour12: false });
            setCurrentTime(`${date}, ${time}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!isClient) {
        // Render nothing on the server and initial client render to avoid mismatch
        return null;
    }

    return (
        <div className="hidden items-center gap-2 rounded-md bg-black/50 px-3 py-1 text-sm font-medium text-white lg:flex">
            <Clock className="h-4 w-4 text-primary" />
            <span className="tabular-nums">{currentTime}</span>
        </div>
    );
}
