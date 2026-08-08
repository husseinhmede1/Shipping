import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  /** Rendered as the section's h2 and used as its accessible name. */
  heading?: string;
  /** For beats that render their own h2 (e.g. inside a column): the id of
      that heading, wired up as the section's accessible name. */
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  /** page: on the page background. inverse: dark brand panel. overlay: no
      background at all — the section floats over a fixed scenic layer (the
      flight-zone field), so its own text must be white. */
  tone?: "page" | "inverse" | "overlay";
};

/**
 * Shared shell for every beat: consistent vertical rhythm, max width, and a
 * properly labelled landmark. Beats supply their own inner layout.
 */
export function Section({
  id,
  heading,
  labelledBy,
  children,
  className,
  tone = "page",
}: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={heading ? headingId : labelledBy}
      className={cn(
        "px-5 py-24 sm:px-8 md:py-32",
        tone === "inverse" && "bg-brand text-white",
        tone === "overlay" && "text-white",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        {heading && (
          <h2
            id={headingId}
            className={cn(
              "max-w-3xl text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl",
              tone === "inverse" && "text-white",
              tone === "overlay" &&
                "text-white [text-shadow:0_2px_16px_rgb(0_0_0/0.65)]",
            )}
          >
            {heading}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
