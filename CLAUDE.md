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
Framer Motion · lucide-react · Three.js via @react-three/fiber + drei (the
preloader globe and the reveal's drone shot)

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
  components/ shared layout primitives · JourneyLayers (fixed travellers +
             the reveal/road/flight timelines) · reveal/ (3D drone shot + math)
  lib/       useReducedMotion · useSmoothScroll · revealProgress · cn
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
video frames can never be). **Beat 1b (reveal)**: the take-off, for real —
a Three.js scene (`components/reveal/RevealScene.tsx`, all numbers in
`revealMath.ts`). The container is a textured box (face texture mirror-
repeated and centred on its sides, the sprite's roof crop on top) standing
on the flat truck sprite; the cab is a second box with canvas-painted sides.
Scroll drives ONE camera path (`cameraAt` in revealMath, fed through
`lib/revealProgress`, 0..1 over the first 97% of a 140% pin): pitch and
azimuth 0 -> 90° linear; framing (px per world unit) GEOMETRIC — a linear
pull-back spent the whole 8x distance ratio in the first few percent; the
lens narrows 26° -> 1.5° so perspective flattens as the drone climbs. At
t=0 the +X side fills the viewport height, pixel-identical to the curtain's
object-cover crop (the curtain -> canvas switch at pin start is invisible;
measured ~1px in headless Chromium at both breakpoints). At t=1 the flat
plane projects exactly onto the DOM sprite's rectangle at driveY, and with
the 1.5° lens the roof (h above the ground) renders only ~0.3% larger than
the wheels — under a pixel. Last 3% (~40px): canvas out, DOM truck in from
`handoffScale` (~1.003, origin at the viewport centre) to 1, y at driveY
throughout so the road picks it up with zero jump. A 10% crossfade with the
26° lens (6% roof/wheel mismatch) ghosted into a blurred double truck.
The truck is CENTRED at every width (owner choice); on phones, where
content is full-width, per-block ScrollTriggers dim the truck's inner
image to 0.22 while any [data-lane] block crosses its zone so text stays
readable, restoring it in empty stretches.
Under the truck, `#reveal-ground` (a centred lane, edge-fade mask) rolls a
seamless near-white speckle loop (`fx-ground`, procedural — the concrete
cut from footage carried a crack that read as a slanted line; base 241,
fine + coarse noise, mirror-stacked; `#reveal-ground-roll` translates one
tile and repeats) — constant drift that reads as driving. Veo footage was
tried in this slot TWICE and retired: 1080px frames can never be sharp on a
1920px desktop, close-ups carry baked-in motion blur, and its world clashed
with the page; the raw take stays at `assets-src/reveal-rise-src.mp4`. Every
earlier reveal (crossfade, face push-in + white flash, shrink-fade) was
rejected by the owner: the brief is the SAME truck shrinking while the
surface rotates horizontal -> vertical, like a drone. **The road**
(`#road`): the SAME fixed truck (`JourneyLayers.tsx`) drives down the page
centre through Order, Ledger, Pipeline and Journey — all four are light
two-column sections with an empty centre lane (Beat 4's old dark pinned stage
sequence is gone per the owner's direction; its bg-* stills stay in
public/media).
The truck's y is identical at the reveal's end and the road's start, so the
handoff is seamless both directions. At the road's end the field (which has
a vertical ROAD painted down its centre — regenerate via the grade+road
script if bg-field changes) fades in, the truck drifts onto that road (on
phones it also re-centres from its edge lane) and DRIVES OFF THE BOTTOM
EDGE of the screen — a physical exit, per the owner, never a fade — and
only then does the plane enter (flight timeline starts at 0.3). **The flight zone** (`#flight-zone`, Beats 6–7): a
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
  (curtain, truck, field, clouds, plane) live OUTSIDE every pinned
  section, in App / JourneyLayers. The reveal's canvas is ABSOLUTE inside
  its pinned section, which is fine — only fixed descendants break.
- **Never crossfade two renderings of the container** (still <-> sprite,
  video <-> still): the owner reads it as double exposure. A switch must be
  pixel-identical (curtain -> canvas at t=0, canvas -> sprite at the end) —
  verify with a screenshot pair, not by eye.
- **The r3f Canvas runs `frameloop="demand"`**: it draws only on
  `invalidate()`, which the scene calls from a `revealProgress` subscription.
  Near the pole the camera's up vector must flip to (0,0,-1) (past 89.5°
  pitch) or `lookAt` degenerates and the truck spins.
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
