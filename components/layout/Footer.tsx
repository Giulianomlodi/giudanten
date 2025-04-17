import React from 'react'
import SocialTab from './SocialTab'

export default function Footer() {
    const handleItemClick = () => console.log('Item clicked'); // Example function for handling item clicks

    return (
        <footer className="bg-[#01000b] text-white py-4"> {/* Tailwind CSS class updated to custom color #01000b */}
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0"> {/* Updated for mobile layout */}
                <div className="text-center md:text-left"> {/* Center text on mobile, left on larger screens */}
                    All rights reserved - © 2025 - Hyper Boops
                </div>
                <div className="text-center md:text-right"> {/* Center text on mobile, right on larger screens */}
                    <a href="https://x.com/otakun_0x" rel="noopener noreferrer" target="_blank">
                        {/* Add icon or text here if needed */}
                    </a>
                    <SocialTab onItemClick={handleItemClick} />
                </div>
            </div>
        </footer>
    )
}