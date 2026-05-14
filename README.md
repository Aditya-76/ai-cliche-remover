# AI Cliché Remover

A web app where you paste text, get every AI cliché and tell-tale phrase
highlighted, with one-click rewrites.

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind v4 + shadcn/ui (new-york style, neutral base color)
- **AI:** `@anthropic-ai/sdk`
- **Payments:** `stripe`
- **Icons:** `lucide-react`

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.local.example`. Copy it to `.env.local` and fill in:

- `ANTHROPIC_API_KEY` — server-side Anthropic API key
- `STRIPE_SECRET_KEY` — server-side Stripe secret key
- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` — Stripe Payment Link URL (exposed to the browser)

`.env.local` is gitignored; never commit real secrets.

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component>
```

The `Button` component is already included as a starting point.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
