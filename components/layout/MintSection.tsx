import React from 'react';
import Image from 'next/image';
import styles from '@/app/styles/hero.module.css';



const Hero = () => {
    return (
        <>

            <section className={styles.heroSection}>
                <div className={styles.heroContainer}>
                    <div className={styles.imageColumn}>
                        <video
                            src="/video/NFT.mp4"
                            className={styles.heroVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    </div>
                    <div className={styles.contentColumn}>
                        <Image className={styles.imageSake} src="/sakeIMG.jpg" alt="Sake Logo" width={400} height={400} />
                        <div className={styles.introSake}>
                            <p>This is the Edition 1 Membership &ldquo;一級&rdquo;, with only <strong>100 seats</strong> available.</p>
                            <p> <strong>Join us</strong> now for an awesome <strong>Sake vibe</strong> and let&apos;s dive deeper into the world of <strong>premium</strong> Sake together!</p>
                        </div>
                        <div className={styles.mintOptions}>


                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Hero;