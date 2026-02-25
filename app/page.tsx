"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MachineType } from "@/app/components/MachineToggle";

const PrivyConnect = dynamic(() => import("@/app/components/PrivyConnect"), {
  ssr: false,
});

const GachaMachine = dynamic(() => import("@/app/components/GachaMachine"), {
  ssr: false,
});

const NftCardGrid = dynamic(() => import("@/app/components/NftCardGrid"), {
  ssr: false,
});

export default function Home() {
  const [selectedMachine, setSelectedMachine] = useState<MachineType>("PKMN_50");

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header - Simplified */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - SNS only */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-xl">
                🎰
              </div>
              <span className="text-xl font-bold text-white">SNS</span>
            </div>

            {/* Connect Button */}
            <PrivyConnect />
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column - NFT Card Grid */}
          <div className="min-h-0">
            <NftCardGrid machineType={selectedMachine} />
          </div>

          {/* Right Column - Gacha Machine */}
          <div className="lg:sticky lg:top-4 h-fit">
            <GachaMachine 
              selectedMachine={selectedMachine}
              onSelectMachine={setSelectedMachine}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Collector Gacha. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
