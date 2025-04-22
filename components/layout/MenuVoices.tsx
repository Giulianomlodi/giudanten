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

// Questo è un componente di test temporaneo che sostituisce MenuVoices originale
// per verificare se è la causa del problema delle pagine bianche

"use client";
import React from "react";
import Link from "next/link";
import styles from "@/app/styles/menu.module.css";

interface MenuVoicesProps {
  onItemClick?: () => void;
}

const MenuVoices: React.FC<MenuVoicesProps> = ({ onItemClick = () => {} }) => {
  return (
    <nav className={styles.nav || "flex space-x-4"}>
      <ul className={styles.menuList || "flex space-x-4"}>
        <li>
          <Link href="/" onClick={onItemClick} className="text-white hover:text-gray-300">
            Home
          </Link>
        </li>
        <li>
          <Link href="/test-simple" onClick={onItemClick} className="text-white hover:text-gray-300">
            Test Semplice
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MenuVoices;