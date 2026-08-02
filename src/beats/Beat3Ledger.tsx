/* ===========================================================================
   BEAT 3 — THE LEDGER

   TODO (motion): pin the section and let the customer account card assemble —
   total paid, total owed and balance counting up to their final values, scrubbed
   to scroll position so the numbers land as the section ends. Ledger rows stagger
   in beneath.
   Reduced motion: render the card with final numbers already in place.

   REPLACE ME: the figures in copy.ts are placeholders. Use real, plausible
   numbers from the live product — invented round numbers read as fake.
   =========================================================================== */

import { Section } from "@/components/Section";
import { copy } from "@/content/copy";

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export function Beat3Ledger() {
  const account = copy.ledger.demoAccount;

  return (
    <Section id="the-ledger" heading={copy.ledger.heading}>
      <div className="mt-6 grid gap-12 md:grid-cols-2 md:items-start">
        <p className="max-w-xl text-lg text-body">{copy.ledger.body}</p>

        <div className="rounded-card border border-line bg-surface p-6 shadow-float">
          <p className="text-sm font-medium text-muted">{account.customer}</p>

          <dl className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-muted uppercase">Paid</dt>
              <dd className="mt-1 text-xl font-semibold text-ink tabular-nums">
                {money(account.totalPaid, account.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted uppercase">Charged</dt>
              <dd className="mt-1 text-xl font-semibold text-ink tabular-nums">
                {money(account.totalOwed, account.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted uppercase">Balance</dt>
              <dd className="mt-1 text-xl font-semibold text-danger tabular-nums">
                {money(account.balance, account.currency)}
              </dd>
            </div>
          </dl>

          <ul className="mt-6 divide-y divide-line border-t border-line">
            {copy.ledger.entries.map((entry) => (
              <li key={entry.label} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-body">{entry.label}</span>
                <span
                  className={
                    entry.amount < 0
                      ? "text-sm font-semibold text-success tabular-nums"
                      : "text-sm font-semibold text-ink tabular-nums"
                  }
                >
                  {money(entry.amount, account.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
