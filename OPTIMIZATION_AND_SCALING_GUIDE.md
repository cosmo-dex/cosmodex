# CosmoDex Performance Optimization & Vercel CPU Scaling Guide

This guide details the exact root causes of Vercel CPU/compute quota exhaustion, project and bundle bloat, and provides the step-by-step roadmap to scale CosmoDex efficiently.

---

## 📊 Summary of Immediate Optimizations Applied

| Optimization | Before | After | Improvement |
| :--- | :--- | :--- | :--- |
| **`public/images/logo.png`** | 1,386,127 bytes (1.38 MB) | **17,846 bytes (17.8 KB)** | **98.7% reduction** |
| **`public/images/mascot-transparent.gif`** | 12,122,930 bytes (12.1 MB) | **1,939,142 bytes (1.93 MB)** | **84.0% reduction** |
| **`public/images/mascot-transparent.webp`** | *Did not exist* | **2,011,710 bytes (2.01 MB)** | Crisp WebP animation |
| **`public/images/mascot.png`** | 479,187 bytes (479 KB) | **42,455 bytes (42.4 KB)** | **91.1% reduction** |
| **`public/logo.png`** | 360,441 bytes (360 KB) | **49,652 bytes (49.6 KB)** | **86.2% reduction** |
| **`public/certificates/base_template.png`** | 773,788 bytes (773 KB) | **565,862 bytes (565 KB)** | **26.9% reduction** |
| **Total `public/` Directory Size** | **20,023,450 bytes (~20 MB)** | **9,575,010 bytes (~9.5 MB)** | **>52% total reduction** |
| **Prisma Global Caching** | Reconnected on every serverless lambda in production | Cached globally across warm lambdas | Eliminates connection churn |
| **Next.js Package Optimization** | Unchecked import bundling | `optimizePackageImports` for `lucide-react` & `framer-motion` | Shrinks JS bundle chunks |

---

## 🧠 Part 1: Solving "Vercel CPU is Full" (Serverless Compute / Fast Compute)

On Vercel, "CPU full" refers to **Serverless Execution Time / Fast Compute (GB-hours)**. When a serverless function runs continuously or is called too frequently, the monthly quota gets depleted rapidly.

### 1. Disable the Notification SSE Stream (Highest CPU Priority)
* **File:** `src/app/api/notifications/stream/route.ts` & `src/context/NotificationContext.tsx`
* **Root Cause:** The route opens a continuous `ReadableStream` with an active `setInterval` heartbeat running on `runtime = 'nodejs'`. Each user tab keeps a Vercel serverless lambda running for the full connection duration. When Vercel terminates the connection after 15–30s, the browser's `EventSource` automatically reconnects in an infinite loop. Furthermore, in-memory `notificationEmitter` does not share state across serverless lambdas.
* **Fix:**
  1. Remove `/api/notifications/stream/route.ts`.
  2. In `NotificationContext.tsx`, replace the SSE `EventSource` with a window-focus or tab-visible poll (e.g. fetch on page focus, or once every 60 seconds):
  ```typescript
  // Poll only when user is active and tab is visible
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications();
      }
    }, 60000); // 1 minute interval

    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, fetchNotifications]);
  ```

---

### 2. Fix Prisma Client Global Caching in Serverless Functions
* **File:** `src/lib/prisma.ts`
* **Status:** **Completed**
* **Root Cause:** `if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;` prevented caching in production. Every invocation initialized a new `PrismaClient`, causing database connection exhaustion and inflating request duration.
* **Current Implementation:**
  ```typescript
  export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });

  globalForPrisma.prisma = prisma;
  ```

---

### 3. Tame Aggressive Matchmaking & Stats Polling
* **File:** `src/components/battle/MatchmakingPanel.tsx`
* **Root Cause:**
  - Leaderboard is fetched every 5 seconds (`setInterval(fetchLeaderboard, 5000)`).
  - Stats are fetched every 10 seconds (`setInterval(fetchStats, 10000)`).
  - Generates 18 database queries per minute per connected user even when the user is idle.
* **Fix:**
  - Pause intervals when `document.hidden` is true.
  - Increase intervals to 30–60s when not actively in the matchmaking queue:
  ```typescript
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && isSearching) {
        fetchStats();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isSearching]);
  ```

---

### 4. Add Edge CDN Caching Headers to Read-Only GET APIs
* **Targets:** `/api/battle/leaderboard`, `/api/blogs`, `/api/events`, course summaries.
* **Why:** Without cache headers, every client visit spins up a serverless function and queries PostgreSQL.
* **Fix:** Return `Cache-Control` response headers:
  ```typescript
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
  ```
  Vercel's Edge CDN will serve responses directly to users without executing serverless functions or contacting the database.

---

### 5. Restrict Unbounded Vercel Image Optimization
* **File:** `next.config.ts`
* **Root Cause:** `remotePatterns: [{ protocol: 'https', hostname: '**' }]` allows any external domain to invoke Vercel image optimization compute.
* **Fix:** Restrict `hostname` to trusted domains:
  ```typescript
  remotePatterns: [
    { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google Avatars
    { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, // GitHub Avatars
    { protocol: 'https', hostname: '*.supabase.co' }, // Supabase Storage
  ],
  ```

---

## 📦 Part 2: Project Size & Bundle Optimization

### 1. Image & Asset Compression
* **Status:** **Completed**
* Mascot GIF compressed from 12.1MB to 1.93MB with WebP alternative.
* Logo and avatar PNGs quantized to 8-bit adaptive palettes, saving over 10 MB.
* `WelcomeBanner.tsx` updated to serve `<picture>` with WebP support.

---

### 2. Remove Duplicate & Unused Dependencies
* **File:** `package.json`
* **Duplicate Libraries Detected:**
  - `"framer-motion": "^12.40.0"` vs `"motion": "^12.40.0"`: `motion` is Framer Motion v12. Keep only `framer-motion` or migrate imports to `motion` and remove the other.
  - `"@dotlottie/react-player": "^1.6.19"` vs `"lottie-react": "^2.4.1"`: Consolidate on one Lottie runtime.
  - `"nodemailer": "^6.9.16"` & `"@types/nodemailer"`: Can be safely removed if contact/support forms are handled via API or simulated.

---

### 3. Dynamically Load Heavy Libraries (Monaco Editor)
* **Files:**
  - `src/components/events/EventContestArena.tsx`
  - `src/components/battle/ActiveMatchView.tsx`
* **Root Cause:** `import Editor from '@monaco-editor/react'` loads the multi-megabyte Monaco editor in the main JavaScript chunk.
* **Fix:** Use Next.js dynamic imports:
  ```typescript
  import dynamic from 'next/dynamic';

  const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#0d0915] text-white/50 text-sm">
        Loading Code Editor...
      </div>
    ),
  });
  ```

---

### 4. Enable Package Import Optimization
* **File:** `next.config.ts`
* **Status:** **Completed**
* Enables automatic tree-shaking for `lucide-react` (1,500+ icons) and `framer-motion`.

---

## 🚀 Execution Checklist

- [x] Compress mascot animated GIF & PNG assets (saved >10.4 MB, cut public/ size by >52%).
- [x] Create animated WebP version for modern browser support.
- [x] Configure `<picture>` responsive loading in `WelcomeBanner.tsx`.
- [x] Enable `optimizePackageImports` (`lucide-react`, `framer-motion`, `@monaco-editor/react`) in `next.config.ts`.
- [x] Enable persistent `PrismaClient` global caching in `src/lib/prisma.ts`.
- [x] Replace `notifications/stream/route.ts` CPU-draining SSE loop with tab-visible focus & interval polling in `NotificationContext.tsx`.
- [x] Throttle background polling intervals in `MatchmakingPanel.tsx` (paused when tab is hidden, 20s/30s intervals).
- [x] Add Edge CDN caching headers (`Cache-Control: public, s-maxage=...`) to `/api/battle/leaderboard` and `/api/blogs`.
- [x] Dynamically import heavy `@monaco-editor/react` in `EventContestArena.tsx` and `ActiveMatchView.tsx`.
- [x] Remove unused `lottie-react`, `@dotlottie/react-player`, and `nodemailer` dependencies from `package.json`.
