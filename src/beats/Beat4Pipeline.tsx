/* ===========================================================================
   BEAT 4 — THE SOURCING PIPELINE

   The section pins and walks the visitor through the pipeline one stage at a
   time. The background image changes underneath as the stage advances, so the
   visual travels with the story: goods loaded, container lifted and marked,
   through the terminal, then at sea. The shipping mark stamps in at the end,
   and only then does the page release.

   Four images, ~60-130KB each. No video anywhere in this section.

   HOW IT IS DRIVEN
   ScrollTrigger owns the pin and reports progress; everything visual is a CSS
   transition keyed off a stage index. Deliberately not a scrubbed GSAP timeline
   — those evaluate their tweens during setup, and an earlier component in this
   project ended up permanently invisible because a tween captured a start value
   while an entrance animation still had the element hidden. React state plus CSS
   has no such ordering trap, and the index only changes four times, so it costs
   four re-renders for the whole section.

   Degrades:
     - prefers-reduced-motion : no pin, every stage listed, first image static.
     - under 768px            : same. Pinning a 400vh section on a phone is
       hostile, and the stages read perfectly well as a list.
   =========================================================================== */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { copy } from "@/content/copy";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsMobile } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

/** One image per stage — the visual travels as the story does. */
const STAGE_IMAGES = [
  "bg-container-open", // supplier — doors open, goods going in
  "bg-container-hanging", // order    — lifted and marked
  "bg-crane", // items    — through the terminal
  "bg-ship", // shipment — at sea
];

const MARK_START = 0.82; // progress at which the shipping mark begins to stamp

export function Beat4Pipeline() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const staticMode = reducedMotion || isMobile;

  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const mark = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);

  useEffect(() => {
    if (staticMode || !root.current) return;

    const stages = copy.pipeline.stages.length;

    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: `+=${stages * 100}%`,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;

        // Written straight to the DOM — this fires every frame and must not
        // go through React.
        if (rail.current) rail.current.style.transform = `scaleX(${p})`;

        if (mark.current) {
          const t = Math.min(1, Math.max(0, (p - MARK_START) / (1 - MARK_START)));
          mark.current.style.opacity = String(t);
          mark.current.style.transform = `translateY(${(1 - t) * 14}px) scale(${0.94 + t * 0.06})`;
        }

        // The index changes four times across the whole pin, so this is four
        // re-renders, not one per frame.
        const index = Math.min(stages - 1, Math.floor(p * stages));
        if (index !== stageRef.current) {
          stageRef.current = index;
          setStage(index);
        }
      },
    });

    return () => trigger.kill();
  }, [staticMode]);

  /* ---------------------------------------------------------------- static */
  if (staticMode) {
    return (
      <section
        id="the-pipeline"
        aria-labelledby="pipeline-heading"
        className="relative isolate overflow-hidden py-24"
      >
        <StageBackdrop active={0} staticMode />
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <Intro />
          <ol className="mt-12 space-y-4">
            {copy.pipeline.stages.map((s, i) => (
              <li
                key={s.key}
                className="rounded-card border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <span className="text-xs font-semibold text-accent tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-on-video mt-2 text-lg font-semibold">{s.label}</h3>
                <p className="text-on-video mt-1.5 text-sm opacity-75">{s.detail}</p>
              </li>
            ))}
          </ol>
          <MarkPill className="mt-10" />
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- pinned */
  return (
    <section
      ref={root}
      id="the-pipeline"
      aria-labelledby="pipeline-heading"
      className="relative isolate flex h-screen items-center overflow-hidden"
    >
      <StageBackdrop active={stage} />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Intro />

        {/* The stage panel. Blocks are stacked and crossfaded, so the height
            never jumps as the text changes length. */}
        <div className="relative mt-14 h-44 sm:h-40">
          {copy.pipeline.stages.map((s, i) => (
            <div
              key={s.key}
              aria-hidden={i !== stage}
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-out",
                i === stage
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0",
              )}
            >
              <span className="font-heading block text-5xl font-semibold text-accent tabular-nums sm:text-6xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-on-video mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {s.label}
              </h3>
              <p className="text-on-video mt-2 max-w-md text-base opacity-80">
                {s.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Progress rail — where you are in the pipeline. */}
        <div className="mt-10 max-w-2xl">
          <div className="relative h-px w-full bg-white/15">
            <span
              ref={rail}
              className="absolute inset-0 origin-left bg-accent"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <ol className="mt-3 flex justify-between">
            {copy.pipeline.stages.map((s, i) => (
              <li
                key={s.key}
                className={cn(
                  "text-[11px] tracking-[0.14em] uppercase transition-opacity duration-500",
                  i <= stage ? "text-on-video opacity-90" : "text-on-video opacity-35",
                )}
              >
                {s.label}
              </li>
            ))}
          </ol>
        </div>

        <MarkPill ref={mark} className="mt-10" style={{ opacity: 0 }} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pieces */

function Intro() {
  return (
    <div className="max-w-xl">
      <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">
        The sourcing pipeline
      </p>
      <h2
        id="pipeline-heading"
        className="text-on-video mt-4 text-3xl leading-[1.08] font-semibold tracking-tight sm:text-4xl md:text-5xl"
      >
        {copy.pipeline.heading}
      </h2>
    </div>
  );
}

/** All four images stacked; only the active one is opaque. They are lazy, but
 *  live in the same section so the browser fetches them together as it nears. */
function StageBackdrop({ active, staticMode = false }: { active: number; staticMode?: boolean }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[var(--neutral-950)]">
      {STAGE_IMAGES.map((name, i) => (
        <picture key={name}>
          <source srcSet={`/media/${name}.webp`} type="image/webp" />
          <img
            src={`/media/${name}.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            width={2752}
            height={1536}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all ease-out",
              staticMode ? "duration-0" : "duration-[1200ms]",
              i === active ? "scale-105 opacity-100" : "scale-100 opacity-0",
            )}
          />
        </picture>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-[var(--neutral-950)] via-[var(--neutral-950)]/72 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--neutral-950)] via-transparent to-[var(--neutral-950)]" />
      <div className="film-grain absolute inset-0" />
    </div>
  );
}

const MarkPill = ({
  ref,
  className,
  style,
}: {
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div ref={ref} className={className} style={style}>
    <span className="text-on-video inline-flex items-center gap-3 rounded-pill border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm backdrop-blur-sm">
      Shipping mark generated automatically
      <span className="font-mono font-semibold text-accent">
        {copy.pipeline.sampleMark}
      </span>
    </span>
  </div>
);
