"use client";

import React, { useEffect, useState } from "react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWallet } from "./rainbow-kit-wrapper-component";
import { ModeToggle } from "@/components";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const NavBar = () => {
  const { address, isConnected } = useAccount();
  const { setWalletAddress } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
    if (!isConnected) {
      setWalletAddress("");
    }
  }, [address, setWalletAddress, isConnected]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm"
          : "bg-background/50 backdrop-blur-sm"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 container mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold hover:opacity-80">
            SvasChain
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="ml-auto flex items-center space-x-4">
            {isConnected ? (
              <ConnectButton />
            ) : (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={openConnectModal}
              >
                <LogIn className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
          <div>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
