# AI Coding Guidelines for ex-nft

## Project Overview

Next.js 16 NFT marketplace on Optimism with Web3 wallet integration (RainbowKit/Wagmi 2.x), MongoDB/Mongoose persistence, and ERC-721 smart contract minting. Stack: React 19 + Tailwind v4 + MUI (frontend), Next.js 16 API routes (backend), Solidity + Hardhat (contracts), MongoDB (database).

## Architecture & Data Flow

**Three-Tier Integration:**

1. **Blockchain**: Wagmi 2.x hooks call `ExNFT.sol::mint(address, tokenURI)` on Optimism; returns auto-incremented tokenId from contract
2. **File Storage**: Image uploads to Cloudinary via `/api/upload` (multipart FormData); returns `secure_url`
3. **Metadata Storage**: JSON metadata uploaded to Cloudinary as raw file via `/api/metadata`; returns metadata URL for on-chain `tokenURI`
4. **Database**: NFT metadata persisted to MongoDB via `/api/nfts` POST after on-chain confirmation and image upload

**Complete Mint Flow**: User connects wallet (RainbowKit) → enters NFT metadata in `MintModal` → (1) upload image to Cloudinary → (2) upload JSON metadata to Cloudinary → (3) `useWriteContract` calls `mint(to, metadataURL)` on-chain → (4) `useWaitForTransactionReceipt` confirms tx and parses tokenId from Transfer event logs → (5) POST to `/api/nfts` with metadata. See [components/MintModal.tsx](components/MintModal.tsx) for full implementation; uses React Query mutations for state management.

## Core Conventions

- **"use client" Boundary**: Only components with Web3 hooks (Wagmi, RainbowKit), theme context, or interactive dialogs declare `"use client"`. Pages default to server components.
- **Styling**: Tailwind v4 + MUI. Dark/light theme toggled via `ThemeContext` in [app/providers.tsx](app/providers.tsx); **must set both CSS class AND theme variable**: `document.documentElement.classList.add('dark')` + RainbowKit theme prop.
- **Web3 Setup**: Wagmi 2.x config in [app/providers.tsx](app/providers.tsx) uses **custom Optimism chain** with `nativeCurrency.symbol = "OP"` (not "ETH" to match UI). RainbowKit `ConnectButton` in [components/Header.tsx](components/Header.tsx). WalletConnect projectId: `600ff3ccff8155148627a3e3d0690701` (from https://cloud.walletconnect.com).
- **Smart Contract**: `ExNFT` (ERC-721 + URIStorage + Ownable) at `0x9d22CB31D2fa8569DAB0C78992459711bc0d8884` on Optimism. `mint(to, tokenURI)` is payable; reverts if `msg.value < mintFee`. Owner can adjust fee via `setMintFee(uint256)`. Contract auto-increments tokenId via `_nextTokenId`.
- **API Patterns**: All routes return `{ success: boolean, data?: any, error?: string }`. **Always call `await dbConnect()` first in all routes**. Address fields **must be lowercased** (`.toLowerCase()`) for consistency.
- **Async State**: React Query (`@tanstack/react-query`) for all mutations/queries. `QueryClient` initialized in [app/providers.tsx](app/providers.tsx). Use `useMutation` for write operations; reset mutations on modal close.

## File Reference Map

| File | Purpose | Key Pattern |
|------|---------|-----------|
| [app/providers.tsx](app/providers.tsx) | Wagmi + Theme + Query setup | Initializes custom Optimism chain, RainbowKit, QueryClient, ThemeContext. Sets `document.documentElement` class AND RainbowKit theme |
| [lib/mongodb.ts](lib/mongodb.ts) | MongoDB singleton | **Global cache intentional** to prevent connection spam during dev. Always `await dbConnect()` first in routes |
| [lib/models.ts](lib/models.ts) | Mongoose schemas (User, NFT, Transaction) | `User.address` unique + indexed; `NFT.owner` lowercased; `Transaction.status` enum: pending/completed/failed |
| [app/api/nfts/route.ts](app/api/nfts/route.ts) | NFT CRUD (GET/POST) | GET filters by `owner` query (lowercase); POST validates tokenId, contractAddress, owner, name, image |
| [app/api/users/route.ts](app/api/users/route.ts) | User upsert (POST) | Creates/updates user doc by `address.toLowerCase()`; idempotent operation |
| [app/api/upload/route.ts](app/api/upload/route.ts) | Cloudinary image upload | FormData file → Buffer → Cloudinary stream; returns `{ success, data: { url } }` |
| [app/api/metadata/route.ts](app/api/metadata/route.ts) | Cloudinary metadata JSON upload | JSON object → Buffer → Cloudinary raw file; returns metadata URL for `tokenURI` |
| [components/MintModal.tsx](components/MintModal.tsx) | NFT mint dialog | Orchestrates: image upload → metadata upload → contract mint → tx confirm (parses tokenId from logs) → DB save |
| [components/Header.tsx](components/Header.tsx) | Header + RainbowKit integration | `ConnectButton.Custom` for wallet UI; theme toggle mutates `document.documentElement` + localStorage |
| [contracts/ExNFT.sol](contracts/ExNFT.sol) | ERC-721 contract | `mint(to, tokenURI)` payable; auto-increments tokenId; transfers `msg.value` to owner |

## Developer Commands

```bash
npm run dev                                              # Start Next.js dev server (hot reload on)
npm run build                                            # Production build
npm run lint                                             # ESLint check
npx hardhat run scripts/deploy.js --network optimism     # Deploy ExNFT contract to Optimism
```

## Environment (.env.local)

```
MONGODB_URI=mongodb+srv://[user]:[pass]@...
PRIVATE_KEY=0x...                    # For Hardhat deployments
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Code Patterns to Follow

- **Minting Flow** (in [components/MintModal.tsx](components/MintModal.tsx)): (1) Validate form + wallet connection, (2) POST image to `/api/upload` → get `secure_url`, (3) POST metadata to `/api/metadata` → get metadata JSON URL, (4) `useWriteContract` calls `mint(address, tokenURI)`, (5) `useWaitForTransactionReceipt` confirms + parse tokenId from Transfer event logs, (6) POST to `/api/nfts` with tokenId + metadata
- **Transaction Confirmation**: Parse tokenId from Transfer event logs (topic3): `const tokenId = BigInt(log.topics[3]).toString()` to avoid relying on return values
- **Wallet Guards**: Use `useAccount()` hook; validate `isConnected` && `address` before any Web3 operations
- **API Error Handling**: All routes wrapped in try-catch; return `{ success: false, error: string }` with 400 (bad input) or 500 (server error)
- **Type Safety**: Export TS interfaces (`IUser`, `INFT`, `ITransaction`) from [lib/models.ts](lib/models.ts); import in API routes for strict typing
- **Database Queries**: Always `await dbConnect()` first; use `.lean()` for read-only GET queries; `.findOneAndUpdate(..., { upsert: true })` for idempotent user creation
- **Address Normalization**: **All address input must be lowercased** (`.toLowerCase()`) before DB queries/storage to prevent duplicates from mixed-case inputs

## Common Gotchas & Debugging

- **MongoDB connection spam**: Global singleton in [lib/mongodb.ts](lib/mongodb.ts) is **intentional** to cache connections across hot-reloads. Not a leak—prevents exponential connection growth during `npm run dev`.
- **Theme not persisting**: Must set BOTH `document.documentElement.classList.add('dark')` AND pass theme prop to RainbowKit. CSS variables alone won't sync RainbowKit UI. localStorage also stores preference for next session.
- **Custom Optimism chain required**: `customOptimism` in [app/providers.tsx](app/providers.tsx) **must** set `nativeCurrency.symbol = "OP"`. Using default `optimism` chain will show "ETH" in RainbowKit, breaking UX expectations.
- **Mint fails silently**: If `useWriteContract` doesn't fire, check: (1) `msg.value >= mintFee` (defaults to 0, but explicitly set in contract), (2) user has enough gas (~100k), (3) address is valid ERC-721 recipient, (4) contract deployed to correct Optimism network address.
- **Transaction receipt undefined**: `useWaitForTransactionReceipt` will hang if `hash` is undefined. Always guard: `if (!hash) return`. Hash is undefined if `writeContract` failed silently.
- **TokenId parsing from logs fails**: Transfer event signature must match exactly. Use topic0 `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef` and extract tokenId from `topics[3]` (indexed parameter). Fallback: query contract directly with `tokenOfOwnerByIndex()`.
- **Image upload fails**: Ensure file is `File` object (not string). `/api/upload` converts to Buffer via `arrayBuffer()`. MIME type must start with `image/`. Check Cloudinary credentials in `.env.local`.
- **RainbowKit wallet list empty**: Verify WalletConnect projectId in [app/providers.tsx](app/providers.tsx) is valid and active. Get new projectId at https://cloud.walletconnect.com/sign-in if needed.
- **Mixed-case address duplicates in DB**: All addresses from user input must be lowercased before DB operations. Check both GET queries and POST upserts use `.toLowerCase()`.
  <parameter name="filePath">/home/tuansyho/Desktop/code ex nft/ex-nft/.github/copilot-instructions.md
