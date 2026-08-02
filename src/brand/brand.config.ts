/* ---------------------------------------------------------------------------
   BRAND CONFIG — name, contact details and CTA targets.

   The product is white-label, so the brand name is NEVER written as a literal
   string in a component. Always import it from here.
--------------------------------------------------------------------------- */

export const brand = {
  /** REPLACE ME: the real product name. */
  name: "Shipping OS",

  /** Short line used under the logo and in the footer. */
  tagline: "Operations software for sourcing & shipping agencies",

  /** REPLACE ME: drop the real logo at src/assets/logo.svg and import it here. */
  logoAlt: "Shipping OS logo",

  /** REPLACE ME: real contact details. */
  email: "hello@example.com",
  phone: "+961 00 000 000",

  cta: {
    primary: {
      label: "Book a demo",
      /** Calendly / signup URL. Falls back to the contact form when unset. */
      href: import.meta.env.VITE_CTA_URL ?? "#lets-connect",
    },
    secondary: {
      label: "See how it works",
      href: "#the-order",
    },
  },

  /** Endpoint for the "Let's connect" form (Formspree, Web3Forms, ...). */
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT ?? "",
} as const;
