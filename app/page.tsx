"use client";

import PrivyConnect from "@/app/components/PrivyConnect";
import NftGallery from "@/app/components/NftGallery";
import PackOpener from "@/app/components/PackOpener";
import { useWallets } from "@privy-io/react-auth/solana";
import { useState } from "react";

export default function Home() {
  const { wallets } = useWallets();
  const owner = wallets?.[0]?.address;
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePackOpened = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* GitHub Link */}
      <div className="text-center mb-4">
        <a
          href="https://github.com/daxherrera/gacha-starter"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          View Starter Code on GitHub
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">
        Collector Crypt Gacha Starter
      </h1>

      {/* Wallet Connection */}
      <div className="mb-8 text-center">
        <PrivyConnect />
      </div>

      <div className="space-y-8">
        {/* Pack Opener */}
        <PackOpener onPackOpened={handlePackOpened} />

        {/* NFT Gallery - Always visible */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your NFT Collection</h2>
          <NftGallery owner={owner} key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
