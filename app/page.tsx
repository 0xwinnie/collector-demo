"use client";

import dynamic from "next/dynamic";

const PrivyConnect = dynamic(() => import("@/app/components/PrivyConnect"), {
  ssr: false,
  loading: () => (
    <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
      Loading...
    </div>
  ),
});

const WalletContent = dynamic(() => import("@/app/components/WalletContent"), {
  ssr: false,
  loading: () => (
    <div className="text-center text-white py-12">
      <div className="text-6xl mb-4">🎴</div>
      <p>Loading...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Collector Crypt Gacha
        </h1>
        <div className="mb-8 flex justify-center">
          <PrivyConnect />
        </div>
        <WalletContent />
      </div>
    </div>
  );
}
