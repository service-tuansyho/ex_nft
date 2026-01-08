# AI Coding Guidelines for ex-nft

## Project Overview

This is a Next.js 16 application for an NFT exchange on the Optimism network, using the App Router, TypeScript, Tailwind CSS v4, Material-UI (MUI), and MongoDB.

## Architecture

- **Framework**: Next.js 16 with App Router (`app/` directory)
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming, integrated with MUI
- **UI Library**: Material-UI for components
- **Blockchain**: Wagmi for Web3 interactions on Optimism
- **Database**: MongoDB with Mongoose for data storage
- **Data Fetching**: TanStack React Query for server state management
- **Language**: TypeScript with strict mode enabled
- **Linting**: ESLint with flat config and Next.js rules

## Key Patterns

### Styling and Theming

Use Tailwind CSS classes with custom CSS variables defined in `app/globals.css`. The project supports dark mode via `prefers-color-scheme` media query. MUI themes can be customized in `app/providers.tsx` or a separate theme file.

Example from `app/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

Apply classes like `bg-background text-foreground` for consistent theming. Use MUI components for complex UI elements.

### Font Usage

Leverage Geist fonts loaded in `app/layout.tsx` via CSS variables:

- `--font-geist-sans` for sans-serif
- `--font-geist-mono` for monospace

### Component Structure

Pages are in `app/` directory. Use server components by default, client components only when necessary (e.g., for Web3 interactions). Wrap Web3 logic in 'use client' components.

### Web3 Integration

Use RainbowKit for wallet connections and Wagmi for contract interactions on Optimism. Configured in `app/providers.tsx` with getDefaultConfig including a custom Optimism chain where native currency symbol is "OP" instead of "ETH". Set `projectId` from WalletConnect cloud.

Example:

```tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";
```

Use ConnectButton component for wallet UI, as in `app/page.tsx`.

### Data Fetching

Use TanStack React Query for caching and synchronizing server state. QueryClient is set up in `app/providers.tsx`.

### Database

Connect to MongoDB using `lib/mongodb.ts`. Use Mongoose models for data schemas. Connection includes caching for development hot reloads to prevent exponential connection growth.

### Development Workflow

- Start dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint` (uses ESLint flat config)

## Configuration Files

- `tsconfig.json`: Standard Next.js config with `"@/*": ["./*"]` path alias
- `eslint.config.mjs`: Flat config importing Next.js vitals and TypeScript rules
- `postcss.config.mjs`: Tailwind v4 PostCSS plugin
- `next.config.ts`: Empty, extend as needed
- `.env.local`: Add `MONGODB_URI` for database connection; update `projectId` in `app/providers.tsx` for WalletConnect

## Dependencies

Includes Next.js 16, React 19, Tailwind v4, MUI, Wagmi, Ethers, Viem, TanStack React Query, Mongoose, RainbowKit. Add more as needed.

## Conventions

- Use TypeScript interfaces for props and data structures
- Follow Next.js App Router conventions for file-based routing
- Maintain dark mode compatibility in all UI components
- Use MUI for consistent design system
- Handle Web3 errors and loading states appropriately
- Cache MongoDB connections globally to avoid issues in development</content>
  <parameter name="filePath">/home/tuansyho/Desktop/code ex nft/ex-nft/.github/copilot-instructions.md
