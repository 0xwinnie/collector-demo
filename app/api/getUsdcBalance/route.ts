import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT_ADDRESS!;
const RPC_URL = process.env.SOLANA_RPC || "https://api.devnet.solana.com";

// Default devnet USDC mint (can be overridden by env)
const DEFAULT_DEVNET_USDC = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json({ balance: 0 });
        }

        // Use environment variable or default devnet USDC
        const usdcMint = USDC_MINT || DEFAULT_DEVNET_USDC;
        
        let connection: Connection;
        let walletPublicKey: PublicKey;
        let usdcMintPublicKey: PublicKey;
        
        try {
            connection = new Connection(RPC_URL);
            walletPublicKey = new PublicKey(address);
            usdcMintPublicKey = new PublicKey(usdcMint);
        } catch (parseError) {
            console.error("Invalid address or mint:", parseError);
            return NextResponse.json({ balance: 0 });
        }

        // Get token accounts for the wallet
        let tokenAccounts;
        try {
            tokenAccounts = await connection.getParsedTokenAccountsByOwner(
                walletPublicKey,
                { mint: usdcMintPublicKey }
            );
        } catch (rpcError) {
            console.error("RPC error fetching token accounts:", rpcError);
            // Return 0 balance on RPC error instead of failing
            return NextResponse.json({ balance: 0 });
        }

        let balance = 0;
        if (tokenAccounts.value.length > 0) {
            // Get the balance from the first (usually only) USDC token account
            const usdcAccount = tokenAccounts.value[0];
            const accountInfo = usdcAccount.account.data.parsed.info;
            balance = accountInfo.tokenAmount.uiAmount || 0;
        }

        return NextResponse.json({ balance });
    } catch (error) {
        console.error("Unexpected error fetching USDC balance:", error);
        // Always return balance: 0 on any error for better UX
        return NextResponse.json({ balance: 0 });
    }
}
