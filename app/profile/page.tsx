"use client";

import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from "@mui/material";
import { useAccount } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import MintModal from "../../components/MintModal";

interface NFT {
  _id: string;
  tokenId: string;
  contractAddress: string;
  owner: string;
  name: string;
  description?: string;
  image: string;
  price?: number;
  listed: boolean;
  createdAt: string;
}

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: async (userAddress: string) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: userAddress }),
      });
      if (!response.ok) {
        throw new Error("Failed to create user");
      }
      return response.json();
    },
  });

  const { data: userNfts, refetch: refetchNfts } = useQuery({
    queryKey: ["userNfts", address],
    queryFn: async () => {
      if (!address) return [];
      const response = await fetch(`/api/nfts?owner=${address}`);
      if (!response.ok) throw new Error("Failed to fetch NFTs");
      const data = await response.json();
      return data.data as NFT[];
    },
    enabled: !!address && isConnected,
  });

  useEffect(() => {
    if (isConnected && address) {
      createUserMutation.mutate(address);
    }
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <Container
        maxWidth="md"
        className="min-h-screen flex flex-col items-center justify-center"
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Page
        </Typography>
        <Typography>Please connect your wallet to create NFTs.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="min-h-screen py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Page
      </Typography>
      <Typography variant="body1" gutterBottom>
        Connected wallet: {address}
      </Typography>

      <Card className="mt-8">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            NFT Management
          </Typography>
          <Button
            variant="contained"
            onClick={() => setModalOpen(true)}
            fullWidth
          >
            Mint New NFT
          </Button>
        </CardContent>
      </Card>

      {userNfts && userNfts.length > 0 && (
        <div className="mt-8">
          <Typography variant="h5" gutterBottom>
            Your NFTs (Total: {userNfts.length})
          </Typography>
          <Grid container spacing={3}>
            {userNfts.map((nft) => (
              <Grid item xs={12} sm={6} md={4} key={nft._id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={nft.image}
                    alt={nft.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {nft.name}
                    </Typography>
                    {nft.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {nft.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Token ID: {nft.tokenId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Listed: {nft.listed ? "Yes" : "No"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      )}

      <MintModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onMintSuccess={refetchNfts}
      />
    </Container>
  );
}
