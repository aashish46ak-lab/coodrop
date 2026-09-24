# ShareTemp

**Share temporarily. Keep it simple.**

Temporary anonymous sharing for text, images, videos, and folders.  
Every share expires automatically (default 24 hours).

Live: [https://sharetemp.vercel.app](https://sharetemp.vercel.app)

## Features

- Share long text / code snippets
- Share images (JPG, PNG, WEBP, GIF)
- Share videos (MP4, WEBM, MOV, and more)
- Folder multi-share sessions
- Unique short codes:
  - **File:** `ST` + letter + 2 digits (e.g. `STa23`)
  - **Folder:** `SHR` + letter + 2 digits (e.g. `SHRa23`)
- Optional title + password
- Automatic expiration
- No accounts required
- Offline-aware UI, PWA install
- Client-side malware heuristics on upload

## Stack

- TanStack Start + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Storage)
- Vite

## Setup

### 1. Install

```bash
npm i
```

### 2. Environment

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Optional limits:

```env
VITE_MAX_TEXT_CHARS=500000
VITE_MAX_IMAGE_MB=25
VITE_MAX_VIDEO_MB=200
```

### 3. Supabase

1. Create a Supabase project
2. Run the migrations in `supabase/migrations/` (SQL Editor or CLI)
3. Create a **private** storage bucket named `drops`
4. Allow anon uploads to that bucket

**Important:** Run the latest migration `20260924200000_sharetemp_ids.sql` so new shares get `ST*` / `SHR*` codes. Legacy `CO*` / `COD*` links still resolve.

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy

Deploy to Vercel. Domain: **sharetemp.vercel.app**  
Add the same environment variables in project settings.

## How it works

1. **Share** — text, image, video, or multiple files in a folder  
2. **Get a code** — short temporary code is generated  
3. **Send the code** — anyone can open it  
4. After expiry the content is no longer accessible

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage — share + search |
| `/drop/:code` | View a shared file |
| `/batch/:code` | View a folder session |
| `/privacy` | Privacy |
| `/terms` | Terms |

## License

MIT
