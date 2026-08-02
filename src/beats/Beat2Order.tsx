/* ===========================================================================
   BEAT 2 — THE ORDER (the payoff)

   TODO (motion): the scattered fragments from Beat 1 snap/collapse inward and
   resolve into the single dashboard screenshot. This is the emotional payoff of
   the page — spend the most time here and make the settle feel satisfying.
   Reduced motion: show the dashboard already assembled.

   REPLACE ME: drop a real wide dashboard screenshot at
   src/assets/screenshots/dashboard.png and swap out the placeholder below.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat2Order() {
  return (
    <Section id="the-order" heading={copy.order.heading} tone="inverse">
      <p className="mt-6 max-w-2xl text-lg text-white/75">{copy.order.body}</p>

      <div className="mt-12 aspect-[16/10] w-full overflow-hidden rounded-card border border-white/15 bg-white/5">
        {/* REPLACE ME with:
            <img src={dashboard} alt={copy.order.screenshotAlt} width={1600} height={1000} /> */}
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/40">
          {copy.order.screenshotAlt}
        </div>
      </div>
    </Section>
  );
}
