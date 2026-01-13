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
} from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import blockies from "ethereum-blockies-base64";
import Image from "next/image";
import { Sun, Moon, Copy } from "lucide-react";
import { ThemeContext } from "../app/providers";

export default function Header() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const avatar = currentAccount ? blockies(currentAccount.address) : "";

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar className="flex justify-between items-center px-4">
        {/* Left: Logo and Menu */}
        <Box className="flex items-center">
          <IconButton edge="start" color="inherit" aria-label="logo">
            <Image src="/vercel.svg" alt="Logo" width={32} height={32} />
          </IconButton>
          <Button color="inherit" sx={{ ml: 2 }}>
            Trade
          </Button>
          <Button color="inherit" sx={{ ml: 1 }}>
            Explore
          </Button>
        </Box>
        {/* Center: Search */}
        <Box className="flex-1 flex justify-center">
          <InputBase
            placeholder="Search NFTs..."
            className="bg-background text-foreground px-4 py-2 rounded-full w-64 shadow"
            inputProps={{ "aria-label": "search nfts" }}
          />
        </Box>
        {/* Right: Theme Toggle and Connect Wallet */}
        <Box className="flex items-center">
          <IconButton onClick={toggleTheme} color="inherit">
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </IconButton>
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
                        >
                          Wrong network
                        </Button>
                      );
                    }
                    return (
                      <div style={{ display: "flex", gap: 12 }}>
                        <Button
                          onClick={openChainModal}
                          variant="contained"
                          sx={{
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                          }}
                          type="button"
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
                            console.log("Setting currentAccount", account);
                            setCurrentAccount(account);
                            setAccountModalOpen(true);
                          }}
                          variant="contained"
                          sx={{
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                          }}
                        >
                          {account.displayName}
                          {account.displayBalance
                            ? ` (${account.displayBalance})`
                            : ""}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </Box>
      </Toolbar>
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
