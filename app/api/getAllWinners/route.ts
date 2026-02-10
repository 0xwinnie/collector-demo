import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://dev-gacha.collectorcrypt.com/api";
const API_KEY = process.env.API_KEY;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const url = new URL(`${API_BASE_URL}/getAllWinners`);

        // Forward query params
        const count = searchParams.get('count') || '10';
        url.searchParams.set('count', count);

        if (searchParams.get('timestamp')) {
            url.searchParams.set('timestamp', searchParams.get('timestamp')!);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "x-api-key": API_KEY || "",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            return NextResponse.json(
                { error: "Failed to get winners", details: text || response.statusText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
