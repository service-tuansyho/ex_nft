# AI Coding Guidelines for ex-nft

## Project Overview

Next.js 16 NFT marketplace for Optimism with wallet integration (RainbowKit/Wagmi), MongoDB persistence, and ERC-721 smart contract minting. Full Web3 stack: frontend (React 19, Tailwind v4, MUI), backend (Next.js API routes), blockchain (Solidity, Hardhat), and database (MongoDB/Mongoose).

## Architecture & Data Flow

**Three-Tier Integration:**

1. **Blockchain** → Wagmi 2.x hooks (`useWriteContract`, `useWaitForTransactionReceipt`) call `ExNFT.sol::mint()` on Optimism
2. **File Storage** → Minted image uploads to Cloudinary via `/api/upload` (multipart form-data)
3. **Database** → Metadata persisted in MongoDB via `/api/nfts` POST after on-chain confirmation

**Key Pattern:** User connects wallet via RainbowKit → auto-creates DB user in `/api/users` → mints token via Wagmi contract write → uploads image to Cloudinary → saves NFT metadata to MongoDB → fetches user's NFTs from DB. See [app/profile/page.tsx](app/profile/page.tsx) for complete minting flow using React Query mutations.

## Core Conventions

- **Client vs Server**: Only `"use client"` for Web3 hooks, theme context, modals. Pages are server components by default.
- **Styling**: Tailwind v4 + MUI. Theme CSS vars in `globals.css` toggled via `ThemeContext`. Always use `bg-background text-foreground` for dark mode.
- **Web3 Hooks**: Use Wagmi 2.x API (`useAccount`, `useWriteContract`, `useWaitForTransactionReceipt`). RainbowKit handles wallet UI via `ConnectButton` (see [components/Header.tsx](components/Header.tsx)).
- **Contract Address**: Hardcoded in [components/MintModal.tsx](components/MintModal.tsx#L35) as `NFT_CONTRACT_ADDRESS`. Update this when redeploying contract to Optimism.
- **API Patterns**: All routes return `{ success: boolean, data/error }`. Use `dbConnect()` middleware and Mongoose models (User, NFT, Transaction in [lib/models.ts](lib/models.ts)).
- **Queries & Mutations**: React Query for all async state. Set up in [app/providers.tsx](app/providers.tsx) with custom theme colors for accent.
- **Contract Calls**: `ExNFT` is ERC-721 with `mint(address, tokenURI)` payable function. Mint fee configurable by owner via `setMintFee()`. Deploy via `npx hardhat run scripts/deploy.js --network optimism`.

## File Reference Map

| File | Purpose | Key Detail |
| --- | --- | --- |
| [app/providers.tsx](app/providers.tsx) | Theme + Web3 setup | Wagmi 2.x config with customOptimism chain; "OP" currency symbol; RainbowKit theme colors |
| [lib/mongodb.ts](lib/mongodb.ts) | DB connection | Global singleton caching prevents exponential connections during dev hot reloads |
| [lib/models.ts](lib/models.ts) | Mongoose schemas | User (unique address), NFT (tokenId + owner), Transaction (txHash tracking) |
| [app/api/nfts/route.ts](app/api/nfts/route.ts) | NFT CRUD | GET filters by owner; POST saves minted NFT metadata with required fields |
| [app/api/users/route.ts](app/api/users/route.ts) | User management | POST creates user by wallet address; auto-called on profile load |
| [app/api/upload/route.ts](app/api/upload/route.ts) | Cloudinary upload | Converts FormData file to Buffer, streams to Cloudinary; returns secure_url |
| [components/MintModal.tsx](components/MintModal.tsx) | Mint UI | Form inputs + Wagmi write hook → image upload → DB save; handles tx confirmation |
| [contracts/ExNFT.sol](contracts/ExNFT.sol) | ERC-721 contract | `mint()` requires msg.value >= mintFee; auto-increments tokenId; transfers fee to owner |

## Developer Commands

```bash
npm run dev          # Next.js dev with hot reload
npm run build        # Production build
npm run lint         # ESLint (flat config)
npx hardhat run scripts/deploy.js --network optimism  # Deploy contract to Optimism
```

## Environment (.env.local)

```
MONGODB_URI=mongodb+srv://...
PRIVATE_KEY=0x...  # For Hardhat contract deployment
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Code Patterns to Follow

- **NFT Minting**: Mint on-chain via Wagmi → upload image via FormData → POST to `/api/nfts` with tokenId + contractAddress + image URL
- **Wallet Checks**: Use `useAccount()` hook; render fallback UI if `!isConnected`
- **Database Queries**: Always call `await dbConnect()` first in API routes; use Mongoose `.lean()` for read-only queries
- **Error Handling**: Wrap API responses in try-catch; return NextResponse.json with 400/500 status codes
- **Type Safety**: Define TypeScript interfaces (IUser, INFT) matching Mongoose schema; use `mongoose.Types.ObjectId` for references
- **Image Storage**: No local uploads; always use Cloudinary URL in NFT metadata

## Common Gotchas

- **Dev server hot reloads**: MongoDB connection cached globally in [lib/mongodb.ts](lib/mongodb.ts) to prevent exponential connections. This is intentional pattern, not a memory leak.
- **Dark mode**: Must toggle via ThemeContext AND set `dark`/`light` class on `document.documentElement`, not just CSS variables
- **Wagmi config**: Customized Optimism chain in [app/providers.tsx](app/providers.tsx) with custom nativeCurrency symbol "OP"; must match deployed contract network
- **Mint fees**: Contract owner can set fee via `setMintFee()`; users must send `msg.value >= mintFee` in transaction or mint will revert
- **Token ID tracking**: Currently uses transaction hash as tokenId placeholder (TODO in MintModal.tsx); should parse actual tokenId from ERC721 Transfer event logs
- **Address normalization**: NFT routes and queries lowercase addresses (`.toLowerCase()`) to prevent duplicate records for mixed-case inputs
- **RainbowKit projectId**: Hardcoded in `providers.tsx`; get from https://cloud.walletconnect.com and update when changing wallet support
  <parameter name="filePath">/home/tuansyho/Desktop/code ex nft/ex-nft/.github/copilot-instructions.md
