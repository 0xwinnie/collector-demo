import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://dev-gacha.collectorcrypt.com/api";

export async function POST(request: NextRequest) {
    // Read API_KEY at runtime (not build time)
    const API_KEY = process.env.API_KEY;
    try {
        const body = await request.json();
        console.log("Original request body:", body);

        // Transform the request body to match the API requirements
        // Support sns_25 pack type (and other types directly)
        const packType = body.packType || "pokemon_50";
        const apiRequestBody = {
            playerAddress: body.wallet || body.playerAddress,
            packType: packType,
            ...(body.turbo && { turbo: body.turbo })
        };

        console.log("Transformed request body being sent:", apiRequestBody);

        const response = await fetch(`${API_BASE_URL}/generatePack`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY!,
            },
            body: JSON.stringify(apiRequestBody),
        });

        console.log("API response status:", response.status);
        console.log("API response statusText:", response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log("API error response:", errorData);

            const message = errorData.details || errorData.error || response.statusText;
            return NextResponse.json(
                { error: `Failed to generate pack: ${message}`, details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Internal error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
