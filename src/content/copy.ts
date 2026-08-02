/* ---------------------------------------------------------------------------
   ALL PAGE COPY.

   Every headline and paragraph on the page lives here so a non-developer can
   rewrite the site without opening a component. Components import from this
   file and never inline text.

   The copy below is deliberately specific to sourcing & shipping agencies —
   it is a starting point written from the product brief, not final wording.
   Replace the placeholder NUMBERS with real ones from the live product.
--------------------------------------------------------------------------- */

export const copy = {
  /* -- BEAT 0 — Hero ------------------------------------------------- */
  hero: {
    eyebrow: "For sourcing, shipping & freight-forwarding agencies",
    headline: "Run your entire sourcing & shipping business from one screen.",
    subhead:
      "Every order, every shipment, and exactly what each customer owes — in one system instead of scattered across WhatsApp threads and spreadsheets.",
    note: "Works in English and Arabic. Branded as yours.",
  },

  /* -- BEAT 1 — The chaos -------------------------------------------- */
  chaos: {
    heading: "Right now, the business runs on chat threads and spreadsheets",
    body: "Orders arrive by WhatsApp. Payments get noted in Excel — sometimes. Staff answer the same question twenty times a day, and one typo in the ledger is a real money loss.",
    // Floating fragments for the animated mess. Keep them short.
    fragments: [
      "who paid the deposit?",
      "where is my shipment?",
      "did this one ship yet?",
      "which supplier was this from?",
      "how much did we make on it?",
      "is the balance settled?",
      "was this the battery order?",
      "did we invoice him already?",
    ],
  },

  /* -- BEAT 2 — The order (payoff) ----------------------------------- */
  order: {
    heading: "One screen. Every order, every shipment, every balance.",
    body: "The same information, in one place, updated once and correct everywhere.",
    // REPLACE ME: src/assets/screenshots/dashboard.png — a real wide screenshot
    screenshotAlt:
      "The dashboard, showing active shipments, recent orders and outstanding customer balances",
  },

  /* -- BEAT 3 — The ledger -------------------------------------------- */
  ledger: {
    heading: "A customer ledger you can actually trust",
    body: "Every customer has an account with total paid, total owed and a running balance. Payments, charges, refunds and credits are logged with who recorded them and how — cash, bank or wallet. The math is exact, and every line is auditable.",
    // REPLACE ME: real, plausible figures from the live product.
    demoAccount: {
      customer: "Karim T. — Trading",
      totalPaid: 12480,
      totalOwed: 15680,
      balance: 3200,
      currency: "USD",
    },
    entries: [
      { label: "Payment received — bank transfer", amount: -4200 },
      { label: "Shipment ARR-C012 — charges", amount: 1850 },
      { label: "Payment received — wallet", amount: -2600 },
      { label: "Sourcing order SO-441 — charges", amount: 3150 },
    ],
  },

  /* -- BEAT 4 — The sourcing pipeline --------------------------------- */
  pipeline: {
    heading: "From supplier to shipping mark, without a spreadsheet",
    body: "Suppliers, orders, items and consolidated shipments are linked end to end. Shipping marks are generated automatically per carrier, and the awkward cases — batteries, Hong Kong routing — are handled instead of remembered.",
    stages: [
      { key: "supplier", label: "Supplier", detail: "Contacts, terms and history in one record" },
      { key: "order", label: "Order", detail: "Cost, price and profit computed as you go" },
      { key: "items", label: "Items", detail: "Product photos, quantities, per-item flags" },
      { key: "shipment", label: "Shipment", detail: "Consolidated, marked and ready to move" },
    ],
    // REPLACE ME: confirm the real shipping-mark format with the product owner.
    sampleMark: "ARR-C012",
  },

  /* -- BEAT 5 — The shipment journey ---------------------------------- */
  journey: {
    heading: "Everyone can see where it is",
    body: "A single status pipeline, visible at a glance to your team — and to your customer through a private tracking link that needs no login.",
    // REPLACE ME: match these labels EXACTLY to the statuses used in the app.
    stations: [
      { key: "china", label: "China warehouse", detail: "Received, weighed and marked" },
      { key: "transit", label: "In transit", detail: "On the water or in the air" },
      { key: "customs", label: "Customs", detail: "Clearance in progress" },
      { key: "destination", label: "Destination", detail: "Arrived at the local warehouse" },
      { key: "delivered", label: "Delivered", detail: "Handed over and signed for" },
    ],
  },

  /* -- BEAT 6 — Automatic updates ------------------------------------- */
  updates: {
    heading: "Your customers stop asking, because they already know",
    body: "WhatsApp, Telegram or email goes out automatically when an item arrives, a shipment moves, or a payment lands. No one on your team writes those messages any more.",
    // REPLACE ME: screenshot a real notification and mirror its exact wording.
    messages: [
      { time: "09:14", text: "Your shipment ARR-C012 has arrived at the China warehouse." },
      { time: "11:02", text: "ARR-C012 has shipped. Estimated arrival: 18 days." },
      { time: "16:40", text: "We received your payment of $2,600. Balance: $3,200." },
      { time: "08:25", text: "ARR-C012 has cleared customs and is out for delivery." },
    ],
  },

  /* -- BEAT 7 — Features montage -------------------------------------- */
  features: {
    heading: "And everything else the business actually needs",
    items: [
      { title: "Quotations", detail: "Priced, sent and converted to orders in one click." },
      { title: "Invoices & PDFs", detail: "Branded documents generated straight from the order." },
      {
        title: "Packing lists in Chinese",
        detail: "Item names auto-translated for the warehouse team.",
      },
      { title: "Accounting & Excel", detail: "Reconcile arrivals and final prices, then export." },
      { title: "Wallet reconciliation", detail: "Incoming payments matched to the right orders." },
      { title: "Samples tracking", detail: "Know which sample went where, and what it cost." },
      { title: "Salaries", detail: "Employee pay handled inside the same system." },
      { title: "Reports", detail: "Profit, balances, cash position and aging." },
      { title: "Roles & permissions", detail: "Staff see what they need to, and nothing else." },
      { title: "White-label", detail: "Your name, your logo, your colours, your channels." },
      { title: "English & Arabic", detail: "Full right-to-left support throughout." },
    ],
  },

  /* -- BEAT 8 — Close -------------------------------------------------- */
  close: {
    heading: "See it running on your own orders",
    body: "A short walkthrough with your real workflow — suppliers, shipments and balances — so you can judge it against how you work today.",
    formIntro: "Tell us a little about your agency and we'll be in touch within one business day.",
    successMessage: "Thanks — we'll be in touch within one business day.",
    errorMessage: "Something went wrong. Please email us directly and we'll pick it up from there.",
  },

  footer: {
    rights: "All rights reserved.",
  },
} as const;
