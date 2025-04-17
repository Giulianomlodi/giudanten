import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import Image from 'next/image'; // Added import for next/image

export function BentoGridSecondDemo() {
    return (
        <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
            {items.map((item, i) => (
                <BentoGridItem
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    className={item.className}

                />
            ))}
        </BentoGrid>
    );
}
const Skeleton = ({ img }: { img: string }) => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black">
        <Image src={img} alt="Skeleton Image" layout="fill" objectFit="cover" className="rounded-xl" /> {/* Replaced <img> with <Image> */}
    </div>
);
const items = [
    {
        title: "The Dawn of Innovation",
        description: "Explore the birth of groundbreaking ideas and inventions.",
        header: <Skeleton img="images/sake_hero_section.png" />,
        className: "md:col-span-2"
    },
    {
        title: "The Digital Revolution",
        description: "Dive into the transformative power of technology.",
        header: <Skeleton img="images/sake_hero_section.png" />,
        className: "md:col-span-1"
    },
    {
        title: "The Art of Design",
        description: "Discover the beauty of thoughtful and functional design.",
        header: <Skeleton img="images/sake_hero_section.png" />,
        className: "md:col-span-1"
    },
    {
        title: "The Power of Communication",
        description: "Understand the impact of effective communication in our lives.",
        header: <Skeleton img="images/sake_hero_section.png" />,
        className: "md:col-span-2"
    },
];
