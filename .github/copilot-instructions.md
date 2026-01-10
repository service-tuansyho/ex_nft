# AI Coding Guidelines for ex-nft

## Project Overview

This is a Next.js 16 NFT exchange for the Optimism network, using the App Router, TypeScript, Tailwind CSS v4, Material-UI (MUI), Wagmi, RainbowKit, MongoDB (via Mongoose), and TanStack React Query. The project is structured for rapid Web3 development with strict conventions for theming, data, and blockchain integration.

## Architecture & Key Patterns

- **App Router**: All routing and pages are in `app/`. Use server components by default; use client components only for interactivity (e.g., Web3, theme toggling).
- **Styling**: Tailwind v4 with custom CSS variables in `app/globals.css`. Dark mode is toggled via a React context in `app/providers.tsx` and persisted in localStorage. Use `bg-background text-foreground` for theme consistency. See `app/layout.tsx` for font and backdrop blur setup.
- **UI**: Use MUI for complex UI. Prefer Tailwind for layout and color. Fonts are loaded in `app/layout.tsx` using Geist via CSS variables.
- **Web3**: Use RainbowKit's `ConnectButton` for wallet UI (see `components/Header.tsx`). Wagmi is configured for Optimism (native currency: OP) in `app/providers.tsx`. All contract logic should be wrapped in `'use client'` components.
- **Data Fetching**: Use TanStack React Query for all server state. QueryClient is set up in `app/providers.tsx`.
- **Database**: Use `lib/mongodb.ts` for MongoDB connection (with global caching for dev hot reloads). Define schemas with Mongoose. Store connection string in `.env.local` as `MONGODB_URI`.
- **Component Structure**: Pages in `app/`, shared UI in `components/`. Use dynamic imports in `ClientLayout.tsx` for SSR-unsafe components.

## Developer Workflow

- **Start dev server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint` (uses ESLint flat config)
- **Environment**: Add `.env.local` with `MONGODB_URI` for DB access

## Conventions & Examples

- Use TypeScript interfaces for all props and data
- Follow Next.js App Router conventions for file-based routing
- Maintain dark mode compatibility in all UI (see ThemeContext in `app/providers.tsx`)
- Use MUI for design system, Tailwind for layout/theming
- Web3 errors/loading: handle in client components
- MongoDB: cache connections globally (see `lib/mongodb.ts`)
- Backdrop blur: see `app/layout.tsx`

## Key Files

- `app/layout.tsx`, `app/globals.css`: Theming, fonts, backdrop
- `app/providers.tsx`: Theme context, Wagmi, RainbowKit, React Query setup
- `lib/mongodb.ts`: MongoDB connection logic
- `components/Header.tsx`: Wallet connect UI

## Dependencies

Next.js 16, React 19, Tailwind v4, MUI, Wagmi, Ethers, Viem, TanStack React Query, Mongoose, RainbowKit
<parameter name="filePath">/home/tuansyho/Desktop/code ex nft/ex-nft/.github/copilot-instructions.md
