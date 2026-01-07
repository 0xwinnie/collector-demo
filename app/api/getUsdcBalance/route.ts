import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Mainnet USDC
const RPC_URL = "https://api.mainnet-beta.solana.com";

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json(
                { error: "Address is required" },
                { status: 400 }
            );
        }

        const connection = new Connection(RPC_URL);
        const walletPublicKey = new PublicKey(address);
        const usdcMintPublicKey = new PublicKey(USDC_MINT);

        // Get token accounts for the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            walletPublicKey,
            { mint: usdcMintPublicKey }
        );

        let balance = 0;
        if (tokenAccounts.value.length > 0) {
            // Get the balance from the first (usually only) USDC token account
            const usdcAccount = tokenAccounts.value[0];
            const accountInfo = usdcAccount.account.data.parsed.info;
            balance = accountInfo.tokenAmount.uiAmount || 0;
        }

        return NextResponse.json({ balance });
    } catch (error) {
        console.error("Error fetching USDC balance:", error);
        return NextResponse.json(
            { error: "Failed to fetch USDC balance" },
            { status: 500 }
        );
    }
}
