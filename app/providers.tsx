'use client';

import React, { useState, useEffect } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (typeof window === 'undefined' || !mounted || !appId) {
        return <>{children}</>;
    }

    return (
        <PrivyProvider
            appId={appId}
            config={{
                loginMethods: ['google', 'wallet', 'email'],
                appearance: {
                    walletChainType: 'ethereum-and-solana',
                    theme: 'light',
                },
                embeddedWallets: {
                    solana: { createOnLogin: 'users-without-wallets' },
                    showWalletUIs: false,
                },
                externalWallets: { 
                    solana: { 
                        connectors: toSolanaWalletConnectors({ shouldAutoConnect: false }) 
                    } 
                },
                solana: {
                    rpcs: {
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
