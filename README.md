# Shipping — scrollytelling landing page

Marketing page for a shipping & sourcing operations platform. Single page, nine
scroll beats, no backend.

Built with Vite · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger ·
Lenis · Framer Motion.

---

## Getting started

You need [Node.js 22+](https://nodejs.org) and [pnpm](https://pnpm.io)
(`npm install -g pnpm`).

```bash
git clone https://github.com/husseinhmede1/shipping.git
cd shipping
pnpm install
cp .env.example .env     # optional — only needed for the contact form
pnpm dev
```

Open <http://localhost:5173>.

| Command          | What it does                            |
| ---------------- | --------------------------------------- |
| `pnpm dev`       | Dev server with hot reload              |
| `pnpm build`     | Typecheck, then build to `dist/`        |
| `pnpm typecheck` | Types only                              |
| `pnpm preview`   | Serve the production build locally      |

---

## Where things live

```
src/
  brand/
    theme.css          # ALL colours, fonts, radii, shadows — the only file to edit to re-skin
    brand.config.ts    # product name, tagline, contact details, CTA targets
  content/
    copy.ts            # every headline and paragraph on the page
  beats/
    Beat0Hero.tsx      # 0 — hero
    Beat1Chaos.tsx     # 1 — the problem: WhatsApp + spreadsheets
    Beat2Order.tsx     # 2 — the payoff: one dashboard
    Beat3Ledger.tsx    # 3 — the customer ledger
    Beat4Pipeline.tsx  # 4 — supplier → order → items → shipment
    Beat5Journey.tsx   # 5 — the shipment status pipeline
    Beat6Updates.tsx   # 6 — automatic customer notifications
    Beat7Features.tsx  # 7 — everything else
    Beat8Cta.tsx       # 8 — close + "Let's connect" form
  components/          # shared layout primitives
  lib/                 # useReducedMotion, useSmoothScroll, cn
  assets/screenshots/  # real product screenshots go here
```

---

## Plugging in the real brand

Everything marked `REPLACE ME` in the source is a placeholder.

1. **Name, contact details, CTA targets** — `src/brand/brand.config.ts`
2. **Colours, fonts, radius, shadow** — `src/brand/theme.css`. This is the only
   file you edit to re-brand. Nothing else contains a hex value.
3. **Logo** — drop `logo.svg` in `public/` and `src/assets/`
4. **Copy** — `src/content/copy.ts`, all of it in one file
5. **Screenshots** — `src/assets/screenshots/`. Needed:
   - `dashboard.png` — wide shot of the main dashboard (Beat 2, the payoff image)
   - `ledger.png` — a customer account with real, plausible figures (Beat 3)
   - `notification.png` — a real WhatsApp/Telegram message (Beat 6)

   Ask for these at 2× / retina, 1600px+ wide. **Blur real customer names, phone
   numbers and amounts before committing** — this repo becomes a public page.
   Compress everything through [Squoosh](https://squoosh.app) first.
6. **Status labels** — the stage names in `copy.ts` (`journey.stations`) must
   match the statuses used in the actual product, word for word.

---

## The contact form

Beat 8 posts to a third-party form service — there is no backend here. Create a
form at [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com),
then set the endpoint in `.env`:

```
VITE_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx
```

> **Note:** anything prefixed `VITE_` is compiled into the public JavaScript
> bundle and readable by anyone in DevTools. A form endpoint is safe to expose.
> An email provider API key is **not** — if you ever need a real secret, move the
> send into a serverless function.

The form includes a honeypot field for spam, an `aria-live` status message, and a
visible fallback email address for when the service is unreachable.

---

## Current state

All nine beats are built as **static, responsive sections with real copy**.
Nothing is animated yet — that is intentional.

Each beat file opens with a `TODO (motion)` comment describing the intended
animation and its reduced-motion fallback. Add motion one beat at a time and
check each in the browser before moving on; animating before the content is
settled means re-choreographing every time a headline changes.

Rules the motion work must follow are in [`CLAUDE.md`](./CLAUDE.md).

---

## Deploying

Connect this repo to [Vercel](https://vercel.com), [Netlify](https://netlify.com)
or Cloudflare Pages. Framework preset: **Vite**. Build command `pnpm build`,
output directory `dist`. Every push to `main` deploys automatically.
