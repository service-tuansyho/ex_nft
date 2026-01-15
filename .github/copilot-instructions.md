# AI Coding Guidelines for ex-nft

## Project Overview

Next.js 16 NFT marketplace for Optimism with wallet integration (RainbowKit/Wagmi), MongoDB persistence, and ERC-721 smart contract minting. Full Web3 stack: frontend (React 19, Tailwind v4, MUI), backend (Next.js API routes), blockchain (Solidity, Hardhat), and database (MongoDB/Mongoose).

## Architecture & Data Flow

**Three-Tier Integration:**

1. **Blockchain** → Wagmi hooks (`useWriteContract`, `useWaitForTransactionReceipt`) call `ExNFT.sol::mint()` on Optimism
2. **File Storage** → Minted image uploads to Cloudinary via `/api/upload` (multipart form-data)
3. **Database** → Metadata persisted in MongoDB via `/api/nfts` POST after on-chain confirmation

**Key Pattern:** User connects wallet → auto-creates DB user in `/api/users` → mints token → saves NFT metadata → fetches user's NFTs from DB. See [app/profile/page.tsx](app/profile/page.tsx) for complete minting flow using React Query mutations.

## Core Conventions

- **Client vs Server**: Only `"use client"` for Web3 hooks, theme context, modals. Pages are server components by default.
- **Styling**: Tailwind v4 + MUI. Theme CSS vars in `globals.css` toggled via `ThemeContext`. Always use `bg-background text-foreground` for dark mode.
- **Web3 Hooks**: Use Wagmi 2.x API (`useAccount`, `useWriteContract`). RainbowKit handles wallet UI via `ConnectButton` (see [components/Header.tsx](components/Header.tsx#L15-L17)).
- **API Patterns**: All routes return `{ success: boolean, data/error }`. Use `dbConnect()` middleware and Mongoose models (User, NFT, Transaction in [lib/models.ts](lib/models.ts)).
- **Queries & Mutations**: React Query for all async state. Set up in `providers.tsx` with custom theme colors for accent.
- **Contract Calls**: `ExNFT` is ERC-721 with `mint(address, tokenURI)` payable. Mint fee configurable by owner. Deploy via `npx hardhat run scripts/deploy.js --network optimism`.

## File Reference Map

| File                                                       | Purpose            | Key Detail                                                                  |
| ---------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| [app/providers.tsx](app/providers.tsx)                     | Theme + Web3 setup | Wagmi config uses customOptimism chain with "OP" currency symbol            |
| [lib/mongodb.ts](lib/mongodb.ts)                           | DB connection      | Global singleton caching prevents connection growth during hot reloads      |
| [lib/models.ts](lib/models.ts)                             | Mongoose schemas   | User (unique address), NFT (tokenId + owner), Transaction (txHash tracking) |
| [app/api/nfts/route.ts](app/api/nfts/route.ts#L9-L15)      | NFT CRUD           | GET filters by owner; POST saves minted NFT metadata                        |
| [app/api/upload/route.ts](app/api/upload/route.ts#L12-L35) | Cloudinary upload  | Converts FormData file to Buffer, streams to Cloudinary                     |
| [components/MintModal.tsx](components/MintModal.tsx)       | Mint UI            | Form inputs + Wagmi write hook → Cloudinary upload → DB save                |
| [contracts/ExNFT.sol](contracts/ExNFT.sol#L14-L19)         | ERC-721 contract   | `mint()` requires fee, increments tokenId, calls owner().transfer()         |

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

- **Dev server hot reloads**: MongoDB connection cached globally in [lib/mongodb.ts](lib/mongodb.ts#L16-L19) to prevent exponential connections
- **Dark mode**: Must toggle via ThemeContext AND set `dark`/`light` class on `document.documentElement`, not just CSS
- **Wagmi config**: Customized Optimism chain in [app/providers.tsx](app/providers.tsx#L17-L22); must match deployed contract network
- **Mint fees**: Contract owner can set fee via `setMintFee()`; users must send `msg.value >= mintFee` in transaction
  <parameter name="filePath">/home/tuansyho/Desktop/code ex nft/ex-nft/.github/copilot-instructions.md
