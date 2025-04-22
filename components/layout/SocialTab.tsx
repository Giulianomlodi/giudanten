
"use client";
import React from "react";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import styles from "@/app/styles/menu.module.css";

interface SocialTabProps {
    onItemClick?: () => void;
}

const SocialTab: React.FC<SocialTabProps> = ({ onItemClick = () => {} }) => {
    return (
        <nav className={styles.nav}>
            <ul className={styles.menuList}>
                <li className={styles.socialIcons}>
                    <a
                        href="https://x.com/hyperboops"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onItemClick}
                    >
                        <FaXTwitter />
                    </a>

                    <a
                        href="https://discord.gg/eNepjYv7kS"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onItemClick}
                    >
                        <FaDiscord />
                    </a>
                </li>
            </ul>
        </nav>
    );
};

export default SocialTab;