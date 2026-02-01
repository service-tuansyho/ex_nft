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
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { useAccount } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { INFT } from "@/lib/models";
import NFTDetails from "@/components/NFTDetails";
import ListNFTDialog from "@/components/ListNFTDialog";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function Trade() {
    const { address, isConnected } = useAccount();
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);
    const [selectedNFT, setSelectedNFT] = useState<INFT | null>(null);
    const [listingDialogOpen, setListingDialogOpen] = useState(false);

    // Fetch user's NFTs
    const {
        data: userNFTs,
        isLoading: userNFTsLoading,
        isError: userNFTsError,
    } = useQuery({
        queryKey: ["user-nfts", address],
        queryFn: async () => {
            if (!address) return null;
            const response = await fetch(`/api/nfts?owner=${address.toLowerCase()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user NFTs");
            }
            return response.json();
        },
        enabled: isConnected && !!address,
        staleTime: 30000,
    });

    // Fetch listed NFTs (for market)
    const {
        data: marketNFTs,
        isLoading: marketNFTsLoading,
        isError: marketNFTsError,
    } = useQuery({
        queryKey: ["market-nfts"],
        queryFn: async () => {
            const response = await fetch("/api/nfts/explore");
            if (!response.ok) {
                throw new Error("Failed to fetch market NFTs");
            }
            const data = await response.json();
            // Filter only listed NFTs
            return {
                ...data,
                data: (data.data || []).filter((nft: INFT) => nft.listed),
            };
        },
        staleTime: 30000,
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleListingDialogOpen = (nft: INFT) => {
        setSelectedNFT(nft);
        setListingDialogOpen(true);
    };

    const handleListingDialogClose = () => {
        setListingDialogOpen(false);
        setSelectedNFT(null);
    };



    if (!isConnected) {
        return (
            <Container maxWidth="lg" className="min-h-screen py-8">
                <Alert severity="info">Please connect your wallet to trade NFTs</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" className="min-h-screen py-8">
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold", mb: 4 }}>
                Trade NFTs
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="trade tabs">
                    <Tab label="My NFTs" />
                    <Tab label="Marketplace" />
                </Tabs>
            </Box>

            {/* My NFTs Tab */}
            <TabPanel value={tabValue} index={0}>
                {userNFTsLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : userNFTsError ? (
                    <Alert severity="error">Failed to load your NFTs</Alert>
                ) : (userNFTs?.data || []).length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        You don't own any NFTs yet.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {(userNFTs.data || []).map((nft: INFT) => (
                            <Grid item xs={12} sm={6} md={4} key={nft.tokenId}>
                                <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={nft.image}
                                        alt={nft.name}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h6" component="div">
                                            {nft.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {nft.description}
                                        </Typography>
                                        {nft.listed && (
                                            <Typography variant="body2" color="primary" sx={{ fontWeight: "bold" }}>
                                                Price: {nft.price} ETH
                                            </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            Token ID: {nft.tokenId}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "space-between" }}>
                                        <Button
                                            size="small"
                                            onClick={() => setSelectedNFT(nft)}
                                            variant="outlined"
                                        >
                                            View
                                        </Button>
                                        {!nft.listed ? (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleListingDialogOpen(nft)}
                                            >
                                                List for Sale
                                            </Button>
                                        ) : (
                                            <Typography variant="caption" color="success.main" sx={{ fontWeight: "bold" }}>
                                                ✓ Listed
                                            </Typography>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Details Modal for My NFTs */}
                <Dialog open={!!selectedNFT && tabValue === 0} onClose={() => setSelectedNFT(null)} maxWidth="md" fullWidth>
                    {selectedNFT && (
                        <>
                            <DialogTitle>{selectedNFT.name}</DialogTitle>
                            <DialogContent>
                                <Box sx={{ mt: 2 }}>
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
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setSelectedNFT(null)}>Close</Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>

                <ListNFTDialog
                    open={listingDialogOpen}
                    nft={selectedNFT}
                    onClose={handleListingDialogClose}
                    onSuccess={() => {
                        handleListingDialogClose();
                        // Invalidate queries so data refreshes without a full page reload
                        if (address) queryClient.invalidateQueries({ queryKey: ["user-nfts", address] });
                        queryClient.invalidateQueries({ queryKey: ["market-nfts"] });
                    }}
                />
            </TabPanel>

            {/* Marketplace Tab */}
            <TabPanel value={tabValue} index={1}>
                {marketNFTsLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : marketNFTsError ? (
                    <Alert severity="error">Failed to load marketplace</Alert>
                ) : (marketNFTs?.data || []).length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        No NFTs listed for sale yet.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {(marketNFTs.data || []).map((nft: INFT) => (
                            <Grid item xs={12} sm={6} md={4} key={nft.tokenId}>
                                <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={nft.image}
                                        alt={nft.name}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h6" component="div">
                                            {nft.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {nft.description}
                                        </Typography>
                                        {nft.price && (
                                            <Typography variant="body2" color="primary" sx={{ fontWeight: "bold" }}>
                                                Price: {nft.price} ETH
                                            </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            Seller: {nft.owner.slice(0, 10)}...
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => setSelectedNFT(nft)}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            disabled
                                        >
                                            Buy (Coming Soon)
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Details Modal for Marketplace */}
                <Dialog open={!!selectedNFT && tabValue === 1} onClose={() => setSelectedNFT(null)} maxWidth="md" fullWidth>
                    {selectedNFT && (
                        <>
                            <DialogTitle>{selectedNFT.name}</DialogTitle>
                            <DialogContent>
                                <Box sx={{ mt: 2 }}>
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
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setSelectedNFT(null)}>Close</Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </TabPanel>
        </Container>
    );
}
