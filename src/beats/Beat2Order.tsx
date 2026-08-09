/* ===========================================================================
   BEAT 2 — THE ORDER (the payoff)

   First stop on the truck's road. The section is two columns with a wide
   empty centre lane — the fixed top-down truck (see JourneyLayers) drives
   down that lane while this content slides past on either side. Keep the
   lane clear: nothing may span the middle on md+, including the heading,
   which is why this beat renders its own h2 inside the left column instead
   of using Section's full-width one.

   TODO (motion): slide the two columns in from their own sides as the
   section enters (the storyboard: "informations appearing from the left and
   right in an animated way"). Reduced motion: everything visible.

   REPLACE ME: drop a real wide dashboard screenshot at
   src/assets/screenshots/dashboard.png and swap out the placeholder below.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat2Order() {
  return (
    <Section
      id="the-order"
      labelledBy="order-heading"
      // Tight top padding: the reveal ends just above, and the owner flagged
      // the empty-white stretch before this heading as wasted scrolling.
      className="relative z-10 pt-10 md:pt-12"
    >
      <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-x-[clamp(5rem,16vw,15rem)]">
        <div data-lane="left">
          <h2
            id="order-heading"
            className="text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl"
          >
            {copy.order.heading}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-body">{copy.order.body}</p>
        </div>

        <div
          data-lane="right"
          className="aspect-[16/10] w-full overflow-hidden rounded-card border border-line bg-surface shadow-float"
        >
          {/* REPLACE ME with:
              <img src={dashboard} alt={copy.order.screenshotAlt} width={1600} height={1000} /> */}
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
            {copy.order.screenshotAlt}
          </div>
        </div>
      </div>
    </Section>
  );
}
