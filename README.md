# SmartProduce Data Collector

An internal mobile-first web app for Keells supermarket staff to upload produce images for AI training data collection.

Built with **React + Vite**, **Supabase** (metadata storage), and **Cloudinary** (image storage). Deployable to Vercel in minutes.

---

## Features

- **Upload screen** — camera-first image capture, searchable produce dropdown, segment controls for presentation/angle, branch selector, per-session name memory
- **Dashboard** — live metrics, coverage bars per produce (target 1 000 images), recent uploads table, one-click CSV export
- Auto-refreshes every 30 seconds
- No authentication — trusted internal tool

---

## Environment Variables

Create a `.env` file in the project root (copy `.env.example`):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name |

---

## Supabase Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and copy your **Project URL** and **anon key** from **Settings → API**.

### 2. Create the `uploads` table

Open the **SQL Editor** in your Supabase dashboard and run:

```sql
create table uploads (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  item_name    text        not null,
  presentation text,
  angle        text,
  branch       text,
  notes        text,
  image_url    text,
  uploaded_by  text
);
```

### 3. Enable Row Level Security (optional but recommended)

```sql
alter table uploads enable row level security;

-- Allow all inserts (staff can upload)
create policy "Allow insert" on uploads
  for insert with check (true);

-- Allow all selects (dashboard reads)
create policy "Allow select" on uploads
  for select using (true);
```

---

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the dashboard, copy your **Cloud Name**.
3. Go to **Settings → Upload → Upload presets** and click **Add upload preset**.
4. Set **Signing Mode** to **Unsigned**.
5. Give it a name (e.g. `smartproduce_unsigned`) — this is your `VITE_CLOUDINARY_UPLOAD_PRESET`.
6. Optionally set a folder (e.g. `smartproduce/`) to keep uploads organised.
7. Save.

---

## Run Locally

```bash
# Clone or enter the project directory
cd smartproduce-collector

# Copy env template and fill in your credentials
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser (or scan the local network URL on your phone).

---

## Deploy to Vercel

1. Push the `smartproduce-collector` folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. In **Environment Variables**, add the four `VITE_*` variables from your `.env`.
4. Click **Deploy**.

Vercel auto-detects Vite. No build configuration needed.

> **Tip:** After deploying, open the URL on any phone browser — no app install required.

---

## Project Structure

```
src/
  components/
    UploadScreen.jsx   # Staff upload flow
    DashboardScreen.jsx # Admin metrics & table
  lib/
    supabase.js        # Supabase client
    cloudinary.js      # Image upload helper
  App.jsx              # App shell + bottom nav
  App.css              # All component styles
  index.css            # Global reset & CSS variables
  main.jsx             # Entry point
```
