import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://dev-gacha.collectorcrypt.com/api";

export async function POST(request: NextRequest) {
    // Read API_KEY at runtime (not build time)
    const API_KEY = process.env.API_KEY;
    try {
        const body = await request.json();

        const response = await fetch(`${API_BASE_URL}/buyback`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY!,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to generate buyback: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
