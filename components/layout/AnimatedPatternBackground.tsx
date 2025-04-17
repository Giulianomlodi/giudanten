'use client'

import React from 'react';

const AnimatedPatternBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url('LogoBG.png')`,
                    backgroundSize: '120px',
                    backgroundRepeat: 'repeat',
                    transform: 'rotate(-15deg) scale(1.5)',
                    opacity: 0.1,
                    animation: 'slideBackground 20s linear infinite'
                }}
            />
            <style jsx>{`
        @keyframes slideBackground {
          0% {
            background-position: 0px 0px;
          }
          100% {
            background-position: 100px 100px;
          }
        }
      `}</style>
        </div>
    );
};

export default AnimatedPatternBackground;