import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://dev-gacha.collectorcrypt.com/api";
const API_KEY = process.env.API_KEY;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log("Original request body:", body);

        // Transform the request body to match the API requirements
        const apiRequestBody = {
            playerAddress: body.wallet || body.playerAddress,
            packType: body.packType === "standard" ? "pokemon_50" : body.packType || "pokemon_50",
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

            return NextResponse.json(
                { error: `Failed to generate pack: ${response.statusText}`, details: errorData },
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
