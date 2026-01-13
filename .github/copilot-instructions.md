# AI Coding Guidelines for ex-nft

## Project Overview

This is a Next.js 16 NFT exchange for the Optimism network, using the App Router, TypeScript, Tailwind CSS v4, Material-UI (MUI), Wagmi, RainbowKit, MongoDB (via Mongoose), and TanStack React Query. The project is structured for rapid Web3 development with strict conventions for theming, data, and blockchain integration.

## Architecture & Key Patterns

- **App Router**: All routing and pages are in `app/`. Use server components by default; use client components only for interactivity (e.g., Web3, theme toggling).
- **Styling**: Tailwind v4 with custom CSS variables in `app/globals.css`. Dark mode is toggled via a React context in `app/providers.tsx` and persisted in localStorage. Use `bg-background text-foreground` for theme consistency. See `app/layout.tsx` for font and backdrop blur setup.
- **UI**: Use MUI for complex UI. Prefer Tailwind for layout and color. Fonts are loaded in `app/layout.tsx` using Geist via CSS variables.
- **Web3**: Use RainbowKit's `ConnectButton` for wallet UI (see `components/Header.tsx`). Wagmi is configured for Optimism (native currency: OP) in `app/providers.tsx`. All contract logic should be wrapped in `'use client'` components.
- **Data Fetching**: Use TanStack React Query for all server state. QueryClient is set up in `app/providers.tsx`.
- **Database**: Use `lib/mongodb.ts` for MongoDB connection (with global caching for dev hot reloads). Define schemas with Mongoose in `lib/models.ts`. Store connection string in `.env.local` as `MONGODB_URI`.
- **Component Structure**: Pages in `app/`, shared UI in `components/`. Use dynamic imports in `ClientLayout.tsx` for SSR-unsafe components.
- **NFT Minting Flow**: On wallet connect, auto-create user in DB via `/api/users`. Mint NFTs on Optimism chain with user-paid fees, then save metadata to DB via `/api/nfts` and images to Cloudinary via `/api/upload`.
- **Contract Deployment**: Use Hardhat to deploy `contracts/ExNFT.sol` to Optimism. Update contract address in `app/profile/page.tsx`. Requires `PRIVATE_KEY` in `.env.local`.

## Developer Workflow

- **Start dev server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint` (uses ESLint flat config)
- **Deploy contract**: `npx hardhat run scripts/deploy.js --network optimism` (after setting up Hardhat config and env vars)
- **Environment**: Add `.env.local` with `MONGODB_URI`, `PRIVATE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Conventions & Examples

- Use TypeScript interfaces for all props and data
- Follow Next.js App Router conventions for file-based routing
- Maintain dark mode compatibility in all UI (see ThemeContext in `app/providers.tsx`)
- Use MUI for design system, Tailwind for layout/theming
- Web3 errors/loading: handle in client components
- Use Mongoose models from `lib/models.ts` for data operations (e.g., User, NFT, Transaction)
- User creation: Automatically create user in DB when wallet connects (see `app/profile/page.tsx`)
- NFT creation: Mint NFTs on Optimism chain with user-paid fees (see `app/profile/page.tsx`, `contracts/ExNFT.sol`)
- Backdrop blur: see `app/layout.tsx`

## Key Files

- `app/layout.tsx`, `app/globals.css`: Theming, fonts, backdrop
- `app/providers.tsx`: Theme context, Wagmi, RainbowKit, React Query setup
- `lib/mongodb.ts`: MongoDB connection logic
- `lib/models.ts`: Mongoose schemas and models (User, NFT, Transaction)
- `components/Header.tsx`: Wallet connect UI
- `contracts/ExNFT.sol`: NFT smart contract for Optimism
- `app/api/users/route.ts`, `app/api/nfts/route.ts`, `app/api/upload/route.ts`: API routes for user/NFT management and image upload

## Dependencies

Next.js 16, React 19, Tailwind v4, MUI, Wagmi, Ethers, Viem, TanStack React Query, Mongoose, RainbowKit, Cloudinary, Hardhat
<parameter name="filePath">/home/tuansyho/Desktop/code ex nft/ex-nft/.github/copilot-instructions.md
