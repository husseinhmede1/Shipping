import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  /** Rendered as the section's h2 and used as its accessible name. */
  heading?: string;
  children: ReactNode;
  className?: string;
  tone?: "page" | "inverse";
};

/**
 * Shared shell for every beat: consistent vertical rhythm, max width, and a
 * properly labelled landmark. Beats supply their own inner layout.
 */
export function Section({ id, heading, children, className, tone = "page" }: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={heading ? headingId : undefined}
      className={cn(
        "px-5 py-24 sm:px-8 md:py-32",
        tone === "inverse" && "bg-brand text-white",
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
