'use client';

import React, { useState, useEffect } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted || !appId) {
        return <>{children}</>;
    }

    return (
        <PrivyProvider
            appId={appId}
            {...(clientId ? { clientId } : {})}
            config={{
                // Put wallet first so the Privy modal prioritizes wallet connect
                loginMethods: ['google', 'wallet', 'email'],

                // Ensure Solana wallets are actually offered in the UI
                appearance: {
                    walletChainType: 'ethereum-and-solana',
                    // Add theme to potentially fix rendering issues
                    theme: 'light',
                },

                embeddedWallets: {
                    solana: { createOnLogin: 'users-without-wallets' },
                    showWalletUIs: false,
                },

                externalWallets: { solana: { connectors: toSolanaWalletConnectors() } },

                solana: {
                    rpcs: {
                        'solana:mainnet': {
                            rpc: createSolanaRpc('https://api.mainnet-beta.solana.com'),
                            rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.mainnet-beta.solana.com'),
                        },
                        'solana:devnet': {
                            rpc: createSolanaRpc('https://api.devnet.solana.com'),
                            rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
                        },
                    },
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}