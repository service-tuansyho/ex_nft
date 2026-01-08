"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Button,
  Box,
} from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function Header() {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar className="flex justify-between items-center px-4">
        {/* Left: Logo */}
        <Box className="flex items-center">
          <IconButton edge="start" color="inherit" aria-label="logo">
            <Image src="/vercel.svg" alt="Logo" width={32} height={32} />
          </IconButton>
        </Box>
        {/* Center: Search */}
        <Box className="flex-1 flex justify-center">
          <InputBase
            placeholder="Search NFTs..."
            className="bg-background text-foreground px-4 py-2 rounded-full w-64 shadow"
            inputProps={{ "aria-label": "search nfts" }}
          />
        </Box>
        {/* Right: Connect Wallet */}
        <Box className="flex items-center">
          <ConnectButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
