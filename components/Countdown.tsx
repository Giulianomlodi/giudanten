// Countdown.tsx
import React, { useState, useEffect } from 'react';

interface CountdownProps {
    startTime?: number;
    endTime?: number;
}

export const Countdown: React.FC<CountdownProps> = ({ startTime, endTime }) => {
    const [countdown, setCountdown] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            let timeLeft;

            if (!startTime || now < startTime) {
                timeLeft = startTime ? startTime - now : 0;
                setCountdown(`Starts in: ${formatTime(timeLeft)}`);
            } else if (!endTime || now < endTime) {
                timeLeft = endTime ? endTime - now : 0;
                setCountdown(`Ends in: ${formatTime(timeLeft)}`);
            } else {
                setCountdown("Phase Ended");
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, endTime]);

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "0:00:00";

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    return (
        <p className="text-blue-300 text-sm mt-2">{countdown}</p>
    );
};

// PriceCard.tsx
interface PriceCardProps {
    isActive: boolean;
    phase: string;
    price: string;
    boost?: string;
    startTime?: number;
    endTime?: number;
}

export const PriceCard: React.FC<PriceCardProps> = ({
    isActive,
    phase,
    price,
    boost,
    startTime,
    endTime
}) => (
    <div className={`
        p-4 rounded-lg transition-all duration-300
        ${isActive
            ? 'bg-blue-500/20 border-2 border-blue-500'
            : 'bg-black/20 border-2 border-transparent'
        }
    `}>
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-semibold">{phase}</h4>
            {isActive && (
                <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                    Active
                </span>
            )}
        </div>
        <p className="text-white text-lg font-bold">{price}</p>
        {boost && (
            <p className="text-green-400 text-sm mt-1">+ {boost}</p>
        )}
        <Countdown startTime={startTime} endTime={endTime} />
    </div>
);