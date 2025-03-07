"use client";

import React, { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWallet } from "./rainbow-kit-wrapper-component";
import { ModeToggle } from "@/components";
import Link from "next/link";

const NavBar = () => {
  const { address, isConnected } = useAccount();
  const { setWalletAddress } = useWallet();

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
    if (!isConnected) {
      setWalletAddress("");
    }
  }, [address, setWalletAddress, isConnected]);

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center justify-between px-4 container mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold hover:opacity-80">
            SvasChain
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="ml-auto flex items-center space-x-4">
            <ConnectButton />
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
