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
  nftAddress: string;
  points: number;
  transactionSignature: string;
}

interface GachaMachineProps {
  selectedMachine: MachineType;
  onSelectMachine: (machine: MachineType) => void;
}

const RARITY_GLOW: Record<string, string> = {
  epic:     "#a855f7",
  rare:     "#3b82f6",
  uncommon: "#22c55e",
  common:   "#facc15",
};

// ─── Result Modal ─────────────────────────────────────────────────────────────
function ResultModal({
  card,
  wallet,
  onClose,
}: {
  card: OpenedCard;
  wallet: { address: string; signTransaction: (args: { transaction: Uint8Array }) => Promise<{ signedTransaction: Uint8Array }> } | undefined;
  onClose: () => void;
}) {
  const [isBuyingBack, setIsBuyingBack] = useState(false);
  const [buybackError, setBuybackError] = useState<string | null>(null);
  const [buybackDone, setBuybackDone] = useState(false);

  const glowColor = RARITY_GLOW[card.rarity?.toLowerCase()] ?? RARITY_GLOW.common;
  const sellPrice = (card.insuredValue * 0.85).toFixed(2);

  const handleBuyback = async () => {
    if (!wallet) return;
    setIsBuyingBack(true);
    setBuybackError(null);

    try {
      // Step 1: Generate buyback transaction
      const buybackRes = await fetch("/api/buyback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerAddress: wallet.address,
          nftAddress: card.nftAddress,
        }),
      });

      if (!buybackRes.ok) {
        const err = await buybackRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate buyback transaction");
      }

      const { serializedTransaction } = await buybackRes.json();

      // Step 2: Sign
      const txBytes = new Uint8Array(Buffer.from(serializedTransaction, "base64"));
      const signResult = await wallet.signTransaction({ transaction: txBytes });
      const signedTx = Buffer.from(signResult.signedTransaction).toString("base64");

      // Step 3: Submit
      const submitRes = await fetch("/api/submitTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction: signedTx }),
      });

      if (!submitRes.ok) {
        throw new Error("Failed to submit buyback transaction");
      }

      setBuybackDone(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setBuybackError(err instanceof Error ? err.message : "Buyback failed");
    } finally {
      setIsBuyingBack(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative bg-[#111] rounded-2xl border border-gray-800 max-w-sm w-full overflow-hidden">

        {/* Rarity glow bar at top */}
        <div className="h-1 w-full" style={{ backgroundColor: glowColor }} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <div className="text-center mb-4">
            <p className="text-xs tracking-widest text-gray-500 uppercase mb-1">Pack Opened!</p>
            <h3 className="text-xl font-bold text-white">You received a card</h3>
          </div>

          {/* Card image */}
          <div className="relative mx-auto mb-5" style={{ width: 200 }}>
            <div
              className="absolute -inset-3 rounded-2xl blur-xl opacity-60"
              style={{ backgroundColor: glowColor }}
            />
            <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-[#0A0A0A]">
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full aspect-[3/4] object-cover"
                />
              ) : (
                <div className="w-full aspect-[3/4] flex items-center justify-center text-5xl opacity-20">
                  🎴
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <h4 className="text-center text-lg font-bold text-white mb-1 truncate">{card.name}</h4>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
              style={{ backgroundColor: glowColor + "33", color: glowColor, border: `1px solid ${glowColor}66` }}
            >
              {card.rarity}
            </span>
            {card.grade && card.grade !== "Ungraded" && (
              <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                {card.grade}
              </span>
            )}
            <div className="flex items-center gap-1 text-yellow-400">
              <span className="text-xs">💎</span>
              <span className="text-sm font-bold">${card.insuredValue.toLocaleString()}</span>
            </div>
          </div>

          {/* Extra details */}
          <div className="space-y-2 mb-4 text-xs">
            {card.points > 0 && (
              <div className="flex justify-between px-3 py-2 bg-gray-900 rounded-lg">
                <span className="text-gray-500">Points Earned</span>
                <span className="text-blue-400 font-semibold">+{card.points}</span>
              </div>
            )}
            {card.nftAddress && (
              <div className="flex justify-between gap-3 px-3 py-2 bg-gray-900 rounded-lg">
                <span className="text-gray-500 shrink-0">NFT Address</span>
                <span className="text-gray-300 font-mono truncate">{card.nftAddress}</span>
              </div>
            )}
            {card.transactionSignature && (
              <div className="flex justify-between gap-3 px-3 py-2 bg-gray-900 rounded-lg">
                <span className="text-gray-500 shrink-0">Transaction</span>
                <span className="text-gray-300 font-mono truncate">{card.transactionSignature}</span>
              </div>
            )}
          </div>

          {/* Buyback success */}
          {buybackDone && (
            <div className="mb-4 py-3 px-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <p className="text-green-400 text-sm font-medium">✓ Sold for ${sellPrice}!</p>
            </div>
          )}

          {/* Buyback error */}
          {buybackError && (
            <div className="mb-4 py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
              <p className="text-red-400 text-sm">{buybackError}</p>
            </div>
          )}

          {/* Buttons */}
          {!buybackDone && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBuyback}
                disabled={isBuyingBack}
                className="py-3 px-4 rounded-xl font-semibold text-sm border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isBuyingBack ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Selling...
                  </span>
                ) : (
                  `Sell $${sellPrice}`
                )}
              </button>

              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 transition-all"
              >
                Keep It
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GachaMachine({ selectedMachine, onSelectMachine }: GachaMachineProps) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  const [isOpening, setIsOpening] = useState(false);
  const [openingPhase, setOpeningPhase] = useState<OpeningPhase>("");
  const [showRevealAnimation, setShowRevealAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openedCard, setOpenedCard] = useState<OpenedCard | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isConnected = ready && authenticated && wallet;

  const getPackType = (machine: MachineType): string => {
    return machine === "PKMN_50" ? "pokemon_50" : "sns_25";
  };

  const handleOpenPack = useCallback(async (machine: MachineType, _turbo: boolean) => {
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
        body: JSON.stringify({ playerAddress: wallet.address, packType }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate pack");
      }

      const packData = await generateResponse.json();

      // Step 2: Sign the transaction
      setOpeningPhase("Signing Transaction...");
      const transactionBytes = new Uint8Array(Buffer.from(packData.transaction, "base64"));
      const signResult = await wallet.signTransaction({ transaction: transactionBytes });
      const signedTx = Buffer.from(signResult.signedTransaction).toString("base64");

      // Step 3: Submit the signed transaction
      setOpeningPhase("Submitting Transaction...");
      const submitResponse = await fetch("/api/submitTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction: signedTx }),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(errorData.error || "Failed to submit transaction");
      }

      // Step 4: Open the pack to reveal the NFT
      setOpeningPhase("Opening...");
      const openResponse = await fetch("/api/openPack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo: packData.memo }),
      });

      if (!openResponse.ok) {
        const errorData = await openResponse.json();
        throw new Error(errorData.error || "Failed to open pack");
      }

      const openResult = await openResponse.json();

      // Step 5: Reveal animation (1.5s), then show result
      setOpeningPhase("Success!");
      setShowRevealAnimation(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowRevealAnimation(false);

      const nftWon = openResult.nftWon;
      if (nftWon) {
        const attr = (trait: string) =>
          nftWon.content?.metadata?.attributes?.find(
            (a: { trait_type: string; value: string }) => a.trait_type === trait
          )?.value;

        const imageUrl =
          nftWon.content?.files?.[0]?.cc_cdn ||
          nftWon.content?.files?.[0]?.cdn_uri ||
          nftWon.content?.links?.image ||
          "";

        setOpenedCard({
          id: nftWon.id || openResult.nft_address || "",
          name: nftWon.content?.metadata?.name || "Unknown NFT",
          imageUrl,
          insuredValue: attr("Insured Value") ? parseFloat(attr("Insured Value")!) : 0,
          grade: attr("The Grade") || "Ungraded",
          rarity: openResult.rarity || "common",
          nftAddress: openResult.nft_address || "",
          points: openResult.points || 0,
          transactionSignature: openResult.transactionSignature || "",
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
      {/* Reveal animation - plays for 1.5s after pack is opened */}
      {showRevealAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative">
            <div className="w-48 h-64 relative animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl opacity-50 blur-xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center">
                <div className="text-6xl animate-bounce">✨</div>
              </div>
            </div>
            <div className="absolute -inset-4 flex items-center justify-center">
              <div className="text-white text-2xl font-bold animate-pulse">
                Revealing...
              </div>
            </div>
            <div className="absolute -top-8 -left-8 text-4xl animate-ping">⭐</div>
            <div className="absolute -top-4 -right-8 text-3xl animate-ping delay-100">✨</div>
            <div className="absolute -bottom-8 -left-4 text-3xl animate-ping delay-200">💫</div>
            <div className="absolute -bottom-4 -right-8 text-4xl animate-ping delay-300">🌟</div>
          </div>
        </div>
      )}

      {/* Machine Toggle */}
      <div className="flex justify-center">
        <MachineToggle selectedMachine={selectedMachine} onSelectMachine={onSelectMachine} />
      </div>

      {/* Pack Display */}
      <PackDisplay
        machineType={selectedMachine}
        onOpenPack={handleOpenPack}
        isOpening={isOpening}
        openingPhase={openingPhase}
        error={error}
        onDismissError={() => setError(null)}
      />

      {/* Recent Winners */}
      <RecentWinners />

      {/* Result Modal */}
      {showResult && openedCard && (
        <ResultModal card={openedCard} wallet={wallet} onClose={handleCloseResult} />
      )}
    </div>
  );
}
