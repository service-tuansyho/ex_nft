"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { optimism } from "wagmi/chains";

// Custom Optimism chain with native token symbol changed to "OP"
const customOptimism = {
  ...optimism,
  nativeCurrency: {
    ...optimism.nativeCurrency,
    name: "Optimism Ether", // Optional: Update name if desired
    symbol: "OP", // Changed from "ETH" to "OP"
  },
};

const config = getDefaultConfig({
  appName: "Ex NFT Optimism",
  projectId: "your-walletconnect-project-id", // Get from https://cloud.walletconnect.com
  chains: [customOptimism],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
