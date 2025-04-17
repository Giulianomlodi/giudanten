// components/templates/PartnerPageTemplate.tsx
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export interface SectionProps {
    title: string;
    content: React.ReactNode;
    imageSrc: string;
    imageAlt?: string;
}

interface PartnerPageTemplateProps {
    heroTitle: string;
    heroImage: string;
    introContent: string;
    sections: SectionProps[];
}

const PartnerPageTemplate: React.FC<PartnerPageTemplateProps> = ({
    heroTitle,
    heroImage,
    introContent,
    sections,
}) => {
    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${heroImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                </div>
                <div className="relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold mb-4"
                    >
                        {heroTitle}
                    </motion.h1>
                </div>
            </section>

            {/* Intro Section */}
            <section className="py-20 px-4 md:px-20">
                <div className="container mx-auto">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-[1.1rem] text-center max-w-3xl mx-auto"
                    >
                        {introContent}
                    </motion.p>
                </div>
            </section>

            {/* Content Sections */}
            {sections.map((section, index) => (
                <Section key={index} {...section} isEven={index % 2 === 0} />
            ))}
        </div>
    );
};

const Section: React.FC<SectionProps & { isEven: boolean }> = ({
    title,
    content,
    imageSrc,
    imageAlt,
    isEven,
}) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <motion.section
            ref={ref}
            className={`py-20 px-4 md:px-20 ${isEven ? 'bg-gray-900' : 'bg-[#020617]'}`}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
        >
            <div className={`container mx-auto flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                <motion.div className="w-full md:w-1/2">
                    <div className="relative w-full h-[400px] rounded-[15px] overflow-hidden">
                        <Image
                            src={imageSrc}
                            alt={imageAlt || title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                    </div>
                </motion.div>
                <motion.div className="w-full md:w-1/2">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
                    <div className="text-lg text-gray-300">{content}</div>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default PartnerPageTemplate;