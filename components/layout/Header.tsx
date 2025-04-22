"use client";
import React from "react";
import styles from "@/app/styles/header.module.css";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";

const ClientSideMenu = dynamic(() => import("./ClientSideMenu"), {
  ssr: false
});

const Header = () => {
  return (
    <header className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Hyper Boops</h1>
          </div>
        </Link>
        <ClientSideMenu />
      </div>
    </header>
  );
};

export default Header;
