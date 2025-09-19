# Tuturis

Cybersecurity tools built with Next.js. This repo contains the web app, including a Have I Been Pwned-like email leak checker and shared UI components.

</div>

## Stack

- Next.js 15 (App Router, TypeScript)
- React 19
- Tailwind CSS 4 + tailwind-merge
- Radix UI (Dialog, Navigation Menu, Checkbox, Label)
- Prisma (client generated into `src/generated/prisma/`), Prisma Accelerate extension

## Project structure

- `src/app/*` — App routes (pages, API routes)
	- `src/app/haveibeenpwned/page.tsx` — email leak checker UI
	- `src/app/api/checkpwnd/[mail]/route.ts` — API route proxying to leakcheck.io
- `src/components/*` — UI and navigation components
- `src/lib/*` — utilities and Prisma client
- `src/generated/prisma/*` — generated Prisma client (committed)

## Prerequisites

- Node.js 18+ and pnpm (recommended)
- Optional: a database if you extend Prisma usage (current app does not require DB at runtime)

## Setup

1) Install dependencies

```powershell
pnpm install
```

2) (Optional) Prisma

- The Prisma client is already generated under `src/generated/prisma`. If you change the schema, run:

```powershell
pnpm prisma generate
```

## Development

Start the dev server:

```powershell
pnpm dev
```

Open http://localhost:3000

Key pages:
- Home: `/`
- Email leak checker: `/haveibeenpwned`

## Email leak checker

- UI: `src/app/haveibeenpwned/page.tsx`
	- Opens a dialog via a custom `ShimmerButton`
	- Validates email format and requires acceptance of terms
	- Submits to the API and renders results (success/found/fields/sources)

- API: `src/app/api/checkpwnd/[mail]/route.ts`
	- GET `/api/checkpwnd/:mail` → proxies to `https://leakcheck.io/api/public?check=...`
	- Sanitizes/validates the `mail` param and returns JSON from the upstream API

Example responses:

```jsonc
// Not found
{ "success": false, "error": "Not found" }

// Found
{
	"success": true,
	"found": 2,
	"fields": ["origin", "password"],
	"sources": [ { "name": "Stealer Logs", "date": "" } ]
}
```

## Scripts

```powershell
pnpm dev      # run dev server
pnpm build    # production build (Turbopack)
pnpm start    # start production server
pnpm lint     # run ESLint
```

## Linting

- ESLint (flat config) with Next.js + TypeScript presets
- Generated files like `src/generated/**` and `.next/**` are ignored

## Build & deploy

Create a production build, then start:

```powershell
pnpm build
pnpm start
```

Deploy on your preferred platform (Vercel recommended for Next.js). Ensure environment variables and any DB connections (if added later) are properly configured.

## Troubleshooting

- ENOENT: `.next/routes-manifest.json` during dev:
	- Stop dev, remove `.next`, then `pnpm build` once and `pnpm dev` again.
- 404 on `/haveIBeenPwned`:
	- Route is lowercase: use `/haveibeenpwned`.
- API 500 with `%20` in path:
	- The app now trims/normalizes the email before calling the API, but ensure you enter a clean email.

## License

This project is provided as-is. Add a LICENSE file if you want to formalize distribution terms.
