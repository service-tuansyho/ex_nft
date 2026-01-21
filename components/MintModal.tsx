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
} from "@mui/material";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";

// Mock NFT contract ABI - replace with your actual contract
const NFT_CONTRACT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" },
    ],
    name: "mint",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Replace with your deployed contract address on Optimism
const NFT_CONTRACT_ADDRESS = "0x9d22CB31D2fa8569DAB0C78992459711bc0d8884";

interface MintModalProps {
  open: boolean;
  onClose: () => void;
  onMintSuccess?: () => void;
}

export default function MintModal({
  open,
  onClose,
  onMintSuccess,
}: MintModalProps) {
  const { address } = useAccount();
  const hasClosedRef = useRef(false);
  const [nftForm, setNftForm] = useState({
    name: "",
    description: "",
    image: null as File | null,
  });
  const [imageUrl, setImageUrl] = useState<string>("");
  const [mintAttempt, setMintAttempt] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [lastSavedAttempt, setLastSavedAttempt] = useState(0);
  const [displayedHash, setDisplayedHash] = useState<string>(""); // Track which hash is displayed
  const [lastProcessedHash, setLastProcessedHash] = useState<string>(""); // Track which hash we've already processed

  // Mint NFT contract interaction
  const {
    writeContract,
    data: hash,
    isPending: isMinting,
    reset: resetWriteContract,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Parse tokenId from Transfer event logs
  const parseTokenIdFromLogs = (logs: any[]): string | null => {
    if (!logs) return null;
    
    // ERC721 Transfer event signature
    // event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
    // Topic0: Transfer event hash
    const TRANSFER_EVENT_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    
    for (const log of logs) {
      if (log.topics && log.topics[0] === TRANSFER_EVENT_TOPIC) {
        // tokenId is the 3rd topic (indexed parameter)
        const tokenIdHex = log.topics[3];
        if (tokenIdHex) {
          const tokenId = BigInt(tokenIdHex).toString();
          console.log("Parsed tokenId from logs:", tokenId);
          return tokenId;
        }
      }
    }
    return null;
  };
  const saveNftMutation = useMutation({
    mutationFn: async (nftData: {
      tokenId: string;
      contractAddress: string;
      owner: string;
      name: string;
      description: string;
      image: string;
      listed: boolean;
    }) => {
      const response = await fetch("/api/nfts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nftData),
      });
      if (!response.ok) {
        throw new Error("Failed to save NFT");
      }
      return response.json();
    },
  });

  // Handle successful mint confirmation
  useEffect(() => {
    if (
      open &&
      isConfirmed &&
      hash &&
      hash !== lastProcessedHash && // Only process new hashes
      address &&
      currentAttempt > lastSavedAttempt &&
      receipt
    ) {
      console.log("Processing confirmation for hash:", hash);
      setDisplayedHash(hash);
      setLastProcessedHash(hash); // Mark this hash as processed
      
      // Parse actual tokenId from transaction logs
      const parsedTokenId = parseTokenIdFromLogs(receipt.logs);
      
      if (!parsedTokenId) {
        console.error("Failed to parse tokenId from logs");
        alert("Could not extract tokenId from transaction. Please refresh and check manually.");
        return;
      }

      console.log("Using tokenId from logs:", parsedTokenId);
      setLastSavedAttempt(currentAttempt);
      saveNftMutation.mutate({
        tokenId: parsedTokenId,
        contractAddress: NFT_CONTRACT_ADDRESS,
        owner: address,
        name: nftForm.name,
        description: nftForm.description,
        image: imageUrl,
        listed: false,
      });
    }
  }, [
    open,
    isConfirmed,
    hash,
    lastProcessedHash,
    address,
    currentAttempt,
    lastSavedAttempt,
    receipt,
    saveNftMutation,
    nftForm,
    imageUrl,
  ]);

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setLastSavedAttempt(0);
      setCurrentAttempt(0);
      setMintAttempt(0);
      setNftForm({ name: "", description: "", image: null });
      setImageUrl("");
      setDisplayedHash(""); // Clear displayed hash
      setLastProcessedHash(""); // Clear processed hash tracking
      hasClosedRef.current = false;
      saveNftMutation.reset(); // Reset mutation state
      resetWriteContract(); // Reset Wagmi write contract state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Handle successful save
  useEffect(() => {
    if (saveNftMutation.isSuccess && !hasClosedRef.current) {
      hasClosedRef.current = true;
      onMintSuccess?.();
      onClose(); // Auto close modal on success
    }
  }, [saveNftMutation.isSuccess, onMintSuccess, onClose]);

  const handleMintNFT = async () => {
    if (!address || !nftForm.name || !nftForm.image) {
      alert("Please fill in all required fields");
      return;
    }

    const attempt = mintAttempt + 1;
    setMintAttempt(attempt);
    setCurrentAttempt(attempt);
    
    // Clear previous success message when starting new mint
    setDisplayedHash("");
    setLastProcessedHash("");
    hasClosedRef.current = false; // Reset ref to allow modal to close on next success
    resetWriteContract();

    try {
      // Step 1: Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", nftForm.image);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;
      setImageUrl(imageUrl);

      // Step 2: Create metadata and upload to Cloudinary
      const metadata = {
        name: nftForm.name,
        description: nftForm.description || "",
        image: imageUrl,
      };

      const metadataResponse = await fetch("/api/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!metadataResponse.ok) {
        throw new Error("Failed to upload metadata");
      }

      const metadataData = await metadataResponse.json();
      const tokenURI = metadataData.data.url;

      // Step 3: Mint NFT with metadata URI
      writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: "mint",
        args: [address, tokenURI],
        value: BigInt(10000000000000), // 0.001 ETH in wei
      });
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed. Please try again.");
    }
  };

  const handleClose = () => {
    if (!isMinting && !isConfirming) {
      onClose();
      // Reset form
      setNftForm({ name: "", description: "", image: null });
      setImageUrl("");
    }
  };
  console.log("isMinting", isMinting);
  console.log("form", nftForm);
  console.log("isConfirming", isConfirming);
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New NFT</DialogTitle>
      <DialogContent>
        <Box component="form" className="space-y-4 mt-2">
          <TextField
            fullWidth
            label="NFT Name"
            value={nftForm.name}
            onChange={(e) => setNftForm({ ...nftForm, name: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={nftForm.description}
            onChange={(e) =>
              setNftForm({ ...nftForm, description: e.target.value })
            }
          />

          <Box>
            <Typography variant="body1" gutterBottom>
              Image File
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNftForm({ ...nftForm, image: e.target.files?.[0] || null })
              }
              required
              style={{ display: "block", marginTop: "8px" }}
            />
          </Box>
        </Box>

        {displayedHash && isConfirmed && (
          <Alert severity="success" className="mt-4">
            NFT minted successfully! Transaction hash: {displayedHash}
          </Alert>
        )}

        {saveNftMutation.isSuccess && (
          <Alert severity="info" className="mt-4">
            NFT saved to database successfully!
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isMinting || isConfirming}>
          Cancel
        </Button>
        <Button
          onClick={handleMintNFT}
          variant="contained"
          disabled={isMinting || isConfirming}
        >
          {isMinting
            ? "Minting..."
            : isConfirming
            ? "Confirming..."
            : "Mint NFT"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
