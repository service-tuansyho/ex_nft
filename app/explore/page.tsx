"use client";

import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Chip,
    Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { INFT } from "@/lib/models";
import NFTDetails from "@/components/NFTDetails";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function Explore() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNFT, setSelectedNFT] = useState<INFT | null>(null);

    // Fetch all NFTs from API
    const {
        data: nfts,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["explore-nfts"],
        queryFn: async () => {
            const response = await fetch("/api/nfts/explore");
            if (!response.ok) {
                throw new Error("Failed to fetch NFTs");
            }
            return response.json();
        },
        staleTime: 30000, // 30 seconds
    });

    // Filter NFTs based on search term
    const filteredNFTs = (nfts?.data || []).filter((nft: INFT) =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNFTClick = (nft: INFT) => {
        setSelectedNFT(nft);
    };

    const handleDetailsClose = () => {
        setSelectedNFT(null);
    };

    return (
        <Container maxWidth="lg" className="min-h-screen py-8">
            {selectedNFT ? (
                // Details View
                <Box>
                    <Button
                        onClick={handleDetailsClose}
                        sx={{ mb: 3 }}
                        variant="contained"
                    >
                        ← Back to Explore
                    </Button>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <NFTDetails
                                tokenId={selectedNFT.tokenId}
                                contractAddress={selectedNFT.contractAddress}
                                owner={selectedNFT.owner}
                                name={selectedNFT.name}
                                description={selectedNFT.description}
                                image={selectedNFT.image}
                                price={selectedNFT.price}
                                listed={selectedNFT.listed}
                                createdAt={selectedNFT.createdAt?.toString()}
                            />
                        </Grid>
                    </Grid>
                </Box>
            ) : (
                // Grid View
                <>
                    {/* Header Section */}
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
                            Explore NFTs
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Discover and explore unique NFTs on Optimism network
                        </Typography>

                        {/* Search and Filter */}
                        <TextField
                            placeholder="Search NFTs by name or description..."
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ mb: 3 }}
                            size="small"
                        />
                    </Box>

                    {/* Loading State */}
                    {isLoading && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error instanceof Error ? error.message : "Failed to load NFTs"}
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && filteredNFTs.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                {searchTerm ? "No NFTs found matching your search" : "No NFTs available yet"}
                            </Typography>
                        </Box>
                    )}

                    {/* NFT Grid */}
                    {!isLoading && !isError && filteredNFTs.length > 0 && (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Found {filteredNFTs.length} NFT{filteredNFTs.length !== 1 ? "s" : ""}
                            </Typography>

                            <Grid container spacing={3}>
                                {filteredNFTs.map((nft: INFT) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={nft._id?.toString()}>
                                        <Card
                                            sx={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                cursor: "pointer",
                                                transition: "transform 0.2s, box-shadow 0.2s",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: 4,
                                                },
                                            }}
                                            onClick={() => handleNFTClick(nft)}
                                        >
                                            {/* NFT Image */}
                                            <CardMedia
                                                component="img"
                                                height="240"
                                                image={nft.image}
                                                alt={nft.name}
                                                sx={{ objectFit: "cover" }}
                                            />

                                            {/* NFT Info */}
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography gutterBottom variant="h6" component="div">
                                                    {nft.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {nft.description || "No description"}
                                                </Typography>

                                                {/* Tags */}
                                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                                    {nft.listed && (
                                                        <Chip label="Listed" size="small" color="primary" variant="outlined" />
                                                    )}
                                                    {nft.price && (
                                                        <Chip label={`${nft.price} ETH`} size="small" variant="outlined" />
                                                    )}
                                                </Stack>
                                            </CardContent>

                                            {/* Actions */}
                                            <CardActions sx={{ pt: 0 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<ShoppingCartIcon />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNFTClick(nft);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<FavoriteBorderIcon />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    Like
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </>
            )}
        </Container>
    );
}
