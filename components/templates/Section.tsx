import React from 'react';
import Image from 'next/image';

export interface SectionProps {
    title: string;
    content: React.ReactNode;
    imageSrc?: string;
    isReversed?: boolean;
}

export const Section: React.FC<SectionProps> = ({
    title,
    content,
    imageSrc,
    isReversed = false,
}) => {
    return (
        <section className="py-20 px-4 md:px-20 bg-gray-900 text-white">
            <div
                className="container mx-auto"
                style={{
                    display: 'flex',
                    flexDirection: isReversed ? 'column-reverse' : 'column',
                    gap: '3rem',
                }}
            >
                {imageSrc && (
                    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                        <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            style={{
                                objectFit: 'cover',
                                borderRadius: '15px',
                            }}
                            priority
                        />
                    </div>
                )}
                <div>
                    <h2 className="text-3xl font-bold mb-6">{title}</h2>
                    <div className="text-lg leading-relaxed text-gray-300">
                        {content}
                    </div>
                </div>
            </div>
        </section>
    );
};