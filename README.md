# CODrop

**Share anything. Get a code.**

Temporary anonymous sharing for text, images, and videos.  
Every drop expires after 24 hours.

## Features

- Share long text / code snippets
- Share images (JPG, PNG, WEBP, GIF)
- Share videos (MP4, WEBM, MOV, and more)
- Unique short codes (`COf26` style)
- 24-hour automatic expiration (enforced in database)
- No accounts required
- Copy and download support
- Modern minimal UI

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
2. Run the migration in `supabase/migrations/` (SQL Editor or CLI)
3. Create a **private** storage bucket named `drops`
4. Allow anon uploads to that bucket

Code format: `CO` + one letter + two digits  
Examples: `COf26`, `COr45`, `COx81`

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy

Deploy to Vercel (or any host that supports Vite / TanStack Start).  
Add the same environment variables in project settings.

## How it works

1. **Drop** — share text, image, or video  
2. **Get a code** — unique temporary code is generated  
3. **Share** — send the code to anyone  
4. After 24 hours the drop is no longer accessible

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage — share + search |
| `/drop/:code` | View a shared drop |
| `/privacy` | Privacy |
| `/terms` | Terms |

## License

MIT
