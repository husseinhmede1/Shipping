/* ===========================================================================
   BEAT 5 — THE SHIPMENT JOURNEY

   Second stretch of the truck's road (`#road-b`): the container is back on
   wheels after the sea leg, and the tracking stations read as stops it passes
   on the way to the customer. Two columns around the empty centre lane the
   fixed truck drives down (see JourneyLayers): copy on the left, a vertical
   station timeline on the right — vertical on purpose, it runs the same
   direction the truck travels. At the end of this zone the truck shrinks and
   fades: the camera rises, and the flight zone (Beat 6/7) takes over.

   TODO (motion): light each station as it crosses the viewport centre, and
   slide the columns in from their own sides. Reduced motion: all stations lit.

   Beat 6 should visually continue from this — the notifications fire as the
   shipment hits each stage here.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat5Journey() {
  return (
    <Section id="the-journey" labelledBy="journey-heading" className="relative z-10">
      <div className="grid gap-12 md:grid-cols-2 md:items-start md:gap-x-[clamp(5rem,16vw,15rem)]">
        <div data-lane="left">
          <h2
            id="journey-heading"
            className="text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl"
          >
            {copy.journey.heading}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-body">{copy.journey.body}</p>
        </div>

        <ol data-lane="right" className="relative space-y-8 border-l border-line pl-6">
          {copy.journey.stations.map((station) => (
            <li key={station.key} className="relative">
              <span
                aria-hidden="true"
                className="absolute top-1.5 -left-[31px] size-3 rounded-full bg-accent"
              />
              <h3 className="text-base font-semibold text-ink">{station.label}</h3>
              <p className="mt-1.5 text-sm text-muted">{station.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
