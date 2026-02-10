import { NextResponse } from 'next/server';

const API_BASE_URL = "https://dev-gacha.collectorcrypt.com/api";

export async function GET() {
    try {
        const response = await fetch(`${API_BASE_URL}/stock`, {
            method: "GET",
            cache: "no-store",
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            return NextResponse.json(
                { error: "Failed to get stock", details: text || response.statusText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
