# AI Coding Guidelines for ex-nft

## Project Overview

Next.js 16 NFT marketplace on Optimism with Web3 wallet integration (RainbowKit/Wagmi 2.x), MongoDB/Mongoose persistence, and ERC-721 smart contract minting. Stack: React 19 + Tailwind v4 + MUI (frontend), Next.js 16 API routes (backend), Solidity + Hardhat (contracts), MongoDB (database).

## Architecture & Data Flow

**Three-Tier Integration:**

1. **Blockchain**: Wagmi 2.x hooks call `ExNFT.sol::mint(address, tokenURI)` on Optimism; returns tokenId
2. **File Storage**: Image uploads to Cloudinary via `/api/upload` (multipart FormData); returns `secure_url`
3. **Database**: NFT metadata persisted to MongoDB via `/api/nfts` POST after on-chain confirmation and image upload

**Complete Mint Flow**: User connects wallet (RainbowKit) → enters NFT metadata in `MintModal` → `useWriteContract` calls `mint()` on-chain → `useWaitForTransactionReceipt` confirms tx → uploads image to Cloudinary → POST to `/api/nfts` with metadata → fetches updated NFT list from `/api/nfts?owner=address`. See [components/MintModal.tsx](components/MintModal.tsx) for full implementation; uses React Query mutations for state management.

## Core Conventions

- **"use client" Boundary**: Only components with Web3 hooks (Wagmi, RainbowKit), theme context, or dialogs declare `"use client"`. Pages default to server components.
- **Styling**: Tailwind v4 + MUI. Dark/light theme toggled via `ThemeContext` in [app/providers.tsx](app/providers.tsx); theme class set on `document.documentElement` (not just CSS vars).
- **Web3 Setup**: Wagmi 2.x config in [app/providers.tsx](app/providers.tsx) uses custom Optimism chain with `nativeCurrency.symbol = "OP"` (not "ETH"). RainbowKit `ConnectButton` in [components/Header.tsx](components/Header.tsx). WalletConnect projectId: `600ff3ccff8155148627a3e3d0690701`.
- **Smart Contract**: `ExNFT` (ERC-721 + URIStorage + Ownable) at `0x4e2BC3C9850263BA5Eee209C4ede54b190e3Cd41` on Optimism. `mint(to, tokenURI)` is payable; reverts if `msg.value < mintFee`. Owner can adjust fee via `setMintFee(uint256)`.
- **API Patterns**: All routes return `{ success: boolean, data?: any, error?: string }`. Use `dbConnect()` in all routes. Address fields stored lowercased (`.toLowerCase()`).
- **Async State**: React Query (`@tanstack/react-query`) for all mutations/queries. `QueryClient` initialized in [app/providers.tsx](app/providers.tsx). Use `useMutation` for write operations.

## File Reference Map

| File | Purpose | Key Detail |
|------|---------|-----------|
| [app/providers.tsx](app/providers.tsx) | Wagmi + Theme + Query setup | WagmiProvider with custom Optimism chain, RainbowKitProvider, QueryClientProvider, ThemeContext. Dark class toggled on `document.documentElement` |
| [lib/mongodb.ts](lib/mongodb.ts) | MongoDB singleton | Global caching to prevent exponential connections on dev hot-reloads. Always call `await dbConnect()` in API routes |
| [lib/models.ts](lib/models.ts) | Mongoose schemas (User, NFT, Transaction) | `User.address` unique; `NFT.owner` lowercased; `Transaction.status` enum: pending/completed/failed |
| [app/api/nfts/route.ts](app/api/nfts/route.ts) | NFT CRUD (GET/POST) | GET: filters by `owner` query param (lowercased); POST: requires tokenId, contractAddress, owner, name, image |
| [app/api/users/route.ts](app/api/users/route.ts) | User creation (POST) | Auto-creates user doc by wallet address; called on profile page load |
| [app/api/upload/route.ts](app/api/upload/route.ts) | Cloudinary image upload (POST) | Receives FormData with file; returns `{ url: secure_url }` |
| [components/MintModal.tsx](components/MintModal.tsx) | NFT mint UI dialog | Form (name, description, image file) → `useWriteContract` → Cloudinary upload → `/api/nfts` POST. Uses `useMutation` + `useWaitForTransactionReceipt` |
| [contracts/ExNFT.sol](contracts/ExNFT.sol) | ERC-721 contract | `mint(address to, string tokenURI)` payable; auto-increments `_nextTokenId`; transfers `msg.value` to owner |

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

- **Minting Flow**: (1) `useWriteContract()` call to `mint()` with gas estimation, (2) `useWaitForTransactionReceipt()` to confirm, (3) POST FormData to `/api/upload` for image, (4) POST metadata to `/api/nfts` with returned image URL
- **Wallet Guards**: Use `useAccount()` hook; check `isConnected` && `address` before rendering Web3 UI
- **API Error Handling**: All routes wrapped in try-catch; return `{ success: false, error: string }` on failure with appropriate 400/500 status
- **Type Safety**: Define TS interfaces matching Mongoose schemas (e.g., `IUser`, `INFT` in [lib/models.ts](lib/models.ts)); import and use them in API routes
- **Database Queries**: Always `await dbConnect()` first; use `.lean()` for read-only queries to improve performance
- **Address Normalization**: Always lowercase addresses in queries/storage (`.toLowerCase()`) to avoid duplicates from mixed-case input

## Common Gotchas & Debugging

- **MongoDB hot-reload**: Global connection singleton in [lib/mongodb.ts](lib/mongodb.ts) intentional—prevents connection spam during `npm run dev`. This is NOT a memory leak.
- **Theme not updating**: Must set both CSS variables AND `document.documentElement.classList.add('dark'/'light')` in ThemeContext; CSS-only changes won't persist.
- **Custom Optimism chain**: [app/providers.tsx](app/providers.tsx) defines `customOptimism` with `nativeCurrency.symbol = "OP"` to match UI expectations. Wagmi config must use this chain, not `optimism` from wagmi/chains.
- **Mint reverts**: If mint fails, check: (1) `msg.value >= mintFee` in contract, (2) user has enough gas, (3) contract deployed to Optimism mainnet (testnet has different address)
- **Image upload fails**: FormData file encoding issues—ensure file is `File` object (not string); `/api/upload` converts to Buffer before Cloudinary stream
- **useWaitForTransactionReceipt hangs**: Hash may be undefined if `writeContract` failed; add guard: `if (!hash) return`
- **RainbowKit wallet list empty**: Check WalletConnect projectId in [app/providers.tsx](app/providers.tsx) is valid; get new one at https://cloud.walletconnect.com if needed
  <parameter name="filePath">/home/tuansyho/Desktop/code ex nft/ex-nft/.github/copilot-instructions.md
