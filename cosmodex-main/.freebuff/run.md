# CosmoDeX — Preview Run Doc

Next.js 16 (App Router) project, package manager: **pnpm**.

**Project root is the `cosmodex-main` SUBFOLDER** inside the thread workspace
(e.g. `C:\Users\Lenovo\Downloads\cosmodex-main222\cosmodex-main`). The thread
workspace parent holds `.freebuff/` (run doc, logs) — it is NOT the app root.

## Reproduce the uncommitted artifacts a fresh checkout needs

- This checkout has **no `.env.local`** (only `.env.example`). The public pages
  (`/learn`, `/landing`) render fine without it. DB-backed routes (dashboard,
  events, battle) will error at request time without a running PostgreSQL —
  expected, not a server failure.
- If a real environment is required, copy it from the main checkout (never
  symlink, and adapt any port values for this worktree):
  `cp <main-checkout>/.env.local .env.local`
- Install dependencies (runs `prisma generate` via postinstall):
  `pnpm install`

## Route protection (Next 16 proxy)

Next.js 16 renamed `middleware.ts` → `proxy.ts`. Route guards live in
**`src/proxy.ts`** (NOT the project root — Turbopack skips root-level
`middleware.ts`/`proxy.ts` files here; `src/` is the working location).
`next.config.ts` also pins `turbopack.root` to the project dir so root-level
files are discovered and the workspace-root inference warning is silenced.

If route guards stop applying (protected routes like `/leaderboard` render for
logged-out users), check `src/proxy.ts` exists and that the dev server was
restarted after changing it. After moving proxy files, delete `.next` and
restart to avoid stale compiled paths.

## Run the server

The harness may leak a `PORT` env var (e.g. 52544) into commands — always pin
the port explicitly. **Prefer port 3000** if free.

`pnpm run dev` works in the foreground, but the `pnpm.cmd` shim dies when
launched detached. The verified detached launch (Windows PowerShell):

```
powershell -NoProfile -ExecutionPolicy Bypass -File "<workspace>\.freebuff\start-preview.ps1"
```

`start-preview.ps1` does (stdout and stderr to DIFFERENT files):

```powershell
$env:PORT = '3000'
$root = '<project-root>'   # the cosmodex-main subfolder
$log  = '<workspace>\.freebuff\preview-<id>.log'
$err  = $log + '.err'
$p = Start-Process -FilePath 'node.exe' `
  -ArgumentList 'node_modules/next/dist/bin/next','dev','-p','3000' `
  -WorkingDirectory $root -RedirectStandardOutput $log -RedirectStandardError $err `
  -WindowStyle Hidden -PassThru
$p.Id
```

Notes:
- Name the executable exactly (`node.exe`, `npm.cmd`) — Start-Process does not
  resolve shell shims like `npm`.
- Run the ps1 with its own output redirected to a file
  (`> spawn.log 2>&1`) so the tool call returns instead of hanging on the
  child's inherited handles.
- The running server may be a worker child; the port owner shown by
  `netstat -ano | findstr :3000` is the pid to register with the preview.
- Verify: `Get-Process -Id <pid>` and poll `curl http://localhost:3000` until 200.

The `/learn/[lessonId]` pages (e.g. `/learn/01-your-first-canvas`,
`/learn/05-your-first-webpage`) are public — no auth, no database needed.
