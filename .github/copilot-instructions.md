# AI Coding Guidelines for ex-nft

## Project Overview

Next.js 16 NFT marketplace on Optimism with Web3 wallet integration (RainbowKit/Wagmi 2.x), MongoDB/Mongoose persistence, and ERC-721 smart contract minting. Stack: React 19 + Tailwind v4 + MUI (frontend), Next.js 16 API routes (backend), Solidity + Hardhat (contracts), MongoDB (database).

## Critical Architecture: Mint Flow

**Five-Step End-to-End Process** (see [components/MintModal.tsx](components/MintModal.tsx) for implementation):

1. **Image Upload** → POST to `/api/upload` (FormData) → Cloudinary streams to Buffer → returns `{ success: true, url: result.secure_url }`
2. **Metadata Upload** → POST to `/api/metadata` (JSON) → Cloudinary raw file → returns `{ success: true, data: { url: metadata_json_url } }`
3. **On-Chain Mint** → `useWriteContract` calls `ExNFT.mint(userAddress, metadataJsonUrl)` → contract auto-increments tokenId, emits Transfer event
4. **Transaction Confirmation** → `useWaitForTransactionReceipt` waits for receipt → **parse tokenId from Transfer event logs** (topic3: `BigInt(log.topics[3]).toString()`)
5. **Database Persistence** → POST to `/api/nfts` with `{ tokenId, contractAddress, owner (lowercased), name, description, image, price, listed }` → returns stored NFT doc

**Data Flow Glue**: MintModal orchestrates entire flow using React Query `useMutation` for each step. Crucially: tokenId is extracted from transaction logs (not relied upon from contract return value which Next.js/Viem may not capture).

**Key Integration Points**:
- **Blockchain→DB**: Transfer event logs → tokenId parsing → DB record creation
- **File Storage→Metadata**: Cloudinary URLs become `tokenURI` parameter in contract call
- **DB→API**: `/api/nfts` GET filters by `owner` (lowercased); POST upserts/creates NFT records

## Core Conventions

**React & Styling**:
- **"use client" Boundary**: Only components with Web3 hooks (Wagmi, RainbowKit), theme context, or interactive dialogs declare `"use client"`. Pages default to server components.
- **Theme Sync**: Tailwind v4 + MUI. Dark/light theme toggled via `ThemeContext` in [app/providers.tsx](app/providers.tsx). **Critical**: must set BOTH `document.documentElement.classList.add('dark')` AND pass `theme` prop to RainbowKit. CSS variables alone won't sync RainbowKit UI. localStorage stores preference for next session.

**Web3 Stack** (Wagmi 2.x + RainbowKit):
- Custom Optimism chain defined in [app/providers.tsx](app/providers.tsx): `{ ...optimism, nativeCurrency: { ...optimism.nativeCurrency, symbol: "ETH" } }` (ETH symbol matches Optimism's native token naming)
- RainbowKit `ConnectButton.Custom` in [components/Header.tsx](components/Header.tsx) for wallet UI
- WalletConnect projectId: `600ff3ccff8155148627a3e3d0690701` (https://cloud.walletconnect.com)
- Hooks used: `useAccount()` (connection state), `useWriteContract()` (send tx), `useWaitForTransactionReceipt()` (await confirmation)

**Smart Contract** (`ExNFT` at `0x9d22CB31D2fa8569DAB0C78992459711bc0d8884` on Optimism):
- `mint(address to, string tokenURI)` payable function; reverts if `msg.value < mintFee` (default 0)
- Auto-increments tokenId via `_nextTokenId`; emits standard ERC721 Transfer event
- Owner can adjust fee via `setMintFee(uint256)`
- Returns tokenId, but logs contain authoritative tokenId in Transfer event topic3

**API Patterns**:
- All routes return `{ success: boolean, data?: T, error?: string }` JSON
- **Always `await dbConnect()` first in route handlers** (connects to MongoDB)
- Address fields **must be lowercased** (`.toLowerCase()`) before DB operations to prevent mixed-case duplicates
- `/api/upload` returns `{ success: true, url: cloudinary_secure_url }`
- `/api/metadata` returns `{ success: true, data: { url: cloudinary_metadata_url } }`
- `/api/nfts` GET requires `owner` query param (lowercased); POST validates tokenId/contractAddress/owner/name/image

**Async State Management**:
- React Query `@tanstack/react-query` for all mutations/queries
- `QueryClient` initialized in [app/providers.tsx](app/providers.tsx)
- Use `useMutation({ mutationFn, onSuccess, onError })` for write operations
- Reset mutations on modal close to prevent stale state

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

- **MongoDB connection spam during dev**: Global singleton in [lib/mongodb.ts](lib/mongodb.ts) is **intentional** — caches connections across hot-reloads to prevent exponential connection growth. Not a leak.
- **Theme not persisting**: Must set BOTH `document.documentElement.classList.add('dark')` AND pass theme prop to RainbowKit. CSS variables alone won't sync RainbowKit UI. localStorage also stores preference for next session.
- **Mint fails silently**: If `useWriteContract` doesn't fire, check: (1) `msg.value >= mintFee` (defaults to 0), (2) user has sufficient gas (~100k), (3) address is valid ERC-721 recipient, (4) contract is deployed to correct Optimism address
- **Transaction receipt undefined**: `useWaitForTransactionReceipt` will hang if `hash` is undefined. Always guard: `if (!hash) return`. Hash is undefined if `writeContract` failed.
- **TokenId extraction fails**: Transfer event signature must match exactly. Use topic0 `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef` and extract tokenId from `topics[3]` (3rd indexed parameter). See [components/MintModal.tsx#L96](components/MintModal.tsx#L96) for `parseTokenIdFromLogs()` implementation.
- **Image upload fails**: Ensure file is `File` object (not string). `/api/upload` converts to Buffer via `arrayBuffer()`. MIME type must start with `image/`. Verify Cloudinary env vars in `.env.local`.
- **Mixed-case address duplicates in DB**: All addresses from user input must use `.toLowerCase()` before DB operations. Check both GET query params and POST request bodies.
- **RainbowKit wallet list empty**: Verify WalletConnect projectId in [app/providers.tsx](app/providers.tsx) is valid and active. Get new projectId at https://cloud.walletconnect.com if needed.
  <parameter name="filePath">/home/tuansyho/Desktop/code ex nft/ex-nft/.github/copilot-instructions.md
