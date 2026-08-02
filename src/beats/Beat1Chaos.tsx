/* ===========================================================================
   BEAT 1 — THE CHAOS (the problem)

   TODO (motion): scatter the fragments as floating chat bubbles and stray
   spreadsheet cells drifting at different speeds. It should feel cluttered and
   slightly stressful by the end of the section — that tension is what makes
   Beat 2 land.
   Reduced motion: render them in a static, still-messy arrangement.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat1Chaos() {
  return (
    <Section id="the-chaos" heading={copy.chaos.heading}>
      <p className="mt-6 max-w-2xl text-lg text-body">{copy.chaos.body}</p>

      <ul className="mt-12 flex flex-wrap gap-3">
        {copy.chaos.fragments.map((fragment) => (
          <li
            key={fragment}
            className="rounded-card border border-line bg-surface px-4 py-2.5 text-sm text-muted shadow-card"
          >
            {fragment}
          </li>
        ))}
      </ul>
    </Section>
  );
}
