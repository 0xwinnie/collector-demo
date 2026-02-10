"use client";

import * as React from "react";

type WinnerNft = {
    id?: string;
    content?: {
        files?: Array<{ cc_cdn?: string; cdn_uri?: string; uri?: string }>;
        links?: { image?: string };
        metadata?: {
            name?: string;
            attributes?: Array<{ trait_type: string; value: string }>;
        };
    };
};

type Winner = {
    id?: number;
    winner_wallet?: string;
    nft_address?: string;
    nft?: WinnerNft;
    rarity?: string;
    created_at?: string;
    insured_value?: number;
};

type ApiResponse = {
    success?: boolean;
    data?: Winner[];
};

const RARITY_COLORS: Record<string, string> = {
    epic: "bg-purple-500 text-white",
    rare: "bg-blue-500 text-white",
    uncommon: "bg-green-500 text-white",
    common: "bg-gray-400 text-gray-900",
};

function formatTime(timestamp: string | undefined) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
}

function shortenAddress(address: string | undefined) {
    if (!address) return "Unknown";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function getImageUrl(nft: WinnerNft | undefined): string {
    if (!nft?.content) return "";
    const file = nft.content.files?.[0];
    return file?.cc_cdn || file?.cdn_uri || file?.uri || nft.content.links?.image || "";
}

function getNftName(nft: WinnerNft | undefined): string {
    return nft?.content?.metadata?.name || "Unknown NFT";
}

function getInsuredValue(nft: WinnerNft | undefined): string | null {
    const attr = nft?.content?.metadata?.attributes?.find(
        a => a.trait_type === "Insured Value"
    );
    return attr?.value ? `$${attr.value}` : null;
}

function getRarity(nft: WinnerNft | undefined): string {
    const attr = nft?.content?.metadata?.attributes?.find(
        a => a.trait_type.toLowerCase() === "rarity"
    );
    return attr?.value?.toLowerCase() || "common";
}

export default function RecentWinners() {
    const [winners, setWinners] = React.useState<Winner[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchWinners = async () => {
            try {
                const res = await fetch("/api/getAllWinners?count=10");
                if (!res.ok) throw new Error("Failed to fetch winners");
                const json: ApiResponse = await res.json();
                // API returns { success: true, data: [...] }
                const data = json.data || [];
                setWinners(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Error loading winners");
            } finally {
                setLoading(false);
            }
        };

        fetchWinners();
        const interval = setInterval(fetchWinners, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Winners</h3>
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Winners</h3>
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    if (!winners.length) {
        return (
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Winners</h3>
                <div className="text-gray-400">No recent winners</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Recent Winners</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {winners.map((winner, index) => {
                    const imageUrl = getImageUrl(winner.nft);
                    const name = getNftName(winner.nft);
                    const rarity = getRarity(winner.nft);
                    const rarityClass = RARITY_COLORS[rarity] || RARITY_COLORS.common;
                    const value = getInsuredValue(winner.nft);

                    return (
                        <div
                            key={winner.id || index}
                            className="flex items-center gap-3 bg-gray-700 rounded-lg p-2"
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={name}
                                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded bg-gray-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate">
                                    {name}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {shortenAddress(winner.winner_wallet)} - {formatTime(winner.created_at)}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${rarityClass}`}>
                                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                                </span>
                                {value && (
                                    <span className="text-green-400 text-xs font-medium">
                                        {value}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
