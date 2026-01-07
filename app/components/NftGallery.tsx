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

function getImageUrl(nft: Nft) {
    const fromFiles = nft.content?.files?.find((f) => (f.mime || "").startsWith("image/"));
    const fromLinks = nft.content?.links?.image;

    // Prioritize cc_cdn, then cdn_uri, then original uri, then fallback to links
    return fromFiles?.cc_cdn || fromFiles?.cdn_uri || fromFiles?.uri || fromLinks || "";
}

function getPrice(nft: Nft) {
    const insuredValue = nft.content?.metadata?.attributes?.find(
        (attr: NftAttribute) => attr.trait_type === "Insured Value"
    )?.value;
    return insuredValue ? `$${insuredValue}` : null;
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

    if (loading) return <div>Loading NFTs…</div>;
    if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;

    const nfts = data?.nfts ?? [];
    if (!nfts.length) return <div>No NFTs found.</div>;

    // Limit to first 100 NFTs
    const displayedNfts = nfts.slice(0, 100);

    return (
        <div>
            <h2>NFTs in the Machine</h2>
            {nfts.length > 100 && (
                <p style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
                    Showing first 100 of {nfts.length} NFTs
                </p>
            )}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 12,
                    marginTop: 12,
                }}
            >
                {displayedNfts.map((nft, index) => {
                    const name = nft.content?.metadata?.name || nft.id;
                    const img = getImageUrl(nft);
                    const price = getPrice(nft);

                    return (
                        <a
                            key={nft.id || `nft-${index}`}
                            href={`https://dev.collectorcrypt.com/assets/solana/${nft.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 8,
                                padding: 10,
                                textDecoration: "none",
                                color: "inherit",
                                display: "block",
                                cursor: "pointer",
                                transition: "box-shadow 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={img}
                                    alt={name}
                                    style={{ width: "100%", height: 120, objectFit: "contain", borderRadius: 6 }}
                                />
                            ) : (
                                <div style={{ height: 120, background: "#f3f4f6", borderRadius: 6 }} />
                            )}

                            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600 }}>{name}</div>

                            {price && (
                                <div style={{ marginTop: 4, fontSize: 12, color: "#059669", fontWeight: 500 }}>
                                    {price}
                                </div>
                            )}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
