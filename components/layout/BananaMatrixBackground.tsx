'use client'

import React, { useEffect, useState } from 'react';
import { Banana } from 'lucide-react';

interface BananaProps {
    id: number;
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
    rotation: number;
}

const BananaMatrixBackground = () => {
    const [bananas, setBananas] = useState<BananaProps[]>([]);

    // Generate random position and speed for each banana
    const createBanana = (): BananaProps => {
        return {
            id: Math.random(),
            x: Math.random() * 100, // Random x position (0-100%)
            y: -20, // Start above viewport
            speed: 1 + Math.random() * 2, // Random fall speed
            size: 16 + Math.random() * 16, // Random size between 16-32px
            opacity: 0.1 + Math.random() * 0.4, // Random opacity
            rotation: Math.random() * 360 // Random rotation
        };
    };

    useEffect(() => {
        // Initialize some bananas
        const initialBananas = Array.from({ length: 50 }, () => createBanana());
        setBananas(initialBananas);

        // Animation loop
        const interval = setInterval(() => {
            setBananas(prevBananas => {
                return prevBananas.map(banana => {
                    // Update position
                    const newY = banana.y + banana.speed;

                    // Reset banana if it goes off screen
                    if (newY > 120) {
                        return createBanana();
                    }

                    return {
                        ...banana,
                        y: newY,
                        rotation: banana.rotation + banana.speed // Slowly rotate while falling
                    };
                });
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {bananas.map(banana => (
                <div
                    key={banana.id}
                    className="absolute z-0"
                    style={{
                        left: `${banana.x}%`,
                        top: `${banana.y}%`,
                        transform: `rotate(${banana.rotation}deg)`,
                        transition: 'transform 0.05s linear',
                    }}
                >
                    <Banana
                        size={banana.size}
                        className="text-yellow-400 z-0"
                        style={{ opacity: banana.opacity }}
                    />
                </div>
            ))}
        </div>
    );
};

export default BananaMatrixBackground;