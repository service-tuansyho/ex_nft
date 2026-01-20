"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// ERC721 contract ABI for safeTransferFrom
const ERC721_ABI = [
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  tokenId: string;
  contractAddress: string;
  onTransferSuccess?: () => void;
}

export default function TransferModal({
  open,
  onClose,
  tokenId,
  contractAddress,
  onTransferSuccess,
}: TransferModalProps) {
  const { address } = useAccount();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [hash, setHash] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  // Query blockchain to verify token owner
  const { data: blockchainOwner, isLoading: isCheckingOwner } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: ERC721_ABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
    query: {
      enabled: open && !!tokenId && !isNaN(Number(tokenId)),
    },
  });

  const { writeContract, data: txHash, isPending: isTransferring } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track transfer in database
  const trackTransferMutation = useMutation({
    mutationFn: async (transferData: {
      tokenId: string;
      contractAddress: string;
      from: string;
      to: string;
      txHash: string;
    }) => {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      });
      if (!response.ok) {
        throw new Error("Failed to track transfer");
      }
      return response.json();
    },
  });

  // Update NFT ownership after successful transfer
  useEffect(() => {
    if (isConfirmed && txHash && address && recipientAddress) {
      setHash(txHash);
      trackTransferMutation.mutate({
        tokenId,
        contractAddress,
        from: address,
        to: recipientAddress.toLowerCase(),
        txHash,
      });
    }
  }, [isConfirmed, txHash, address, recipientAddress, contractAddress, tokenId, trackTransferMutation]);

  // Close modal and reset on success
  useEffect(() => {
    if (trackTransferMutation.isSuccess) {
      onTransferSuccess?.();
      setRecipientAddress("");
      setHash("");
      onClose();
    }
  }, [trackTransferMutation.isSuccess, onTransferSuccess, onClose]);

  const handleTransfer = async () => {
    setValidationError("");

    // Validation checks
    if (!address) {
      setValidationError("Please connect your wallet");
      return;
    }

    if (!recipientAddress) {
      setValidationError("Please enter recipient address");
      return;
    }

    // Validate Ethereum address format
    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setValidationError("Invalid Ethereum address format");
      return;
    }

    if (recipientAddress.toLowerCase() === address.toLowerCase()) {
      setValidationError("Cannot transfer to yourself");
      return;
    }

    // Validate tokenId is a valid number
    if (!tokenId || isNaN(Number(tokenId))) {
      setValidationError("Invalid token ID");
      return;
    }

    // Verify blockchain owner matches current user
    if (blockchainOwner && blockchainOwner.toLowerCase() !== address.toLowerCase()) {
      setValidationError(
        `You are not the owner. Owner: ${(blockchainOwner as string).slice(0, 6)}...`
      );
      return;
    }

    try {
      console.log("Transfer Details:", {
        from: address,
        to: recipientAddress,
        tokenId: tokenId,
        tokenIdBigInt: BigInt(tokenId).toString(),
        contract: contractAddress,
        blockchainOwner: blockchainOwner,
      });

      // Try safeTransferFrom first, fallback to transferFrom if needed
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "safeTransferFrom",
        args: [address as `0x${string}`, recipientAddress as `0x${string}`, BigInt(tokenId)],
        gas: BigInt(150000), // Increased gas limit for safe transfer
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Transfer failed";
      setValidationError(`Error: ${errorMsg}`);
      console.error("Transfer failed:", error);
    }
  };

  const handleClose = () => {
    if (!isTransferring && !isConfirming) {
      onClose();
      setRecipientAddress("");
      setHash("");
      setValidationError("");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transfer NFT</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Token ID: {tokenId}
            </Typography>
          </Box>

          {isCheckingOwner && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Verifying token owner...</Typography>
            </Box>
          )}

          {blockchainOwner && (
            <Alert severity={blockchainOwner.toLowerCase() === address?.toLowerCase() ? "success" : "error"}>
              Blockchain Owner: {(blockchainOwner as string).slice(0, 10)}...
              {blockchainOwner.toLowerCase() === address?.toLowerCase() ? " ✓" : " ✗ Mismatch"}
            </Alert>
          )}

          {validationError && (
            <Alert severity="error">{validationError}</Alert>
          )}

          <TextField
            fullWidth
            label="Recipient Address"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => {
              setRecipientAddress(e.target.value);
              setValidationError(""); // Clear error when user types
            }}
            disabled={isTransferring || isConfirming || isCheckingOwner}
            helperText="Enter the Ethereum address to send this NFT to"
            error={validationError.length > 0}
          />

          {hash && (
            <Alert severity="success">
              Transfer confirmed! Transaction: {hash.slice(0, 10)}...
            </Alert>
          )}

          {isTransferring && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Waiting for signature...</Typography>
            </Box>
          )}

          {isConfirming && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Confirming transaction...</Typography>
            </Box>
          )}

          {trackTransferMutation.isPending && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Recording transfer...</Typography>
            </Box>
          )}

          {trackTransferMutation.isError && (
            <Alert severity="error">
              Failed to record transfer. Please check manually on Etherscan.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isTransferring || isConfirming}>
          Cancel
        </Button>
        <Button
          onClick={handleTransfer}
          variant="contained"
          disabled={
            isTransferring ||
            isConfirming ||
            trackTransferMutation.isPending ||
            isCheckingOwner ||
            (blockchainOwner && blockchainOwner.toLowerCase() !== address?.toLowerCase())
          }
        >
          {isTransferring ? "Confirm in Wallet" : isCheckingOwner ? "Verifying..." : "Transfer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
