/* ===========================================================================
   BEAT 8 — CLOSE / "LET'S CONNECT"

   The form posts to a third-party form service (Formspree, Web3Forms, ...) —
   there is no backend in this project. Set VITE_FORM_ENDPOINT in .env.

   NOTE: VITE_ variables are compiled into the public bundle. A form endpoint is
   safe to expose; an email provider API key is NOT. If you ever need a secret,
   move the send into a serverless function instead.

   TODO (motion): a calm close — no heavy animation competing with the CTA.
   =========================================================================== */

import { useState } from "react";
import { Section } from "@/components/Section";
import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";

type Status = "idle" | "sending" | "sent" | "error";

export function Beat8Cta() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: bots fill hidden fields, people never see this one.
    if (data.get("company_website")) return;

    if (!brand.formEndpoint) {
      console.warn("VITE_FORM_ENDPOINT is not set — see .env.example");
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(brand.formEndpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Section id="lets-connect" heading={copy.close.heading} tone="inverse">
      <div className="mt-6 grid gap-12 md:grid-cols-2 md:items-start">
        <div>
          <p className="max-w-xl text-lg text-white/75">{copy.close.body}</p>
          <p className="mt-6 text-sm text-white/50">
            Prefer email?{" "}
            <a className="underline underline-offset-4" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card bg-white/5 p-6">
          <p className="text-sm text-white/70">{copy.close.formIntro}</p>

          <div className="mt-5 space-y-4">
            <Field id="name" label="Your name" autoComplete="name" required />
            <Field id="email" label="Work email" type="email" autoComplete="email" required />
            <Field id="agency" label="Agency name" autoComplete="organization" />

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white/80">
                What are you running on today?
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="mt-1.5 w-full rounded-input border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          {/* honeypot — hidden from people, irresistible to bots */}
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px]"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-6 w-full rounded-input bg-accent px-6 py-3 font-semibold text-brand disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : brand.cta.primary.label}
          </button>

          <p aria-live="polite" className="mt-3 min-h-5 text-sm">
            {status === "sent" && <span className="text-accent">{copy.close.successMessage}</span>}
            {status === "error" && <span className="text-accent">{copy.close.errorMessage}</span>}
          </p>
        </form>
      </div>
    </Section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

function Field({ id, label, type = "text", autoComplete, required }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-1.5 w-full rounded-input border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/30"
      />
    </div>
  );
}
