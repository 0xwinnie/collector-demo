'use client';

import React, { useState, useEffect } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Show loading state until client-side mount and appId is available
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎴</div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // If no appId, show error
    if (!appId) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center text-white p-8">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-4">Configuration Error</h2>
                    <p className="text-gray-400">NEXT_PUBLIC_PRIVY_APP_ID is not set</p>
                </div>
            </div>
        );
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
