"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { optimism } from "wagmi/chains";

export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

// Custom Optimism chain with native token symbol
const customOptimism = {
  ...optimism,
  nativeCurrency: {
    ...optimism.nativeCurrency,
    name: "Optimism Ether",
    symbol: "ETH",
  },
};

const config = getDefaultConfig({
  appName: "carnobon",
  projectId: "600ff3ccff8155148627a3e3d0690701", // Get from https://cloud.walletconnect.com
  chains: [customOptimism],
  ssr: true,
});

const customLightTheme = lightTheme({
  accentColor: "#c2ddaa", // background
});

const customDarkTheme = darkTheme({
  accentColor: "#722f37",
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialDark = saved === "dark" || (!saved && prefersDark);
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={isDark ? customDarkTheme : customLightTheme}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeContext.Provider>
  );
}
