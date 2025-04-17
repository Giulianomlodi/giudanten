'use client'

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const HeroSection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <section className="hero flex flex-col md:flex-row gap-2 md:gap-40 items-top justify-center px-5 md:px-[195px] pt-20 md:pt-40">
            <div className="md:w-1/2">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-7xl font-bold mb-4 mt-[2.5em] text-white"
                >
                    Welcome to Banana
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-xl mb-8 max-w-md text-white"
                >
                    Enabling a new era of Bananas on Apechain
                </motion.p>
                <div className="flex flex-col md:flex-row gap-4">
                    <Link href="/dashboard" className="bg-[#F5C000] text-white px-6 py-2 rounded-[8px] hover:opacity-80 transition-opacity duration-500 text-center md:text-left font-bold ">
                        Holder Dashboard
                    </Link>
                    <Link target="_blank" href="https://magiceden.io/collections/apechain/0x014ede7658f44557512fa63b4aFcd50a4022f0fe" className="bg-blue-950 text-white px-6 py-2 rounded-[8px]  hover:opacity-80 transition-opacity text-center md:text-left mt-2 md:mt-0 font-bold">
                        Discover the collection
                    </Link>
                </div>
            </div>
            <div className={`md:w-1/2 ${isMobile ? 'h-[50vh] w-full overflow-hidden' : 'h-screen'} mt-8 md:mt-[-100px] flex items-center justify-center`}>
                <div className={isMobile ? 'scale-[0.7] origin-center' : ''}>
                    <Image src='LogoBG.png' alt='Banana' width={600} height={600} />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;