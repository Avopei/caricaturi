# PortraitLab Studio

A full-stack image processing web application for generating caricatures, removing backgrounds, and creating AI age progression portraits.

This project was built as a personal full-stack portfolio project to explore AI-assisted image workflows, authentication, storage, and SaaS-style product architecture.

## Features

- User authentication
- Live camera capture
- Image upload
- AI-assisted caricature generation
- Multiple caricature styles
- Background removal using remove.bg
- AI aging provider workflow
- Generation history
- Fullscreen image viewer
- Feedback system
- Protected image downloads
- Admin-ready structure

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- OpenAI Image API
- Replicate aging provider
- remove.bg API

## Architecture Overview

```text
User -> Next.js UI -> API Routes -> Supabase Auth/DB/Storage -> External image providers
```

PortraitLab Studio uses the Next.js App Router for the application UI and route handlers, Supabase for authentication, database records, and file storage, and external image providers for caricature generation, AI aging, and background removal. The legacy browser aging preview remains available only as a collapsed local fallback.

## Environment Variables

Create a local `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
REMOVE_BG_API_KEY=
AGING_PROVIDER=replicate
REPLICATE_API_TOKEN=
REPLICATE_AGING_MODEL=yuval-alaluf/sam
DEMO_MODE=false
PRO_IMAGE_PROVIDER=openai
```

API keys are stored in `.env.local` and should never be committed.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

## Replicate Aging Setup

1. Create a Replicate account.
2. Get an API token.
3. Set `AGING_PROVIDER=replicate`.
4. Set `REPLICATE_API_TOKEN`.
5. Optionally set `REPLICATE_AGING_MODEL`.
6. Run `npm run dev`.
7. Open `/dashboard/aging`.

The Replicate provider is isolated in `lib/aging-ai/replicate-provider.ts` so the exact model input schema can be adjusted in one place when switching models. Replicate output URLs are temporary; the provider includes a TODO for future Supabase Storage persistence.

Build the project:

```bash
npm run build
```

## Status

MVP / personal portfolio project.

## What I Learned

- Full-stack architecture
- Auth and protected routes
- File upload and storage
- AI/image API integration
- Image preview and download flows
- UI state management
- Admin/data review structure
