/* ===========================================================================
   JOURNEY LAYERS — the travellers that connect the whole page.

   Fixed, viewport-anchored elements that the scroll story drives:

     truck   a top-down truck that "drives" down the page while the Order and
             Ledger sections (zone `#road-a`) scroll past, exits into the dark
             pipeline (the port), returns for the tracking section (`#road-b`),
             and finally shrinks away as the camera "rises" into the flight.
     field   an aerial farmland backdrop behind the Updates + Features
             sections (zone `#flight-zone`), with a slow parallax drift.
     clouds  two copies of the same clouds-on-black image, screen-blended so
             the black vanishes, drifting sideways on their own clocks — one
             UNDER the plane, one OVER it, which is what sells the altitude.
     plane   a top-down plane that crosses the flight zone and fades out
             before the closing form.

   All of this must live OUTSIDE every pinned section (a pinned ancestor's
   leftover transform captures fixed descendants — see Beat 0), and INSIDE the
   opaque z-30 wrapper in App so it paints above the wrapper's background.
   Layer order, bottom to top: field(1) < cloud-back(2) < plane(3) <
   cloud-front(4) < truck(5) < section content(10).

   The truck drives down the CENTRE on desktop — the journey sections keep
   their middle column empty for it. On phones there is no empty centre, so
   the truck takes a narrow lane near the right edge instead.

   Reduced motion: this component renders nothing. The flight-zone sections
   paint their own static field background; the story reads without vehicles.
   =========================================================================== */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function JourneyLayers() {
  const reducedMotion = useReducedMotion();

  const truck = useRef<HTMLDivElement>(null);
  const truckInner = useRef<HTMLImageElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const planeInner = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const fieldImg = useRef<HTMLImageElement>(null);
  const cloudBack = useRef<HTMLImageElement>(null);
  const cloudFront = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const vh = () => window.innerHeight;

    const context = gsap.context(() => {
      gsap.set([truck.current, plane.current], { xPercent: -50 });

      /* -- the truck: one drive per road zone ---------------------------- */
      // Roll in from above, hold mid-viewport while the zone scrolls past
      // (a fixed element over moving ground reads as driving), then exit.
      const drive = (
        zone: HTMLElement,
        exit: (tl: gsap.core.Timeline) => void,
      ) => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: zone,
            start: "top 70%",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        timeline
          .fromTo(
            truck.current,
            { y: () => -0.75 * vh(), autoAlpha: 0 },
            { y: () => 0.3 * vh(), autoAlpha: 1, ease: "power1.out", duration: 0.18 },
            0,
          )
          // slow creep while "driving" — dead stillness looks parked
          .to(truck.current, { y: () => 0.36 * vh(), ease: "none", duration: 0.64 }, 0.18);
        exit(timeline);
      };

      const roadA = document.getElementById("road-a");
      const roadB = document.getElementById("road-b");

      if (roadA) {
        // Exit A: accelerate off the bottom — the truck drives ahead of us
        // into the port as the dark pipeline section arrives.
        drive(roadA, (tl) =>
          tl.to(
            truck.current,
            { y: () => 1.15 * vh(), ease: "power2.in", duration: 0.18 },
            0.82,
          ),
        );
      }

      if (roadB) {
        // Exit B: the handoff. The truck shrinks and fades instead of driving
        // off — the camera is rising away from it, and the flight zone's
        // field + plane take over.
        drive(roadB, (tl) =>
          tl.to(
            truck.current,
            { scale: 0.55, autoAlpha: 0, ease: "power1.in", duration: 0.18 },
            0.82,
          ),
        );
      }

      // Idle bob on the inner image so the truck never freezes solid.
      // Time-based, not scroll-based; the outer element owns scroll transforms.
      gsap.to(truckInner.current, {
        y: 5,
        rotation: 0.5,
        transformOrigin: "50% 30%",
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      /* -- the flight zone: field + clouds ------------------------------- */
      const zone = document.getElementById("flight-zone");
      if (zone) {
        const backdrop = gsap.timeline({
          scrollTrigger: {
            trigger: zone,
            start: "top 80%",
            end: "bottom 25%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        const layers = [field.current, cloudBack.current, cloudFront.current];
        backdrop
          .fromTo(layers, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08, ease: "none" }, 0)
          .to(layers, { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.92);

        // Parallax: the field image is 112% tall and slides slowly upward
        // while the zone scrolls — the ground moves beneath the plane.
        gsap.fromTo(
          fieldImg.current,
          { yPercent: 5 },
          {
            yPercent: -5,
            ease: "none",
            scrollTrigger: {
              trigger: zone,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );

        /* -- the plane ---------------------------------------------------- */
        const flight = gsap.timeline({
          scrollTrigger: {
            trigger: zone,
            start: "top 45%",
            end: "bottom 45%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        flight
          .fromTo(
            plane.current,
            { y: () => -0.5 * vh(), autoAlpha: 0 },
            { y: () => 0.18 * vh(), autoAlpha: 1, ease: "power1.out", duration: 0.18 },
            0,
          )
          .to(plane.current, { y: () => 0.5 * vh(), ease: "none", duration: 0.64 }, 0.18)
          // gone BEFORE the closing form arrives — the form stands alone
          .to(
            plane.current,
            { y: () => 0.85 * vh(), autoAlpha: 0, ease: "power1.in", duration: 0.18 },
            0.82,
          );

        // Gentle lateral wander — planes never fly a pixel-straight line.
        gsap.to(planeInner.current, {
          x: 26,
          rotation: 1.2,
          duration: 7,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }

      /* -- cloud drift ---------------------------------------------------- */
      // The user asked for this specifically: the clouds must feel alive.
      // Each layer drifts on its own clock and the two directions oppose,
      // which reads as depth. transform-only, so it costs nothing.
      gsap.to(cloudBack.current, {
        xPercent: 3,
        duration: 70,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(cloudFront.current, {
        xPercent: -4,
        duration: 48,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });

    return () => context.revert();
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      {/* field — behind everything in the flight zone */}
      <div
        ref={field}
        aria-hidden="true"
        className="invisible fixed inset-0 z-[1] overflow-hidden pointer-events-none"
      >
        <picture>
          <source srcSet="/media/bg-field.webp" type="image/webp" />
          <img
            ref={fieldImg}
            src="/media/bg-field.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-[112%] w-full max-w-none object-cover"
          />
        </picture>
      </div>

      {/* clouds under the plane. The img IS the fixed element — wrapping it
          in a positioned div would create a stacking context around it, which
          isolates mix-blend-mode: the screen blend would composite against
          the wrapper's transparent backdrop (leaving the jpg's black visible)
          instead of against the field below. */}
      <img
        ref={cloudBack}
        aria-hidden="true"
        src="/media/fx-clouds.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        className="invisible fixed -top-[4%] -left-[6%] z-[2] h-[108%] w-[112%] max-w-none object-cover mix-blend-screen opacity-80 pointer-events-none"
      />

      {/* the plane (with its ground shadow) */}
      <div
        ref={plane}
        aria-hidden="true"
        className="invisible fixed top-0 left-1/2 z-[3] pointer-events-none"
      >
        <div ref={planeInner} className="relative">
          <picture>
            <source srcSet="/media/sprite-plane-top.webp" type="image/webp" />
            <img
              src="/media/sprite-plane-top.png"
              alt=""
              loading="lazy"
              decoding="async"
              className="w-[clamp(150px,32vw,300px)] [filter:drop-shadow(0_38px_26px_rgb(0_0_0/0.4))]"
            />
          </picture>
        </div>
      </div>

      {/* clouds over the plane — the occasional occlusion sells the altitude.
          Unwrapped for the same blend-isolation reason as cloud-back. */}
      <img
        ref={cloudFront}
        aria-hidden="true"
        src="/media/fx-clouds.jpg"
        alt=""
        loading="lazy"
        decoding="async"
        className="invisible fixed -top-[10%] -left-[8%] z-[4] h-[124%] w-[124%] max-w-none rotate-180 object-cover mix-blend-screen opacity-60 pointer-events-none"
      />

      {/* the truck — above the flight layers, below all section content */}
      <div
        ref={truck}
        aria-hidden="true"
        className="invisible fixed top-0 left-[85%] z-[5] pointer-events-none md:left-1/2"
      >
        <picture>
          <source srcSet="/media/sprite-truck-top.webp" type="image/webp" />
          <img
            ref={truckInner}
            src="/media/sprite-truck-top.png"
            alt=""
            loading="lazy"
            decoding="async"
            className="w-[clamp(64px,10vw,150px)]"
          />
        </picture>
      </div>
    </>
  );
}
