import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

const RPC_URL = process.env.SOLANA_RPC || "https://api.devnet.solana.com";

// Default devnet USDC mint (can be overridden by env)
const DEFAULT_DEVNET_USDC = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json();
        console.log("[USDC API] Request for address:", address);

        if (!address) {
            console.log("[USDC API] No address provided");
            return NextResponse.json({ balance: 0 });
        }

        // Hardcode the custom USDC-Dev mint for testing
        const usdcMint = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";
        console.log("[USDC API] Using RPC:", RPC_URL);
        console.log("[USDC API] Using USDC mint:", usdcMint);
        
        let connection: Connection;
        let walletPublicKey: PublicKey;
        let usdcMintPublicKey: PublicKey;
        
        try {
            connection = new Connection(RPC_URL);
            walletPublicKey = new PublicKey(address);
            usdcMintPublicKey = new PublicKey(usdcMint);
        } catch (parseError) {
            console.error("[USDC API] Invalid address or mint:", parseError);
            return NextResponse.json({ balance: 0 });
        }

        // Get token accounts for the wallet
        let tokenAccounts;
        try {
            tokenAccounts = await connection.getParsedTokenAccountsByOwner(
                walletPublicKey,
                { mint: usdcMintPublicKey }
            );
            console.log("[USDC API] Found", tokenAccounts.value.length, "token accounts");
        } catch (rpcError) {
            console.error("[USDC API] RPC error:", rpcError);
            return NextResponse.json({ balance: 0 });
        }

        let balance = 0;
        if (tokenAccounts.value.length > 0) {
            const usdcAccount = tokenAccounts.value[0];
            const accountInfo = usdcAccount.account.data.parsed.info;
            balance = accountInfo.tokenAmount.uiAmount || 0;
            console.log("[USDC API] Account found, balance:", balance);
        } else {
            console.log("[USDC API] No USDC token account found");
        }

        console.log("[USDC API] Returning balance:", balance);
        return NextResponse.json({ balance });
    } catch (error) {
        console.error("[USDC API] Unexpected error:", error);
        return NextResponse.json({ balance: 0 });
    }
}
