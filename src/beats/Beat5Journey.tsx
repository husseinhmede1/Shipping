/* ===========================================================================
   BEAT 5 — THE SHIPMENT JOURNEY

   TODO (motion): pin for ~200vh. A marker travels a route line left to right,
   scrubbed to scroll, lighting each station as it passes. The detail panel swaps
   to the current stage with a staggered fade + rise.
   Mobile (<768px): no pinning — render a simple vertical timeline.
   Reduced motion: all five stations lit, all detail visible, no scrub.

   Beat 6 should visually continue from this — the notifications fire as the
   shipment hits each stage here.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat5Journey() {
  return (
    <Section id="the-journey" heading={copy.journey.heading} tone="inverse">
      <p className="mt-6 max-w-2xl text-lg text-white/75">{copy.journey.body}</p>

      <ol className="mt-14 grid gap-8 md:grid-cols-5">
        {copy.journey.stations.map((station, index) => (
          <li key={station.key} className="relative">
            {/* connector — the line the marker will travel once animated */}
            <div className="mb-4 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full bg-accent"
              />
              {index < copy.journey.stations.length - 1 && (
                <span aria-hidden="true" className="hidden h-px flex-1 bg-white/20 md:block" />
              )}
            </div>
            <h3 className="text-base font-semibold text-white">{station.label}</h3>
            <p className="mt-1.5 text-sm text-white/60">{station.detail}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
