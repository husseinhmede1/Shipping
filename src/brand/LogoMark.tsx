/* ---------------------------------------------------------------------------
   TEMPORARY LOGO — REPLACE ME.

   A placeholder mark so the header is not empty: a stacked-container glyph
   drawn from the brand tokens, which means it re-colours with the theme like
   everything else.

   To swap in the real one: drop `logo.svg` into src/assets/, import it, and
   replace the <svg> below. Keep the same outer dimensions so the header
   layout does not shift.
--------------------------------------------------------------------------- */

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {/* container stack — three boxes, the top one lifted like a crane load */}
      <rect
        x="2"
        y="18"
        width="13"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="17"
        y="18"
        width="13"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="9.5"
        y="5"
        width="13"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.55"
      />
      {/* hook line */}
      <path
        d="M16 5V1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
