"use client";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Collapse,
  Grid,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { useAccount } from "wagmi";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "./ExpandMore";
import TransferModal from "./TransferModal";

interface NFTDetailsProps {
  tokenId: string;
  contractAddress: string;
  owner: string;
  name: string;
  description?: string;
  image: string;
  price?: number;
  listed: boolean;
  createdAt?: string;
  onTransferSuccess?: () => void;
}

export default function NFTDetails({
  tokenId,
  contractAddress,
  owner,
  name,
  description,
  image,
  price,
  listed,
  createdAt,
  onTransferSuccess,
}: NFTDetailsProps) {
  const { address } = useAccount();
  const [expanded, setExpanded] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const isOwner = address?.toLowerCase() === owner.toLowerCase();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
    }}>
      <CardMedia
        component="img"
        height="240"
        image={image}
        alt={name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
          {name}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            {description}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Price:</strong> {price ? `${price} OP` : "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Status:</strong> {listed ? "Listed" : "Not Listed"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Created:</strong> {formatDate(createdAt)}
          </Typography>
        </Box>

        {isOwner && (
          <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setTransferModalOpen(true)}
            >
              Transfer NFT
            </Button>
          </Box>
        )}

        {!isOwner && address && (
          <Typography variant="caption" color="error" display="block" sx={{ mb: 2 }}>
            ⚠️ You are not the owner of this NFT
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            Details
          </Typography>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Owner
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ wordBreak: "break-all", fontFamily: "monospace" }}
                >
                  {owner}
                </Typography>
                <Button
                  size="small"
                  href={`https://optimistic.etherscan.io/address/${owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 0.5 }}
                >
                  View on Etherscan
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Contract Address
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ wordBreak: "break-all", fontFamily: "monospace" }}
                >
                  {contractAddress}
                </Typography>
                <Button
                  size="small"
                  href={`https://optimistic.etherscan.io/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 0.5 }}
                >
                  View on Etherscan
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Token ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {tokenId}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Token Standard
                </Typography>
                <Typography variant="body2">ERC-721</Typography>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  component="a"
                  href={`https://optimistic.etherscan.io/nft/${contractAddress}/${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Full NFT Details
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>

      <TransferModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        tokenId={tokenId}
        contractAddress={contractAddress}
        onTransferSuccess={() => {
          setTransferModalOpen(false);
          onTransferSuccess?.();
        }}
      />
    </Card>
  );
}
