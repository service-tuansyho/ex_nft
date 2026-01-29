"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Typography,
} from "@mui/material";
import { INFT } from "@/lib/models";

interface Props {
    open: boolean;
    nft: INFT | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ListNFTDialog({ open, nft, onClose, onSuccess }: Props) {
    const [price, setPrice] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) setPrice("");
    }, [open]);

    const handleList = async () => {
        if (!nft) return;
        if (!price || parseFloat(price) <= 0) {
            setError("Please enter a valid price");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/nfts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tokenId: nft.tokenId,
                    contractAddress: nft.contractAddress,
                    price: parseFloat(price),
                    listed: true,
                }),
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(body.error || response.statusText || "Failed to list NFT");
                setIsLoading(false);
                return;
            }

            onSuccess?.();
        } catch (err) {
            setError((err as Error).message || "Failed to list NFT");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>List NFT for Sale</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    {nft && (
                        <>
                            <Typography variant="body2">
                                <strong>{nft.name}</strong>
                            </Typography>
                            <TextField
                                fullWidth
                                label="Price (ETH)"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                inputProps={{ step: "0.01", min: "0" }}
                            />
                        </>
                    )}
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button onClick={handleList} variant="contained" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={18} /> : "List"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
