
// import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import styles from "@/app/styles/menu.module.css";
import Image from "next/image";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";

interface SocialTab {
    onItemClick: () => void;
}

const SocialTab: React.FC<SocialTab> = () => {



    return (
        <nav className={styles.nav}>
            <ul className={styles.menuList}>
                <li className={styles.socialIcons}>
                    <a
                        href="https://x.com/hyperboops"
                        target="_blank"
                        rel="noopener noreferrer"

                    >
                        <FaXTwitter />
                    </a>

                    <a
                        href="https://discord.gg/eNepjYv7kS"
                        target="_blank"
                        rel="noopener noreferrer"

                    >
                        <FaDiscord />
                    </a>
                    <a
                        href=""
                        target="_blank"
                        rel="noopener noreferrer"

                        className="flex items-center"
                    >
                        {/* <div className="w-[1em] h-[1em] relative">
                            <Image
                                src="/MagicEden.png"
                                alt="Magic Eden"
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </div> */}
                    </a>

                </li>
            </ul>
        </nav>
    );
};

export default SocialTab;