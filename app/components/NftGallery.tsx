"use client";

import * as React from "react";

type NftFile = { uri?: string; cdn_uri?: string; cc_cdn?: string; mime?: string };
type NftAttribute = { trait_type: string; value: string };
type Nft = {
    id: string;
    content?: {
        files?: NftFile[];
        links?: { image?: string; external_url?: string };
        metadata?: {
            name?: string;
            attributes?: NftAttribute[];
        };
    };
    ownership?: { owner?: string };
};
type GetNftsResponse = { nfts: Nft[] };

const RARITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    legendary: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-400" },
    elite: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-400" },
    epic: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-400" },
    high: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-400" },
    mid: { bg: "bg-green-100", text: "text-green-800", border: "border-green-400" },
    low: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
};

function getImageUrl(nft: Nft) {
    const fromFiles = nft.content?.files?.find((f) => (f.mime || "").startsWith("image/"));
    const fromLinks = nft.content?.links?.image;
    return fromFiles?.cc_cdn || fromFiles?.cdn_uri || fromFiles?.uri || fromLinks || "";
}

function getPrice(nft: Nft) {
    const insuredValue = nft.content?.metadata?.attributes?.find(
        (attr: NftAttribute) => attr.trait_type === "Insured Value"
    )?.value;
    return insuredValue ? `$${insuredValue}` : null;
}

function getRarity(nft: Nft) {
    const rarityAttr = nft.content?.metadata?.attributes?.find(
        (attr: NftAttribute) => attr.trait_type.toLowerCase() === "rarity"
    )?.value;
    return rarityAttr?.toLowerCase() || "low";
}

function getGrade(nft: Nft) {
    const gradeAttr = nft.content?.metadata?.attributes?.find(
        (attr: NftAttribute) => attr.trait_type === "The Grade"
    )?.value;
    return gradeAttr || null;
}

export default function NftGallery(props: { owner?: string }) {
    const { owner } = props;

    const [data, setData] = React.useState<GetNftsResponse | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/getNfts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(owner ? { owner } : {}),
                });

                if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    throw new Error(text || res.statusText);
                }

                const json = (await res.json()) as GetNftsResponse;
                if (alive) setData(json);
            } catch (e) {
                if (alive) setError(e instanceof Error ? e.message : "Failed to load NFTs");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [owner]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-500">Loading NFTs...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                Error: {error}
            </div>
        );
    }

    const nfts = data?.nfts ?? [];
    if (!nfts.length) {
        return (
            <div className="text-center py-12 text-gray-500">
                No NFTs found. Open a pack to get started!
            </div>
        );
    }

    const displayedNfts = nfts.slice(0, 100);

    return (
        <div>
            {nfts.length > 100 && (
                <p className="text-sm text-gray-500 mb-4">
                    Showing first 100 of {nfts.length} NFTs
                </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayedNfts.map((nft, index) => {
                    const name = nft.content?.metadata?.name || "Unknown NFT";
                    const img = getImageUrl(nft);
                    const price = getPrice(nft);
                    const rarity = getRarity(nft);
                    const grade = getGrade(nft);
                    const colors = RARITY_COLORS[rarity] || RARITY_COLORS.low;

                    return (
                        <a
                            key={nft.id || `nft-${index}`}
                            href={`https://dev.collectorcrypt.com/assets/solana/${nft.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`group block bg-white rounded-xl border-2 ${colors.border} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
                        >
                            {/* Image Container */}
                            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                {img ? (
                                    <img
                                        src={img}
                                        alt={name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                {/* Rarity Badge */}
                                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-3">
                                <h3 className="font-semibold text-gray-900 text-sm truncate" title={name}>
                                    {name}
                                </h3>

                                <div className="mt-2 flex items-center justify-between">
                                    {price && (
                                        <span className="text-green-600 font-bold text-sm">
                                            {price}
                                        </span>
                                    )}
                                    {grade && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            Grade: {grade}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
