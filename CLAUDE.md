# CLAUDE.md

Read automatically at the start of every Claude Code session in this repo.

## Project

Single-page scrollytelling marketing site for a shipping & sourcing operations
platform — software for agencies that source products (mostly from China),
consolidate and ship them, handle money transfers, and bill their customers.

The page tells a story in nine scroll beats. Marketing site only: **static, no
backend, no database, no router, no authentication.**

## Audience

Owners and operators of import / sourcing / freight-forwarding agencies in the
Middle East (Lebanon and similar markets). They currently run the business on
WhatsApp threads and Excel files. Copy should be concrete and operational, never
generic SaaS filler.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis ·
Framer Motion · lucide-react

## Rules

- **Theming.** Every colour, font, radius and shadow lives in
  `src/brand/theme.css` as a CSS variable, surfaced to Tailwind through the
  `@theme inline` block in `src/index.css`. Never write a hex value in a
  component. The product is white-label — re-skinning must touch one file.
- **Green is the accent; amber is for CTAs only.** The greens are sampled from
  the hero footage (hue 130–160). Use `accent` freely. Use `cta` *only* on
  buttons that ask for a click — its job is to be the one thing on screen that
  isn't green. Never use `cta` as a decorative highlight.
- **White type over the video** uses the `text-on-video` utility, which applies
  the layered green halo. Plain white text on the footage fails on light frames.
- **Base CSS goes in `@layer base`.** Unlayered CSS beats layered CSS, so an
  unlayered `h2 { color: ... }` silently defeats every `text-*` utility.
- **Copy.** Every headline and paragraph lives in `src/content/copy.ts`.
  Components import from it and never inline user-facing text.
- **Brand name** comes from `src/brand/brand.config.ts`. It must never appear as
  a literal string in a component.
- **Animate `transform` and `opacity` only.** Never `width`, `height`, `top` or
  `left` — they force layout on every frame.
- **Reduced motion ships in the same commit as the animation.** Under
  `prefers-reduced-motion: reduce`, render the beat's *final* state: all content
  visible, all stages lit, no pinning, no scrub. The story must still read.
  Use the `useReducedMotion` hook in `src/lib/`.
- **No pinning below 768px.** Beats stack vertically on mobile. Nothing may
  depend on hover.
- **Accessibility.** Semantic HTML, exactly one `h1`, real alt text, visible
  focus states, keyboard-reachable CTAs.
- **Performance.** Compress images before committing. Keep the hero LCP fast;
  lazy-load anything below the fold.
- Each beat is one file in `src/beats/` with a header comment describing what it
  does, what the motion should be, and where real assets get swapped in.

## Layout

```
src/
  brand/     theme.css (all design tokens) · brand.config.ts (name, CTAs, contact)
  content/   copy.ts (every string on the page)
  beats/     Beat0Hero … Beat8Cta — one file per scroll beat
  components/ shared layout primitives
  lib/       useReducedMotion · useSmoothScroll · cn
  assets/    screenshots/ — real product screenshots go here
```

## Commands

```
pnpm dev         # dev server at http://localhost:5173
pnpm build       # typecheck + production build
pnpm typecheck   # types only
pnpm preview     # serve the production build locally
```

## Current state

All nine beats exist as **static, responsive sections with real copy**. None are
animated yet — that is deliberate. Motion is added one beat at a time, reviewed
in the browser after each, per the `TODO (motion)` comment at the top of each
beat file.
