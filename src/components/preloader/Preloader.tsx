/* ===========================================================================
   PRELOADER

   Full-screen overlay shown before the page. A rotating point-cloud globe with
   shipping routes drawing themselves as loading advances, a percentage counter,
   and a stage label.

   Exit: the globe scales up and fades while the overlay wipes upward, revealing
   the page underneath.

   Reduced motion: no rotation, no wipe — a still globe and a short fade.
   =========================================================================== */

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";

import { Globe } from "./GlobeScene";
import { useLoadingProgress } from "@/lib/useLoadingProgress";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { brand } from "@/brand/brand.config";
import { copy } from "@/content/copy";

export function Preloader({ onDone }: { onDone: () => void }) {
  const { progress, complete } = useLoadingProgress();
  const reducedMotion = useReducedMotion();

  const overlay = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  const stageIndex = Math.min(
    copy.loading.stages.length - 1,
    Math.floor((progress / 100) * copy.loading.stages.length),
  );

  // Lock scrolling while the overlay is up.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Exit transition.
  useEffect(() => {
    if (!complete || !overlay.current) return;

    const finish = () => {
      setHidden(true);
      document.body.style.overflow = "";
      onDone();
    };

    if (reducedMotion) {
      gsap.to(overlay.current, { opacity: 0, duration: 0.3, onComplete: finish });
      return;
    }

    // Soft dissolve: the counter goes first, the globe breathes outward slightly
    // as it fades, and the whole overlay cross-fades into the page underneath.
    // Overlapping starts keep it feeling like one motion rather than three.
    overlay.current.style.pointerEvents = "none";

    const timeline = gsap.timeline({ onComplete: finish });
    timeline
      .to(stage.current, { opacity: 0, duration: 0.45, ease: "power2.out" }, 0)
      .to(
        overlay.current.querySelector("[data-canvas]"),
        { scale: 1.06, opacity: 0, duration: 1.1, ease: "power2.out" },
        0.1,
      )
      .to(
        overlay.current,
        { opacity: 0, duration: 0.95, ease: "power2.inOut" },
        0.25,
      );

    return () => {
      timeline.kill();
    };
  }, [complete, reducedMotion, onDone]);

  if (hidden) return null;

  return (
    <div
      ref={overlay}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${brand.name}`}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--neutral-950)]"
    >
      <div data-canvas className="h-[46vmin] w-[46vmin] max-h-[420px] max-w-[420px]">
        <Canvas
          camera={{ position: [0, 0, 4.6], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Globe progress={progress / 100} reducedMotion={reducedMotion} />
        </Canvas>
      </div>

      <div ref={stage} className="mt-6 flex flex-col items-center gap-3">
        <p className="text-5xl font-semibold text-white tabular-nums sm:text-6xl">
          {Math.round(progress)}
          <span className="ml-1 text-2xl text-accent">%</span>
        </p>

        {/* thin progress rule */}
        <div className="h-px w-40 overflow-hidden bg-white/15">
          <div
            className="h-full bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs tracking-[0.2em] text-white/45 uppercase">
          {copy.loading.stages[stageIndex]}
        </p>
      </div>
    </div>
  );
}
