# TaskFlow — Minimal Task Manager

A clean, fast, minimal task manager built with **Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui**.

- No sign-up, no database, no servers
- No environment variables required
- Tasks are stored in your browser (localStorage)
- Light / Dark / System theme
- Fully responsive

---

## Run locally

```bash
bun install
bun run dev
```

Open http://localhost:3000 in your browser.

## Build & run (production)

```bash
bun run build      # produces .next/standalone
bun run start      # serves the standalone server
```

---

## Deploy to BiznetGio Neo App

This project ships with three ready-to-use deployment descriptors.
Neo App will pick one automatically based on your buildpack selection.

| File            | When it is used                          |
|-----------------|------------------------------------------|
| `Dockerfile`    | You choose the **Dockerfile** runtime    |
| `nixpacks.toml` | You choose the **Nixpacks** buildpack    |
| `Procfile`      | You choose a **Buildpack** runtime       |

### Steps

1. Push this project to a Git repository (GitHub / GitLab / Bitbucket).
2. Open https://portal.biznetgio.com/platform/neo-app and create a new app.
3. Connect your Git repository.
4. Choose a runtime:
   - **Dockerfile** (recommended) — Neo App detects the `Dockerfile` automatically.
   - or **Nixpacks** — uses `nixpacks.toml`.
5. No environment variables are needed. Leave the env section empty.
6. Set the exposed port to **3000** (the platform injects `PORT` automatically).
7. Deploy.

That's it — no `.env`, no database, no extra configuration.

---

## Tech stack

- Next.js 16 (App Router, standalone output)
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui (New York)
- next-themes (dark mode)
- lucide-react (icons)

## Project structure

```
src/
  app/
    layout.tsx      # Root layout + ThemeProvider + metadata
    page.tsx        # TaskFlow app (tasks, filters, stats, theme toggle)
    globals.css     # Tailwind + theme tokens
  components/
    theme-provider.tsx
    ui/             # shadcn/ui components
  hooks/
    use-toast.ts
  lib/
    utils.ts
Dockerfile          # Multi-stage build (bun build -> node runtime)
nixpacks.toml       # Nixpacks alternative
Procfile            # Buildpack alternative
```
