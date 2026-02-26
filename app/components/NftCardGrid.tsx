"use client";

import * as React from "react";
import { useEffect, useRef, useCallback } from "react";
import { MachineType } from "./MachineToggle";

interface NftCard {
  id: string;
  content: {
    metadata?: {
      name?: string;
    };
    links?: {
      image?: string;
    };
    files?: Array<{
      uri?: string;
      cc_cdn?: string;
      cdn_uri?: string;
    }>;
  };
  insuredValue?: number;
  grade?: string;
  rarity?: string;
}

interface NftCardGridProps {
  machineType: MachineType;
}

const getImageUrl = (nft: NftCard): string => {
  if (!nft.content) return "";
  const file = nft.content.files?.[0];
  return file?.cc_cdn || file?.cdn_uri || file?.uri || nft.content.links?.image || "";
};

const getNftName = (nft: NftCard): string => {
  return nft.content?.metadata?.name || "Unknown NFT";
};

const getRarityColor = (rarity?: string): string => {
  switch (rarity?.toLowerCase()) {
    case "epic":
      return "bg-purple-500";
    case "rare":
      return "bg-blue-500";
    case "uncommon":
      return "bg-green-500";
    case "common":
    default:
      return "bg-gray-500";
  }
};

export default function NftCardGrid({ machineType }: NftCardGridProps) {
  const [nfts, setNfts] = React.useState<NftCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const getMachineCode = (machine: MachineType): string => {
    return machine === "PKMN_50" ? "pokemon_50" : "sns_25";
  };

  const fetchNfts = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(true);
      const slug = getMachineCode(machineType);
      const response = await fetch("/api/getNfts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          page: pageNum,
          limit: 12,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch NFTs");
      }

      const data = await response.json();
      const newNfts = data.nfts || [];

      if (append) {
        setNfts((prev) => [...prev, ...newNfts]);
      } else {
        setNfts(newNfts);
      }

      setHasMore(newNfts.length === 12);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading NFTs");
    } finally {
      setLoading(false);
    }
  }, [machineType]);

  // Initial load and machine change
  useEffect(() => {
    setPage(1);
    setNfts([]);
    fetchNfts(1, false);
  }, [machineType, fetchNfts]);

  // Infinite scroll setup
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchNfts(nextPage, true);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, page, fetchNfts]);

  const handleCardClick = (nft: NftCard) => {
    // Navigate to NFT detail page or show modal
    console.log("Clicked NFT:", nft);
  };

  if (error && nfts.length === 0) {
    return (
      <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 p-8 text-center">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => fetchNfts(1, false)}
          className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white">
          Available Cards
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({nfts.length}+ items)
          </span>
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nfts.map((nft, index) => {
          const imageUrl = getImageUrl(nft);
          const name = getNftName(nft);
          const rarityColor = getRarityColor(nft.rarity);

          return (
            <div
              key={`${nft.id}-${index}`}
              onClick={() => handleCardClick(nft)}
              className="group bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden cursor-pointer hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-black/50"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#0A0A0A]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <span className="text-4xl opacity-30">🎴</span>
                  </div>
                )}
                
                {/* Rarity Badge */}
                {nft.rarity && (
                  <div className={`absolute top-2 right-2 px-2 py-1 ${rarityColor} rounded-full text-xs font-semibold text-white shadow-lg`}>
                    {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <button className="w-full py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-3 space-y-2">
                <h3 className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
                  {name}
                </h3>
                
                <div className="flex items-center justify-between">
                  {nft.grade && (
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                      {nft.grade}
                    </span>
                  )}
                  
                  {nft.insuredValue && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span className="text-xs">💎</span>
                      <span className="text-sm font-semibold">
                        ${nft.insuredValue.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading Indicator / Sentinel */}
      <div
        ref={loadingRef}
        className="flex items-center justify-center py-8"
      >
        {loading && (
          <div className="flex items-center gap-3 text-gray-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Loading more cards...</span>
          </div>
        )}
        {!hasMore && nfts.length > 0 && (
          <span className="text-gray-500 text-sm">No more cards to load</span>
        )}
      </div>
    </div>
  );
}
