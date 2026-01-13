"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Container, Typography, Box } from "@mui/material";

export default function Home() {
  return (
    <Container
      maxWidth="md"
      className="min-h-screen flex flex-col items-center justify-center text-foreground"
    >
      <Box textAlign="center">
        <Typography variant="h2" component="h1" gutterBottom>
          Ex NFT Optimism
        </Typography>
        <Typography variant="h5" gutterBottom>
          NFT Exchange on Optimism Network
        </Typography>
      </Box>
    </Container>
  );
}
