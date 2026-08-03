/* ===========================================================================
   SCROLL CUE

   A pinned hero gives no natural hint that scrolling does anything — the page
   does not move for the first several hundred pixels, which reads as "stuck"
   rather than "sequenced". This is the affordance that tells the visitor the
   story is waiting for them.

   Deliberately NOT driven by GSAP. It used to be part of the scrubbed hero
   timeline, which evaluated the tween during setup while the entrance animation
   still held the cue hidden, captured 0 as the start value, and left it
   invisible forever. Plain state plus a CSS transition has no such ordering
   trap.

   Purely decorative: hidden from assistive tech.
   =========================================================================== */

type ScrollCueProps = {
  /** False before the entrance delay has elapsed, and again once scrolling starts. */
  visible: boolean;
};

export function ScrollCue({ visible }: ScrollCueProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <span className="text-on-video text-[10px] font-semibold tracking-[0.3em] uppercase opacity-70">
        Scroll
      </span>

      {/* a dot falling down a thin rail, on a slow loop */}
      <span className="relative block h-12 w-px overflow-hidden bg-white/25">
        <span className="animate-scroll-cue absolute left-1/2 block h-4 w-px -translate-x-1/2 bg-accent" />
      </span>
    </div>
  );
}
