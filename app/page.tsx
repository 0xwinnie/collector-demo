"use client";

import PrivyConnect from "@/app/components/PrivyConnect";
import NftGallery from "@/app/components/NftGallery";
import PackOpener from "@/app/components/PackOpener";
import StockDisplay from "@/app/components/StockDisplay";
import RecentWinners from "@/app/components/RecentWinners";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useState } from "react";

export default function Home() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const owner = wallets?.[0]?.address;
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePackOpened = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Collector Crypt Gacha
        </h1>

        {/* Wallet Connection */}
        <div className="mb-8 flex justify-center">
          <PrivyConnect />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Stock & Winners */}
          <div className="lg:col-span-1 space-y-6">
            <StockDisplay />
            <RecentWinners />
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3">
            {ready && authenticated && owner ? (
              <div className="space-y-8">
                {/* Pack Opener */}
                <div className="bg-gray-800 rounded-xl p-6 text-center">
                  <h2 className="text-xl font-semibold text-white mb-4">Open a Pack</h2>
                  <PackOpener onPackOpened={handlePackOpened} />
                </div>

                {/* NFT Gallery */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Your NFT Collection</h2>
                  <NftGallery owner={owner} key={refreshKey} />
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🎴</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome to Collector Crypt Gacha
                </h2>
                <p className="text-gray-400 mb-6">
                  {ready ? "Connect your wallet to start opening packs and collecting NFTs!" : "Loading..."}
                </p>
                {ready && !authenticated && (
                  <div className="inline-block animate-bounce text-4xl">👆</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
