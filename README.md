# PortraitLab Studio

A full-stack image processing web application for generating caricatures, removing backgrounds, and creating artistic aging previews.

This project was built as a personal full-stack portfolio project to explore AI-assisted image workflows, authentication, storage, and SaaS-style product architecture.

## Features

- User authentication
- Live camera capture
- Image upload
- AI-assisted caricature generation
- Multiple caricature styles
- Background removal using remove.bg
- Browser-based aging preview
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
- remove.bg API

## Architecture Overview

```text
User -> Next.js UI -> API Routes -> Supabase Auth/DB/Storage -> External image providers
```

PortraitLab Studio uses the Next.js App Router for the application UI and route handlers, Supabase for authentication, database records, and file storage, and external image providers for caricature generation and background removal. The aging preview runs in the browser as a fast canvas-based visual effect.

## Environment Variables

Create a local `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
REMOVE_BG_API_KEY=
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
