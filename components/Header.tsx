"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Button,
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect, useAccount, useBalance } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import blockies from "ethereum-blockies-base64";
import Image from "next/image";
import { Sun, Moon, Copy, Menu, X } from "lucide-react";
import { ThemeContext } from "../app/providers";

// Format balance to 5 decimal places with ETH suffix
const formatBalance = (value: bigint | undefined): string => {
  if (!value) return "0.00000 ETH";

  // Convert from wei to ETH (1 ETH = 10^18 wei)
  const ethValue = Number(value) / 1e18;

  // Format to exactly 5 decimals
  const formatted = ethValue.toFixed(5);

  return `${formatted} ETH`;
};

export default function Header() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const avatar = currentAccount ? blockies(currentAccount.address) : "";

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar className="flex justify-between items-center px-2 md:px-4" sx={{ minHeight: { xs: 56, md: 64 } }}>
        {/* Left: Logo */}
        <Box className="flex items-center gap-2">
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <IconButton edge="start" color="inherit" aria-label="logo" size="small">
              <Image src="/vercel.svg" alt="Logo" width={28} height={28} />
            </IconButton>
          </Link>
          {/* Desktop Menu */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>

            <Link href="/trade" style={{ textDecoration: "none", color: "inherit" }}>
              <Button color="inherit" sx={{ fontSize: { md: "0.9rem" } }}>
                Trade
              </Button>
            </Link>
            <Link href="/explore" style={{ textDecoration: "none", color: "inherit" }}>
              <Button color="inherit" sx={{ fontSize: { md: "0.9rem" } }}>
                Explore
              </Button>
            </Link>
          </Box>
        </Box>

        {/* Center: Search - Hide on mobile */}
        <Box sx={{ display: { xs: "none", md: "flex" }, flex: 1, justifyContent: "center" }}>
          <InputBase
            placeholder="Search NFTs..."
            className="bg-background text-foreground px-4 py-2 rounded-full shadow"
            inputProps={{ "aria-label": "search nfts" }}
            sx={{ width: "60%", maxWidth: 300, fontSize: { md: "0.9rem" } }}
          />
        </Box>

        {/* Right: Theme Toggle and Connect Wallet */}
        <Box className="flex items-center gap-1 md:gap-2">
          <IconButton onClick={toggleTheme} color="inherit" size="small">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>

          {/* Desktop Wallet */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;
                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "var(--background)",
                              color: "var(--foreground)",
                              fontSize: "0.85rem",
                            }}
                          >
                            Connect Wallet
                          </Button>
                        );
                      }
                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            variant="contained"
                            color="error"
                            size="small"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            Wrong network
                          </Button>
                        );
                      }
                      return (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            onClick={openChainModal}
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "var(--background)",
                              color: "var(--foreground)",
                              fontSize: "0.8rem",
                              borderRadius: "24px",
                            }}
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl}
                                    style={{ width: 12, height: 12 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </Button>
                          <Button
                            onClick={() => {
                              setCurrentAccount(account);
                              setAccountModalOpen(true);
                            }}
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "var(--background)",
                              color: "var(--foreground)",
                              fontSize: "0.8rem",
                              padding: "4px 8px",
                              minWidth: "auto",
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                              borderRadius: "24px",
                            }}
                          >
                            <img
                              src={blockies(account.address)}
                              alt="avatar"
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                              }}
                            />
                            {balance ? formatBalance(balance.value) : "0.00000 ETH"}
                          </Button>
                        </Box>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            color="inherit"
            size="small"
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <Menu size={20} />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="top"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: "100%", p: 2, pt: 8 }}>
          {/* Mobile Menu Items */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Link href="/trade" style={{ textDecoration: "none", color: "inherit" }}>
              <Button
                fullWidth
                color="inherit"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ justifyContent: "flex-start" }}
              >
                Trade
              </Button>
            </Link>
            <Link href="/explore" style={{ textDecoration: "none", color: "inherit" }}>
              <Button
                fullWidth
                color="inherit"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ justifyContent: "flex-start" }}
              >
                Explore
              </Button>
            </Link>
          </Box>

          {/* Mobile Search */}
          <Box sx={{ mb: 3 }}>
            <InputBase
              placeholder="Search NFTs..."
              className="bg-background text-foreground px-3 py-2 rounded-full w-full shadow"
              inputProps={{ "aria-label": "search nfts" }}
            />
          </Box>

          {/* Mobile Wallet */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button
                          onClick={openConnectModal}
                          variant="contained"
                          fullWidth
                          sx={{
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                          }}
                        >
                          Connect Wallet
                        </Button>
                      );
                    }
                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          variant="contained"
                          color="error"
                          fullWidth
                        >
                          Wrong network
                        </Button>
                      );
                    }
                    return (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Button
                          onClick={openChainModal}
                          variant="contained"
                          fullWidth
                          sx={{
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                          }}
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: "hidden",
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </Button>
                        <Button
                          onClick={() => {
                            setCurrentAccount(account);
                            setAccountModalOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          variant="contained"
                          fullWidth
                          sx={{
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            src={blockies(account.address)}
                            alt="avatar"
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                            }}
                          />
                          {balance ? formatBalance(balance.value) : "0.00000 ETH"}
                        </Button>
                      </Box>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </Box>
      </Drawer>
      <Dialog
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        sx={{ "& .MuiDialog-paper": { borderRadius: "24px" } }}
      >
        <DialogContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            mb={2}
          >
            <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full" />
          </Box>
          <Box display="flex" justifyContent="center" gap={1}>
            <Button
              onClick={() => {
                router.push("/profile");
                setAccountModalOpen(false);
              }}
            >
              Profile
            </Button>
          </Box>
          <div className="flex justify-center">
            <p className="text-lg font-bold">{currentAccount?.address}</p>
            <IconButton
              onClick={() =>
                navigator.clipboard.writeText(currentAccount?.address || "")
              }
            >
              <Copy size={20} />
            </IconButton>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              disconnect();
              setAccountModalOpen(false);
            }}
          >
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}
