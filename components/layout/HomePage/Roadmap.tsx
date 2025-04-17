'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, ScrollText, Code, Users, Flame, LucideIcon } from 'lucide-react';

interface RoadmapItemProps {
    date: string;
    icon: LucideIcon;
    title: string;
    description: string;
    callToAction: string;
    index: number;
}

interface RoadmapData {
    date: string;
    icon: LucideIcon;
    title: string;
    description: string;
    callToAction: string;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ date, icon: Icon, title, description, callToAction, index }) => {
    return (
        <div className="w-full">
            {/* Mobile Version */}
            <div className="block md:hidden px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="bg-[#004BE0]/40 rounded-2xl p-4 w-full"
                >
                    <div className="text-[#F5C000] text-sm font-semibold mb-2">{date}</div>
                    <h3 className="text-xl font-bold mb-2 text-white break-words">{title}</h3>
                    <p className="text-gray-200 text-sm mb-4 break-words">{description}</p>
                    <button className="w-full bg-[#004BE0] text-[#F5C000] px-4 py-2 rounded-full 
                                     text-xs font-bold whitespace-normal text-center
                                     hover:bg-[#004BE0]/80 transition-colors duration-300">
                        {callToAction}
                    </button>
                </motion.div>
            </div>

            {/* Desktop Version */}
            <div className="hidden md:flex items-center justify-center w-full">
                <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="flex flex-row w-full max-w-5xl relative"
                >
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 w-12 h-12 -translate-x-1/2 bg-[#F5C000] rounded-full flex items-center justify-center z-20 shadow-lg">
                        <Icon className="w-6 h-6 text-[#004BE0]" />
                    </div>

                    {/* Content card */}
                    <div
                        className={`
                            ${index % 2 === 0
                                ? 'pr-16 text-right mr-auto'
                                : 'pl-16 ml-auto'
                            }
                            w-[calc(50%-2rem)]
                        `}
                    >
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl hover:bg-white/20 transition-all duration-300 border border-[#FFC800]/20">
                            <div className="text-[#F5C000] font-bold mb-2">{date}</div>
                            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
                            <p className="text-gray-300 mb-4">{description}</p>
                            <div className="inline-block bg-[#004BE0] text-[#F5C000] px-4 py-2 rounded-full text-sm font-bold hover:bg-[#004BE0]/80 transition-colors duration-300 cursor-pointer">
                                {callToAction}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const Roadmap: React.FC = () => {
    const roadmapData: RoadmapData[] = [
        {
            date: "3rd Nov",
            icon: Hammer,
            title: "ARTWORK OTHERSIDE",
            description: "Introducing new builders in our Honorary Collection (Frostyz, Nash, Gucchetah) with new artwork. A call to action for builders supporting bananas to join the mission.",
            callToAction: "JOIN THE MISSION"
        },
        {
            date: "4th Nov",
            icon: Code,
            title: "TECH",
            description: "Enabling banana farming capabilities. Dashboard goes live for enhanced functionality.",
            callToAction: "DELIST YOUR BANANAS TO OBTAIN MORE POINTS"
        },
        {
            date: "7th Nov",
            icon: ScrollText,
            title: "MADEBYAPES",
            description: "Detailed explanation of Banana IP usage and implementation guidelines.",
            callToAction: "JOIN THE MISSION"
        },
        {
            date: "13th Nov",
            icon: Users,
            title: "MADEBYAPES & IP",
            description: "Rida's video featuring BAYC honorary members discovering the giant banana.",
            callToAction: "HOLD STRONG YOUR BANANA"
        },
        {
            date: "14th Nov",
            icon: Flame,
            title: "ART",
            description: "Single art piece collection launch with 2-hour airdrop window. Banksy-inspired supply burn event.",
            callToAction: "PROOF OF UNITY"
        }
    ];

    return (
        <section className="w-full max-w-full overflow-hidden py-8 md:py-16">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 md:mb-16 px-4"
            >
                <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 text-white">Roadmap</h2>
                <p className="text-gray-300 text-sm md:text-lg">
                    Our journey to revolutionize the Apechain ecosystem
                </p>
            </motion.div>

            {/* Timeline container */}
            <div className="relative">
                {/* Timeline line - Desktop only */}
                <div className="hidden md:block absolute left-1/2 w-0.5 h-full bg-[#FFC800]/30 -translate-x-1/2" />

                {/* Roadmap items */}
                <div className="flex flex-col gap-4 md:gap-12 w-full">
                    {roadmapData.map((item, index) => (
                        <RoadmapItem key={index} {...item} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Roadmap;