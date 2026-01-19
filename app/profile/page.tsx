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
import NFTDetails from "../../components/NFTDetails";

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
  console.log("modalOpen", modalOpen);

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
                <NFTDetails
                  tokenId={nft.tokenId}
                  contractAddress={nft.contractAddress}
                  owner={nft.owner}
                  name={nft.name}
                  description={nft.description}
                  image={nft.image}
                  price={nft.price}
                  listed={nft.listed}
                  createdAt={nft.createdAt}
                />
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
