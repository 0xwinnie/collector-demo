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
            {/* Logo - SNS */}
            <div className="flex items-center gap-3">
              {/* SNS Green Hexagonal Icon */}
              <div className="w-10 h-10 relative">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  {/* Outer hexagon */}
                  <path 
                    d="M20 2L35.5 11V29L20 38L4.5 29V11L20 2Z" 
                    fill="#00D084"
                  />
                  {/* Inner hexagonal pattern */}
                  <path 
                    d="M20 8L29 13.5V24.5L20 30L11 24.5V13.5L20 8Z" 
                    fill="#00B874"
                  />
                  {/* Center element */}
                  <circle cx="20" cy="19" r="4" fill="#00D084"/>
                </svg>
              </div>
              {/* SNS text */}
              <span className="text-2xl font-bold text-gray-100 tracking-tight lowercase">sns</span>
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
          <div className="h-fit">
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
