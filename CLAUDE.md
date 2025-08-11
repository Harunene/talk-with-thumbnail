# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Talk with Thumbnail is a Next.js 15 application that generates customizable thumbnail images with speech bubbles and character images for social media sharing. It uses Vercel's OG image generation to create OpenGraph images on-the-fly.

## Development Commands

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Migrate blob storage (if needed)
bun scripts/migrate-blobs.js
```

## Architecture Overview

### Tech Stack
- **Next.js 15.3.1** with App Router
- **React 19.1.0** with TypeScript
- **Tailwind CSS** with shadcn/ui components
- **Vercel Services**: Blob storage for messages, OG image generation
- **Edge Runtime** for image generation APIs

### Key Directories
- `app/` - Next.js App Router structure
  - `[id]/` - Dynamic routes for shared messages
  - `api/message/` - Message storage/retrieval endpoints
  - `api/og/` - OpenGraph image generation endpoints
- `components/` - React components with character-specific preview renderers
- `public/` - Static assets (fonts, character images)

### Data Flow
1. User creates message with character selection → 
2. Message stored in Vercel Blob (hash-based ID) → 
3. Share URL generated (`/[id]`) → 
4. OG image dynamically generated when accessed

### Storage Pattern
Messages are stored in Vercel Blob storage as JSON files with content-addressable hash IDs (first 8 chars of SHA-256). Same content generates the same ID for deduplication.

## Character System

The app supports multiple character types with different rendering engines:

- **BlueArchive** (`BlueArchivePreview`): Hikari (18 expressions), Nozomi (21 expressions)
- **Sans** (`SansPreview`): Undertale-style with custom Determination font
- **Plain** (`PlainPreview`): Default static character images

Character selection is handled through `ImageType` and `subType` parameters, with specific preview components for each type.

## API Endpoints

- `POST /api/message` - Store new message with metadata
- `GET /api/message/[id]` - Retrieve message by ID
- `GET /api/og/[message]` - Generate OG image with parameters:
  - `type`: Character type
  - `subType`: Character expression/variant
  - `zoom`: Enable zoom mode

## Component Patterns

Preview components follow a delegation pattern:
- Main `Preview` component determines which renderer to use
- Character-specific components handle unique rendering logic
- All use consistent props interface for message, type, and zoom settings

## Performance Considerations

- Preview updates are throttled (500ms) using custom `useThrottle` hook
- OG images are cached for 1 hour at edge
- Images in preview use `unoptimized` prop for real-time updates
- Static assets (fonts, images) served from public directory

## Testing Approach

No test framework is currently configured. When adding tests, consider setting up Jest or Vitest with React Testing Library for component testing.