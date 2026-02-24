"use client";

import * as React from "react";

type PackStock = {
    common?: number;
    uncommon?: number;
    rare?: number;
    epic?: number;
};

type StockData = Record<string, PackStock>;

const RARITY_CONFIG: Record<string, { label: string; color: string; textColor: string }> = {
    common: { label: "Common", color: "bg-gray-400", textColor: "text-gray-900" },
    uncommon: { label: "Uncommon", color: "bg-green-500", textColor: "text-green-900" },
    rare: { label: "Rare", color: "bg-blue-500", textColor: "text-blue-900" },
    epic: { label: "Epic", color: "bg-purple-500", textColor: "text-purple-900" },
};

export default function StockDisplay() {
    const [stock, setStock] = React.useState<StockData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchStock = async () => {
            try {
                const res = await fetch("/api/stock");
                if (!res.ok) throw new Error("Failed to fetch stock");
                const data = await res.json();
                setStock(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Error loading stock");
            } finally {
                setLoading(false);
            }
        };

        fetchStock();
        const interval = setInterval(fetchStock, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Pack Stock</h3>
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (error || !stock) {
        return (
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Pack Stock</h3>
                <div className="text-red-400">{error || "No data"}</div>
            </div>
        );
    }

    // Show sns_25 pack stock (the SNS pack type)
    const packStock = stock["sns_25"] || Object.values(stock)[0];

    if (!packStock) {
        return (
            <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Pack Stock</h3>
                <div className="text-gray-400">No stock data</div>
            </div>
        );
    }

    const totalStock = Object.values(packStock).reduce((sum, val) => sum + (val || 0), 0);

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-1">Pack Stock</h3>
            <p className="text-gray-400 text-sm mb-3">Total: {totalStock} NFTs</p>
            <div className="space-y-2">
                {Object.entries(RARITY_CONFIG).map(([key, config]) => {
                    const count = packStock[key as keyof PackStock] ?? 0;
                    return (
                        <div
                            key={key}
                            className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                                <span className="text-white text-sm">{config.label}</span>
                            </div>
                            <span className="text-white font-bold">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
