/* ===========================================================================
   BEAT 7 — FEATURES MONTAGE

   Deliberately faster and denser than the beats before it: the story is told,
   this is the "and it also does all this" sweep.

   TODO (motion): a quick staggered reveal as the grid enters the viewport, or a
   marquee on wide screens. Keep it snappy — long stagger here drags.
   Reduced motion: render the grid immediately, no stagger.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat7Features() {
  return (
    <Section id="the-features" heading={copy.features.heading}>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {copy.features.items.map((item) => (
          <li key={item.title} className="rounded-card border border-line bg-surface p-5">
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{item.detail}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
