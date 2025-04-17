import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuVoices from "./MenuVoices";



const MenuMobile = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent style={{ backgroundColor: '#020617' }}>
                <div className="p-4 py-20 space-y-4">
                    <nav className="space-y-2">
                        <MenuVoices onItemClick={handleClose} />

                    </nav>

                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default MenuMobile;