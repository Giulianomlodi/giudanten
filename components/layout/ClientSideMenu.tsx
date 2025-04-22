"use client";
import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import MenuVoices from "./MenuVoices";
import SocialTab from "./SocialTab";

const ClientSideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {isMobile ? (
        <>
          <button
            onClick={toggleMenu}
            className="p-2 text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
          {isOpen && (
            <div className="absolute top-10 right-0 bg-black p-4 shadow-lg z-50">
              <MenuVoices />
              <SocialTab onItemClick={() => setIsOpen(false)} />
              {/* ConnectButton rimosso */}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center space-x-4">
          <MenuVoices />
          <SocialTab />
          {/* ConnectButton rimosso */}
        </div>
      )}
    </div>
  );
};

export default ClientSideMenu;
