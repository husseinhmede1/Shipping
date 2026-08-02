/* ===========================================================================
   BEAT 6 — AUTOMATIC UPDATES

   TODO (motion): a phone mockup receives the messages one at a time, each
   arriving as the corresponding stage in Beat 5 lights up. Tie the two beats
   together visually — the shipment moving is what triggers the message.
   Reduced motion: show the full conversation already delivered.

   REPLACE ME: screenshot a real WhatsApp/Telegram notification from the product
   and mirror its exact wording in copy.ts. Blur the phone number.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

export function Beat6Updates() {
  return (
    <Section id="the-updates" heading={copy.updates.heading}>
      <div className="mt-6 grid gap-12 md:grid-cols-2 md:items-center">
        <p className="max-w-xl text-lg text-body">{copy.updates.body}</p>

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
