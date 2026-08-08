/* ===========================================================================
   BEAT 7 — FEATURES MONTAGE

   Second section of the FLIGHT ZONE — the plane is still crossing behind
   this grid, so the section is transparent (tone "overlay") and the cards
   are dark glass over the field, matching Beat 6. The plane fades out at
   the end of this section, before the closing form.

   Deliberately faster and denser than the beats before it: the story is
   told, this is the "and it also does all this" sweep.

   Under prefers-reduced-motion there are no fixed layers, so the section
   paints its own static copy of the field.

   TODO (motion): a quick staggered reveal as the grid enters the viewport.
   Keep it snappy — long stagger here drags. Reduced motion: no stagger.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function Beat7Features() {
  const reducedMotion = useReducedMotion();

  return (
    <Section
      id="the-features"
      heading={copy.features.heading}
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

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {copy.features.items.map((item) => (
          <li
            key={item.title}
            className="rounded-card bg-black/55 p-5 backdrop-blur-sm"
          >
            <h3 className="text-base font-semibold text-white">{item.title}</h3>
            <p className="mt-1.5 text-sm text-white/70">{item.detail}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
