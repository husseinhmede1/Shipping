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
- **Pinned sections must fit ANY viewport height.** Reserve the fixed header
  with `pt-[var(--header-h)]`, use `100svh` not `100vh`, and size vertical type
  and spacing with `clamp(min, Xvh, max)` — fixed heights that fit a 900px-tall
  window sit under the header or below the fold at 660px. Verify at 1366x660
  and 1280x600, not just full-height displays.
- **Accessibility.** Semantic HTML, exactly one `h1`, real alt text, visible
  focus states, keyboard-reachable CTAs.
- **Performance.** Compress images before committing. Keep the hero LCP fast;
  lazy-load anything below the fold.
- **Backgrounds: prefer stills over video.** The graded images in
  `public/media/bg-*.webp` are ~60–130KB each against 9MB for the hero video,
  and they are sharper. Video is for the hero only.
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

The page is one continuous "drone shot" — ONE truck element, no camera cuts.
**Beat 0**: a scroll-scrubbed dock video pinned behind the opening lines; at
the end of its pin a yellow container face (`#container-curtain`, rendered in
App, driven by the hero's timeline) descends over the hero and becomes Beat
1's fixed background (the high-res face texture — sharp fullscreen, which
video frames can never be). **Beat 1b (reveal)**: the take-off. At pin start
`#face-zoom` (fixed z-40 copy of the curtain, invisible switch) pushes in
(scale 1 -> 1.55), the frame blows out to a full-white exposure flash
(`#reveal-flash`, z-45), and under TOTAL flash cover the still is swapped
for the footage — the two NEVER share the screen (a crossfade read as a
double exposure; the video's own first frames fullscreen looked dark and
soft). The flash clears onto `reveal-rise.mp4` already moving (portrait
1080x1920 Veo clip, trimmed t=1.2s..5.25s to skip Veo's blurry close-up
opening and the camera's descent after the apex; 12fps all-keyframe,
deferred load + decoder priming), scrubbed to the top of the rise. There a
white wash (`#reveal-white`) brightens the frame and the fixed sprite truck
fades in at the exact size/position of the video's final-frame truck
(VIDEO_TRUCK_H=636 source px via the object-cover scale), then eases to
driving size. Portrait footage is deliberate: native on phones,
centre-cropped by object-cover on desktop. **The road**
(`#road`): the SAME fixed truck (`JourneyLayers.tsx`) drives down the page
centre through Order, Ledger, Pipeline and Journey — all four are light
two-column sections with an empty centre lane (Beat 4's old dark pinned stage
sequence is gone per the owner's direction; its images stay in public/media).
The truck's y is identical at the reveal's end and the road's start, so the
handoff is seamless both directions. At the road's end the truck shrinks away
— the camera keeps rising. **The flight zone** (`#flight-zone`, Beats 6–7): a
fixed olive-field backdrop with two screen-blended, independently drifting
cloud layers (one under the plane, one over it) and a top-down plane that
crosses and fades out before the closing form. Flight-zone content sits in
dark glass panels (tone="overlay" sections).

Fixed-layer stacking inside the z-30 wrapper: field(1) < cloud-back(2) <
plane(3) < cloud-front(4) < truck(5) < section content(10).

A preloader (rotating point-cloud globe) sits above everything until load
completes. Motion still TODO per-beat: card slide-ins from left/right on the
road sections, ledger count-up, message stagger, feature-grid stagger.

## Hard-won GSAP/CSS traps (do not re-learn these)

- **A fixed element inside a pinned section breaks after the pin releases.**
  GSAP leaves a transform on the pinned element, and a transformed ancestor
  becomes the containing block for fixed descendants. All fixed travellers
  (curtain, face-zoom, truck, field, clouds, plane) live OUTSIDE every pinned
  section, in App / JourneyLayers.
- **ScrollTriggers refresh in CREATION order, not document order.** A trigger
  created before a pin that sits ABOVE it on the page measures its positions
  without that pin's spacer (~the pin's full length off). `ScrollTrigger.sort()`
  must run once after ALL triggers exist — App's own useEffect (parent effects
  run after every child's) is the right place.
- **mix-blend-mode is isolated by any stacking-context wrapper.** The cloud
  images are themselves the fixed z-indexed elements; wrapping one in a
  positioned div makes its screen blend composite against the wrapper's
  transparent backdrop (black jpg stays black) instead of the field below.
- **Scrubbed timelines: never use `.set()` at time 0** — ambiguous when
  scrolled back to exactly 0. Use `fromTo(..., {duration: 0.001}, 0)`.
