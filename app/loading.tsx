// create cool loading screen

import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen w-screen bg-black">
            <div className="text-white text-4xl">
                Loading...
            </div>
        </div>
    )
}

export default LoadingScreen;
