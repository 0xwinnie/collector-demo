'use client';

import dynamic from "next/dynamic";

// Dynamic import Providers to avoid SSR issues
const Providers = dynamic(() => import("@/app/providers"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900" />,
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
