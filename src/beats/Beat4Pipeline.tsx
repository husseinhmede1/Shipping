/* ===========================================================================
   BEAT 4 — THE SOURCING PIPELINE

   TODO (motion): pin the section and move horizontally through the four stages
   as the visitor scrolls vertically, with the connecting line drawing itself
   between nodes. The shipping mark stamps in at the final stage.
   Reduced motion / mobile: stack the stages vertically, no horizontal scroll,
   no pinning.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat4Pipeline() {
  return (
    <Section id="the-pipeline" heading={copy.pipeline.heading}>
      <p className="mt-6 max-w-2xl text-lg text-body">{copy.pipeline.body}</p>

      <ol className="mt-12 grid gap-6 md:grid-cols-4">
        {copy.pipeline.stages.map((stage, index) => (
          <li
            key={stage.key}
            className="rounded-card border border-line bg-surface p-6 shadow-card"
          >
            <span className="text-xs font-semibold text-accent tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-lg font-semibold">{stage.label}</h3>
            <p className="mt-2 text-sm text-muted">{stage.detail}</p>
          </li>
        ))}
      </ol>

      <p className="mt-8 inline-flex items-center gap-2 rounded-pill border border-line px-4 py-2 text-sm text-muted">
        Shipping mark generated automatically
        <span className="font-mono font-semibold text-ink">{copy.pipeline.sampleMark}</span>
      </p>
    </Section>
  );
}
