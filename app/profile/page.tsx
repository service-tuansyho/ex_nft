"use client";

import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Dialog,
  DialogContent,
  CardActions,
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

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
    <Container maxWidth="lg" className="min-h-screen py-8 flex flex-col items-center">
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Page
      </Typography>
      <Typography variant="body1" gutterBottom>
        Connected wallet: {address}
      </Typography>
      <Button
        variant="contained"
        onClick={() => setModalOpen(true)}
        className="w-full md:w-1/2"
        sx={{ borderRadius: "24px", marginTop: "16px" }}
      >
        Mint New NFT
      </Button>
      {userNfts && userNfts.length > 0 && (
        <div className="mt-8">
          <Typography variant="h5" gutterBottom>
            Your NFTs (Total: {userNfts.length})
          </Typography>
          <Grid container spacing={3}>
            {userNfts.map((nft) => (
              <Grid item xs={12} sm={6} md={4} key={nft._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "2px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                  onClick={() => {
                    setSelectedNft(nft);
                    setDetailsModalOpen(true);
                  }}
                >
                  <CardMedia
                    component="img"
                    height="240"
                    image={nft.image}
                    alt={nft.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                      {nft.name}
                    </Typography>
                    {nft.description && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {nft.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      <strong>Price:</strong> {nft.price ? `${nft.price} OP` : "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong> {nft.listed ? "Listed" : "Not Listed"}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        setSelectedNft(nft);
                        setDetailsModalOpen(true);
                      }}
                      sx={{ borderRadius: "24px", padding: "8px 0", margin: "16px" }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      )}

      <Dialog
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedNft(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px" }
        }}
      >
        <DialogContent sx={{ overflow: "auto", maxHeight: "90vh" }}>
          {selectedNft && (
            <NFTDetails
              tokenId={selectedNft.tokenId}
              contractAddress={selectedNft.contractAddress}
              owner={selectedNft.owner}
              name={selectedNft.name}
              description={selectedNft.description}
              image={selectedNft.image}
              price={selectedNft.price}
              listed={selectedNft.listed}
              createdAt={selectedNft.createdAt}
              onTransferSuccess={() => {
                refetchNfts();
                setDetailsModalOpen(false);
                setSelectedNft(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <MintModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onMintSuccess={refetchNfts}
      />
    </Container>
  );
}
