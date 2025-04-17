"use client";
import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import MenuVoices from "./MenuVoices";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SocialTab from "./SocialTab";
import MenuMobile from "./MenuMobile";

function ClientSideMenu() {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [handleItemClick] = useState(() => () => { });

    return isMobile ? (
        <>
            <ConnectButton
                accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                }}
                label="Connect"
            />
            <MenuMobile />
            {/* <SocialTab onItemClick={handleItemClick} /> */}
            {/* <ConnectButton label="Connect" accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
            }} /> */}
        </>
    ) : (
        <>
            <MenuVoices onItemClick={handleItemClick} />
            <ConnectButton />
        </>
    );
}

export default ClientSideMenu;
