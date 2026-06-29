# ☁️ MediaHub — Video & Image Management Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary)

**A production-ready media management platform built with Next.js 15 App Router.**
Upload, transform, trim, and share videos and images — all powered by Cloudinary.

</div>

---

## ✨ Features at a Glance

| 🎯 Feature | 📝 Description |
|---|---|
| 🔐 **Auth** | Full sign-up / sign-in flow via Clerk |
| 🎬 **Video Upload** | Upload videos up to 60 MB with title & description |
| ✂️ **Video Trim** | Interactive drag-based timeline editor to clip videos |
| 🖼️ **Social Image Creator** | Crop & export images for Instagram, Twitter, Facebook & more |
| 🗂️ **Video Gallery** | Browse all uploads with hover-preview, stats & download |
| 📦 **Auto Compression** | Cloudinary auto-compresses to MP4 on upload |
| 📊 **Size Analytics** | See original vs compressed size + compression % per video |

---

## 🛠️ Tech Stack

### 🎨 Frontend
- **[Next.js 15](https://nextjs.org/)** — App Router + Turbopack
- **[TypeScript](https://www.typescriptlang.org/)** — Full type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** + **[DaisyUI v5](https://daisyui.com/)** — Styling & components
- **[Lucide React](https://lucide.dev/)** — Icon library
- **[react-hot-toast](https://react-hot-toast.com/)** — Toast notifications
- **[Day.js](https://day.js.org/)** — Relative timestamps
- **[filesize](https://filesizejs.com/)** — Human-readable file sizes

### ⚙️ Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** — Serverless endpoints
- **[Prisma 6](https://www.prisma.io/)** — Type-safe ORM
- **[PostgreSQL](https://www.postgresql.org/)** — Relational database
- **[Cloudinary SDK v2](https://cloudinary.com/documentation/node_integration)** — Media storage & transformations
- **[next-cloudinary](https://next.cloudinary.dev/)** — React components for Cloudinary

### 🔒 Auth & Security
- **[Clerk](https://clerk.com/)** — Authentication & session management
- **Middleware-based route protection** — Guard all sensitive pages & APIs

---

## 📁 Project Structure

```
cloudinary-saas/
│
├── 📂 app/
│   ├── 📂 (app)/                     # 🔒 Protected routes
│   │   ├── layout.tsx                # Sidebar + navbar shell
│   │   ├── home/page.tsx             # 🎬 Video gallery
│   │   ├── social-share/page.tsx     # 🖼️  Image crop & share tool
│   │   ├── video-upload/page.tsx     # ⬆️  Quick upload (no trim)
│   │   └── video-edit/page.tsx       # ✂️  Upload + trim workflow
│   │
│   ├── 📂 (auth)/                    # 🌐 Public auth routes
│   │   ├── sign-in/[[...sign-in]]/
│   │   └── sign-up/[[...sign-up]]/
│   │
│   ├── 📂 api/
│   │   ├── image-upload/route.ts     # POST — upload image
│   │   ├── video-upload/route.ts     # POST — upload video + save to DB
│   │   ├── video-trim/route.ts       # POST — trim video + save to DB
│   │   └── videos/route.ts           # GET  — fetch all videos
│   │
│   ├── globals.css
│   ├── layout.tsx                    # Root layout (ClerkProvider)
│   └── page.tsx                      # Root page / public gallery
│
├── 📂 components/
│   ├── VideoCard.tsx                 # 🃏 Video card with preview & stats
│   └── VideoTrimmer.tsx              # 🎚️  Interactive trim timeline
│
├── 📂 prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── 📂 types/
│   └── index.ts                      # Shared Video interface
│
├── middleware.ts                     # 🛡️  Clerk auth middleware
└── public/
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following:

- **Node.js** ≥ 18.18
- **PostgreSQL** (local or hosted — [Supabase](https://supabase.com) / [Neon](https://neon.tech) work great)
- **[Cloudinary account](https://cloudinary.com/)** (free tier is enough to get started)
- **[Clerk account](https://clerk.com/)** (free tier available)

### 📦 Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd cloudinary-saas

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env

# 4. Set up the database
npx prisma migrate dev --name init
npx prisma generate

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 🔑 Environment Variables

Create a `.env` file in the root of your project and fill in the following:

```env
# ─────────────────────────────────────────
# 🔐 Clerk Authentication
# ─────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home

# ─────────────────────────────────────────
# ☁️  Cloudinary
# ─────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Used server-side only (API routes)
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─────────────────────────────────────────
# 🗄️  PostgreSQL Database
# ─────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

> ⚠️ **Important:** Never commit your `.env` file. It's already listed in `.gitignore`.

---

## 🗄️ Database Setup

This project uses **Prisma** with **PostgreSQL**.

```bash
# Apply migrations to your database
npx prisma migrate dev --name init

# Regenerate the Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

### 📐 Schema

```prisma
model Video {
  id             String   @id @default(uuid())
  title          String
  description    String?
  publicId       String               // Cloudinary public ID
  originalSize   String               // Raw upload size (bytes as string)
  compressedSize String               // Post-Cloudinary size (bytes as string)
  duration       String?              // Video duration in seconds
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## 🗺️ Pages & Routes

| 🔗 Route | 🔒 Access | 📄 Description |
|---|---|---|
| `/` | 🌐 Public | Landing page / public video gallery |
| `/sign-in` | 🌐 Public | Clerk sign-in page |
| `/sign-up` | 🌐 Public | Clerk sign-up page |
| `/home` | 🌐 Public | Video gallery (browseable without login) |
| `/social-share` | 🔒 Protected | Image format converter & downloader |
| `/video-upload` | 🔒 Protected | Quick video upload (no trimming) |
| `/video-edit` | 🔒 Protected | Upload then trim workflow |

---

## 📡 API Reference

### `POST /api/image-upload`
> 🖼️ Upload an image to Cloudinary

- **Body:** `multipart/form-data` → `file: File`
- **Returns:** `{ publicId: string }`
- **Auth:** Required

---

### `POST /api/video-upload`
> 🎬 Upload a video and save metadata to DB

- **Body:** `multipart/form-data` → `file`, `title`, `description`, `originalSize`
- **Returns:** Full `Video` object from the database
- **Auth:** Required
- **Limit:** 60 MB max file size

---

### `POST /api/video-trim`
> ✂️ Trim an existing video and save it as a new record

- **Body:** `application/json`
  ```json
  {
    "publicId": "video-uploads/abc123",
    "startTime": 5.0,
    "endTime": 30.0,
    "title": "My Trimmed Clip",
    "description": "Optional description"
  }
  ```
- **Returns:** New `Video` object for the trimmed version
- **Auth:** Required

---

### `GET /api/videos`
> 📋 Fetch all uploaded videos

- **Returns:** `Video[]` sorted by `createdAt` descending
- **Auth:** Not required (public endpoint)

---

## 🧩 Key Components

### 🃏 `VideoCard`

A rich media card that displays a single video with:

- 🖼️ **Static thumbnail** — Generated via Cloudinary's image API (`assetType: "video"`, `crop: "fill"`, `gravity: "auto"`)
- ▶️ **Hover preview** — 15-second autoplay loop using Cloudinary's `e_preview` transformation
- ⏱️ **Duration badge** — Formatted `m:ss` overlay on the thumbnail
- 📊 **File size comparison** — Original vs compressed sizes with compression % badge
- ⬇️ **Download button** — Fetches full-resolution `1920×1080` video from Cloudinary

---

### 🎚️ `VideoTrimmer`

An interactive video trimming timeline built with vanilla React:

- 🖱️ **Drag handles** — Move the green start/end markers to define your clip window
- 🔵 **Playhead scrubbing** — Drag the accent-colored playhead for precise frame seeking
- ⏸️ **Trim-aware playback** — Play/pause respects boundaries; auto-pauses at end point
- ⏰ **Live time display** — Shows `Start`, `Current`, `End`, and selected `Duration` in real time
- ✅ **Confirm trim** — Calls `onTrim(startTime, endTime)` to trigger the API call

---

## 🛡️ Authentication & Middleware

`middleware.ts` enforces the following rules using `clerkMiddleware`:

```
✅ Logged in  + visiting public route (not /home)  →  redirect to /home
🚫 Not logged in + visiting protected page          →  redirect to /sign-in?redirect_url=...
🚫 Not logged in + hitting protected API            →  redirect to /sign-in
🌐 /api/videos                                      →  always public, no auth needed
```

---

## 📜 Scripts

| 🏃 Command | 📝 Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npx prisma migrate dev` | Create & apply a new migration |
| `npx prisma generate` | Regenerate the Prisma client |
| `npx prisma studio` | Open the visual database browser |
| `npx prisma migrate deploy` | Apply migrations in production |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to **GitHub**
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables under **Settings → Environment Variables**
4. Run `npx prisma migrate deploy` against your production DB before the first deploy

```bash
# Production build test locally
npm run build && npm run start
```

> 💡 **Tip:** Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for a free serverless PostgreSQL database that pairs perfectly with Vercel deployments.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

<div align="center">

Made with ❤️ using **Next.js**, **Cloudinary**, and **Prisma**

⭐ Star this repo if you found it helpful!

</div>
