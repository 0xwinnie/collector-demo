"use client";

import dynamic from "next/dynamic";

const PrivyConnect = dynamic(() => import("@/app/components/PrivyConnect"), {
  ssr: false,
});

const GachaMachine = dynamic(() => import("@/app/components/GachaMachine"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-xl">
                🎰
              </div>
              <span className="text-xl font-bold text-white">Collector Gacha</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Marketplace
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Leaderboards
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Yolo
              </a>
            </nav>

            {/* Connect Button */}
            <PrivyConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <GachaMachine />
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
