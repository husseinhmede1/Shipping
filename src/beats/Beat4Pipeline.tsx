/* ===========================================================================
   BEAT 4 — THE SOURCING PIPELINE

   Part of the truck's road: the section shares the two-column layout with an
   empty centre lane, and the fixed top-down truck (see JourneyLayers) drives
   straight through it — the user asked for the pipeline to be the same
   white-background leg of the trip as the sections around it, so the earlier
   dark pinned image sequence is gone. Copy and the shipping-mark pill on the
   left, the four pipeline stages stacked on the right — a vertical rhythm
   that runs the same direction the truck travels.

   The old stage backdrops (bg-container-open / -hanging / -crane / -ship)
   are still in public/media if a beat ever wants them again.

   TODO (motion): slide the stage cards in from the right and the copy from
   the left as the section enters; stamp the mark pill last.
   Reduced motion: everything visible, no movement.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat4Pipeline() {
  return (
    <Section id="the-pipeline" labelledBy="pipeline-heading" className="relative z-10">
      <div className="grid gap-12 md:grid-cols-2 md:items-start md:gap-x-[clamp(5rem,16vw,15rem)]">
        <div data-lane="left">
          <h2
            id="pipeline-heading"
            className="text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl"
          >
            {copy.pipeline.heading}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-body">{copy.pipeline.body}</p>

          {/* The generated shipping mark — the pipeline's end product. */}
          <p className="mt-8 inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 shadow-card">
            <span className="text-xs tracking-[0.18em] text-muted uppercase">Mark</span>
            <span className="font-semibold text-ink tabular-nums">
              {copy.pipeline.sampleMark}
            </span>
          </p>
        </div>

        <ol data-lane="right" className="space-y-4">
          {copy.pipeline.stages.map((stage, index) => (
            <li
              key={stage.key}
              className="rounded-card border border-line bg-surface p-5 shadow-card"
            >
              <span className="text-xs font-semibold text-accent tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-base font-semibold text-ink">{stage.label}</h3>
              <p className="mt-1.5 text-sm text-muted">{stage.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
