import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import styles from "@/app/styles/menu.module.css";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

interface MenuVoicesProps {
  onItemClick: () => void;
}

const MenuVoices: React.FC<MenuVoicesProps> = ({ onItemClick }) => {
  const handleClick = () => {
    onItemClick();
  };

  return (
    <nav className={styles.nav}>
      <NavigationMenu>
        <NavigationMenuList className={styles.menuList}>
          <NavigationMenuItem className={styles.hideOnMobile}>
            <Link href="/" onClick={handleClick} className={styles.hideOnMobile}>
              Home
            </Link>

          </NavigationMenuItem>
          <NavigationMenuItem className={styles.hideOnMobile}>
            <Link href="/fart-your-boop" onClick={handleClick} className={styles.hideOnMobile}>
              Fart your Boop
            </Link>

          </NavigationMenuItem>




          <NavigationMenuItem className={styles.hideOnMobile}>
            <Link href="/profile" onClick={handleClick} className={styles.hideOnMobile}>
              Profile
            </Link>

          </NavigationMenuItem>



          {/* <NavigationMenuItem className={styles.hideOnMobile}>
            <Link target="_blank" href="https://flipbookpdf.net/web/site/6b98acfe2183ea5e2990ee549025974efddd7f5b202412.pdf.html" onClick={handleClick} className={styles.hideOnMobile}>
              Fumetto 2
            </Link>

          </NavigationMenuItem> */}

          <NavigationMenuItem className={styles.socialIcons}>
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
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              onClick={onItemClick}
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
            {/* <a
              href="https://dexscreener.com/apechain/0x735de94d0b805a41e81a58092852516559ac9069"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onItemClick}
              className="flex items-center"
            >
              <div className="w-[1em] h-[1em] relative">
                <Image
                  src="/DexScreen.png"
                  alt="DexScreener"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </a> */}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

export default MenuVoices;