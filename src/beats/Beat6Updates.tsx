/* ===========================================================================
   BEAT 6 — AUTOMATIC UPDATES

   First section of the FLIGHT ZONE: the fixed olive-field backdrop, drifting
   clouds and the plane (see JourneyLayers) are behind this content. The
   section itself is transparent (tone "overlay") — copy sits in a dark glass
   panel for contrast against the busy field, same treatment as Beat 1's
   panel on the container face. The phone mockup is solid and needs nothing.

   Under prefers-reduced-motion there are no fixed layers, so the section
   paints its own static copy of the field.

   TODO (motion): the messages arrive one at a time as the section crosses
   the viewport. Reduced motion: full conversation delivered.

   REPLACE ME: screenshot a real WhatsApp/Telegram notification from the
   product and mirror its exact wording in copy.ts. Blur the phone number.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function Beat6Updates() {
  const reducedMotion = useReducedMotion();

  return (
    <Section
      id="the-updates"
      labelledBy="updates-heading"
      tone="overlay"
      className="relative z-10"
    >
      {reducedMotion && (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <picture>
            <source srcSet="/media/bg-field.webp" type="image/webp" />
            <img
              src="/media/bg-field.jpg"
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
      )}

      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div className="max-w-xl rounded-card bg-black/55 p-7 backdrop-blur-sm sm:p-9">
          <h2
            id="updates-heading"
            className="text-3xl leading-tight font-semibold text-white sm:text-4xl md:text-5xl"
          >
            {copy.updates.heading}
          </h2>
          <p className="mt-6 text-lg text-white/85">{copy.updates.body}</p>
        </div>

        {/* Phone mockup — decorative frame, real content inside */}
        <div className="mx-auto w-full max-w-xs rounded-[32px] border-8 border-ink bg-page p-4 shadow-float">
          <ul className="space-y-3">
            {copy.updates.messages.map((message) => (
              <li
                key={message.text}
                className="rounded-card rounded-bl-sm bg-surface p-3 shadow-card"
              >
                <p className="text-sm text-ink">{message.text}</p>
                <p className="mt-1 text-right text-[11px] text-muted tabular-nums">
                  {message.time}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
