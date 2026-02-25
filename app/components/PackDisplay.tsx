"use client";

import * as React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { MachineType } from "./MachineToggle";

type Rarity = {
  name: string;
  color: string;
  valueRange: [number, number];
  probability: number;
};

type PackData = {
  name: string;
  price: number;
  expectedValue: number;
  cardCount: number;
  buybackPercentage: number;
  bigWinChance: number;
  rarities: Rarity[];
  thumbnail?: string;
};

const PACK_DATA: Record<MachineType, PackData> = {
  PKMN_50: {
    name: "Elite Pokémon Gacha Pack",
    price: 50,
    expectedValue: 55.18,
    cardCount: 1,
    buybackPercentage: 85,
    bigWinChance: 20,
    thumbnail: "/packs/pokemon-pack.png",
    rarities: [
      { name: "Common", color: "#FACC15", valueRange: [30, 60], probability: 80 },
      { name: "Uncommon", color: "#22C55E", valueRange: [60, 110], probability: 15 },
      { name: "Rare", color: "#3B82F6", valueRange: [110, 250], probability: 4 },
      { name: "Epic", color: "#EF4444", valueRange: [250, 2000], probability: 1 },
    ],
  },
  SNS_25: {
    name: "SNS Domain Gacha Pack",
    price: 25,
    expectedValue: 28.5,
    cardCount: 1,
    buybackPercentage: 85,
    bigWinChance: 20,
    thumbnail: "/packs/sns-pack.png",
    rarities: [
      { name: "Common", color: "#FACC15", valueRange: [15, 30], probability: 80 },
      { name: "Uncommon", color: "#22C55E", valueRange: [30, 60], probability: 15 },
      { name: "Rare", color: "#3B82F6", valueRange: [60, 150], probability: 4 },
      { name: "Epic", color: "#EF4444", valueRange: [150, 500], probability: 1 },
    ],
  },
};

interface PackDisplayProps {
  machineType: MachineType;
  onOpenPack: (machineType: MachineType, turbo: boolean) => void;
  isOpening: boolean;
  openingPhase?: string;
}

export default function PackDisplay({
  machineType,
  onOpenPack,
  isOpening,
  openingPhase = "",
}: PackDisplayProps) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  const [turbo, setTurbo] = React.useState(false);
  const [showTurboInfo, setShowTurboInfo] = React.useState(false);

  const pack = PACK_DATA[machineType];
  const isConnected = ready && authenticated && wallet;

  const handleOpenPack = () => {
    if (!isConnected) return;
    onOpenPack(machineType, turbo);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Pack Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-start gap-4">
          {/* Pack Thumbnail */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl" />
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-4xl shadow-lg">
              {machineType === "PKMN_50" ? "🎴" : "🔗"}
            </div>
            {/* Guaranteed Badge */}
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
              ✓
            </div>
          </div>

          {/* Pack Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{pack.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span>🛡️</span>
                Guaranteed Authenticity
              </span>
            </div>
          </div>
        </div>

        {/* Expected Value */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1 text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
            </svg>
            <span className="text-2xl font-bold">${pack.expectedValue.toFixed(2)}</span>
          </div>
          <span className="text-gray-500 text-sm">Expected Value</span>
        </div>
      </div>

      {/* Action Section */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-col gap-4">
          {/* Open Button */}
          <button
            onClick={handleOpenPack}
            disabled={isOpening || !isConnected}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all duration-300 ${
              isOpening
                ? "bg-gradient-to-r from-purple-500 to-pink-500 cursor-not-allowed"
                : isConnected
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25"
                : "bg-gray-700 cursor-not-allowed opacity-60"
            }`}
          >
            {isOpening ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {openingPhase || "Opening..."}
              </span>
            ) : isConnected ? (
              <span>Open ${pack.price} Pack</span>
            ) : (
              <span>Sign In to Open</span>
            )}
          </button>

          {/* Turbo Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTurbo(!turbo)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  turbo ? "bg-blue-500" : "bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    turbo ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-white">Turbo</span>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTurboInfo(true)}
                  onMouseLeave={() => setShowTurboInfo(false)}
                  className="w-5 h-5 rounded-full bg-gray-700 text-gray-400 text-xs flex items-center justify-center hover:bg-gray-600 hover:text-white transition-colors"
                >
                  i
                </button>
                {showTurboInfo && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 rounded-lg text-xs text-gray-300 shadow-xl border border-gray-700">
                    Turbo mode skips animations for faster pack opening
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                )}
              </div>
            </div>

            {/* Points Info (mock) */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🎁</span>
              <span>Free packs: 0/3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 border-b border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-gray-500 text-xs mb-1">Pack contains</div>
            <div className="text-white font-bold text-lg">{pack.cardCount} Card</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs mb-1">Instant buyback offer</div>
            <div className="text-white font-bold text-lg">{pack.buybackPercentage}%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs mb-1">Big win chance</div>
            <div className="text-white font-bold text-lg">{pack.bigWinChance}%</div>
          </div>
        </div>
      </div>

      {/* Rarity Distribution */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Statistics:</h4>
        <ul className="space-y-2">
          {pack.rarities.map((rarity) => (
            <li key={rarity.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: rarity.color }}
                />
                <span className="text-white">{rarity.name}</span>
                <span className="text-gray-500">
                  (${rarity.valueRange[0]} - ${rarity.valueRange[1]}+)
                </span>
              </div>
              <span className="text-gray-400">{rarity.probability}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-600">
          Pricing data is taken from ALT, eBay and other platforms and is subject to change.
        </p>
      </div>
    </div>
  );
}

export { PACK_DATA };
export type { PackData, Rarity };