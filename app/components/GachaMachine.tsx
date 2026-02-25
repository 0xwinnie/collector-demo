"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import MachineToggle, { MachineType } from "./MachineToggle";
import PackDisplay from "./PackDisplay";
import RecentWinners from "./RecentWinners";

type OpeningPhase = "" | "Generating Pack..." | "Signing Transaction..." | "Submitting Transaction..." | "Opening..." | "Success!";

interface OpenedCard {
  id: string;
  name: string;
  imageUrl: string;
  insuredValue: number;
  grade: string;
  rarity: string;
}

interface GachaMachineProps {
  selectedMachine: MachineType;
  onSelectMachine: (machine: MachineType) => void;
}

export default function GachaMachine({ selectedMachine, onSelectMachine }: GachaMachineProps) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  const [isOpening, setIsOpening] = useState(false);
  const [openingPhase, setOpeningPhase] = useState<OpeningPhase>("");
  const [error, setError] = useState<string | null>(null);
  const [openedCard, setOpenedCard] = useState<OpenedCard | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isConnected = ready && authenticated && wallet;

  const getPackType = (machine: MachineType): string => {
    return machine === "PKMN_50" ? "pokemon_50" : "sns_25";
  };

  const handleOpenPack = useCallback(async (machine: MachineType, turbo: boolean) => {
    if (!isConnected || !wallet) {
      setError("Please connect your wallet first");
      return;
    }

    setIsOpening(true);
    setError(null);
    setOpenedCard(null);
    setShowResult(false);

    try {
      const packType = getPackType(machine);

      // Step 1: Generate Pack
      setOpeningPhase("Generating Pack...");
      const generateResponse = await fetch("/api/generatePack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packType }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate pack");
      }

      const packData = await generateResponse.json();

      // Step 2: Sign the transaction
      setOpeningPhase("Signing Transaction...");
      
      // Convert base64 to Uint8Array for Solana wallet
      const transactionBytes = new Uint8Array(Buffer.from(packData.transaction, 'base64'));

      const signResult = await wallet.signTransaction({
        transaction: transactionBytes
      });

      const signedTx = Buffer.from(signResult.signedTransaction).toString('base64');

      // Step 3: Submit the signed transaction
      setOpeningPhase("Submitting Transaction...");
      const submitResponse = await fetch("/api/submitTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction: signedTx,
        }),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || "Failed to submit transaction");
      }

      const result = await submitResponse.json();

      // Step 3: Show result
      setOpeningPhase("Success!");
      
      if (result.nft) {
        setOpenedCard({
          id: result.nft.id,
          name: result.nft.name,
          imageUrl: result.nft.imageUrl || `https://placehold.co/300x400/1a1a1a/3b82f6?text=${encodeURIComponent(result.nft.name)}`,
          insuredValue: result.nft.insuredValue || 0,
          grade: result.nft.grade || "Ungraded",
          rarity: result.nft.rarity || "common",
        });
        setShowResult(true);
      }

    } catch (err) {
      console.error("Pack opening error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsOpening(false);
      setOpeningPhase("");
    }
  }, [isConnected, wallet]);

  const handleCloseResult = () => {
    setShowResult(false);
    setOpenedCard(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Gacha Machine Visual */}
      <div className="relative bg-[#1A1A1A] rounded-2xl border border-gray-800 overflow-hidden">
        {/* Machine Header */}
        <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎰</span>
              <span className="font-bold text-white">Gacha Machine</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </div>
          </div>
        </div>

        {/* Machine Visual */}
        <div className="p-6 flex justify-center">
          <div className="relative w-48 h-48">
            {/* Machine Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" />
            
            {/* Machine Body */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-700 flex items-center justify-center shadow-2xl">
              {/* Screen */}
              <div className="w-32 h-32 bg-black rounded-2xl border-2 border-gray-600 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="text-4xl mb-1">
                    {selectedMachine === "PKMN_50" ? "🎴" : "🔗"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {selectedMachine === "PKMN_50" ? "PKMN $50" : "SNS $25"}
                  </div>
                </div>
              </div>
              
              {/* Decorative Lights */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150" />
              </div>
            </div>

            {/* Coin Slot */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-gray-700 rounded-r-lg border-l border-gray-600" />
          </div>
        </div>

        {/* Machine Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-center text-sm text-gray-400">
            Insert coin to play • Instant delivery
          </p>
        </div>
      </div>

      {/* Machine Toggle */}
      <div className="flex justify-center">
        <MachineToggle
          selectedMachine={selectedMachine}
          onSelectMachine={onSelectMachine}
        />
      </div>

      {/* Pack Display */}
      <PackDisplay
        machineType={selectedMachine}
        onOpenPack={handleOpenPack}
        isOpening={isOpening}
        openingPhase={openingPhase}
      />

      {/* Recent Winners */}
      <RecentWinners />

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Result Modal */}
      {showResult && openedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-[#1A1A1A] rounded-2xl border border-gray-800 p-8 max-w-md w-full">
            <button
              onClick={handleCloseResult}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">Pack Opened!</h3>
              <p className="text-gray-400 mb-6">You received a new card!</p>

              {/* Card Display */}
              <div className="relative mx-auto w-64 mb-6">
                <div 
                  className="absolute -inset-2 rounded-xl blur opacity-50"
                  style={{ 
                    backgroundColor: openedCard.rarity === 'epic' ? '#EF4444' : 
                                   openedCard.rarity === 'rare' ? '#3B82F6' : '#FACC15' 
                  }}
                />
                <div className="relative bg-[#0A0A0A] rounded-xl overflow-hidden border border-gray-700">
                  <img
                    src={openedCard.imageUrl}
                    alt={openedCard.name}
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>
              </div>

              <h4 className="text-xl font-bold text-white mb-2">{openedCard.name}</h4>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  <span>💎</span>
                  <span className="font-bold">${openedCard.insuredValue.toLocaleString()}</span>
                </div>
                <div className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                  {openedCard.grade}
                </div>
              </div>

              <button
                onClick={handleCloseResult}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-colors"
              >
                Open Another Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
