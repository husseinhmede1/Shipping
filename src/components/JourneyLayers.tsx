/* ===========================================================================
   JOURNEY LAYERS — one truck, one camera, no cuts.

   Fixed, viewport-anchored elements that the scroll story drives:

     truck   THE element of the page. It first appears under the shrinking
             container face in the reveal (`#reveal-zone`): the "drone" rises
             off the container surface and the whole truck emerges — same
             container, same weathering, same code. The same element then
             drives down the page centre through Order, Ledger, Pipeline and
             Journey (`#road`), and finally shrinks away as the camera keeps
             rising into the flight zone.
     field   an aerial farmland backdrop behind the Updates + Features
             sections (`#flight-zone`), with a slow parallax drift.
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

   THE REVEAL TIMELINE lives here (not in Beat1bReveal) because its star is
   the truck. At pin start, `#face-zoom` (a fixed, pixel-identical copy of
   the curtain) switches on — invisible switch — and under it the white
   backdrop and the truck (scaled 3.5x, container roof forward) switch on.
   The face then shrinks and fades while the truck scales down to driving
   size: the container the visitor was staring at becomes the container on
   the truck. transform-origin sits on the container (50% 30% of the sprite)
   so the zoom pivots around it, and y never changes across the reveal/road
   boundary — which is what makes the handoff seamless in both directions.

   The truck drives down the CENTRE on desktop — the road sections keep
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
    // The truck's resting y across the whole journey. The reveal ends here
    // and the road starts here, so the element never jumps.
    const driveY = () => 0.3 * vh();

    const context = gsap.context(() => {
      gsap.set(truck.current, { xPercent: -50, transformOrigin: "50% 30%" });
      gsap.set(plane.current, { xPercent: -50 });

      /* -- the reveal: drone rises off the container ---------------------- */
      const revealZone = document.getElementById("reveal-zone");
      if (revealZone) {
        const backdrop = document.getElementById("reveal-backdrop");
        const face = document.getElementById("face-zoom");

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: revealZone,
            start: "top top",
            end: "+=250%",
            pin: revealZone,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Everything switches on at pin start, hidden under face-zoom.
        // fromTo (never .set) so scrubbing back above the pin restores it.
        if (backdrop) {
          reveal.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0);
        }
        reveal.fromTo(truck.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0);
        // On phones the truck's driving lane hugs the right edge, but the
        // drone must start directly over the container — so the zoom begins
        // centred (x offset back to mid-screen, larger scale for the narrow
        // viewport) and drifts into the lane as the truck lands.
        const narrow = () => window.innerWidth < 768;
        reveal.fromTo(
          truck.current,
          {
            scale: () => (narrow() ? 5.5 : 3.5),
            x: () => (narrow() ? -0.35 * window.innerWidth : 0),
            y: driveY,
          },
          {
            scale: 1,
            x: 0,
            y: driveY,
            ease: "power2.inOut",
            duration: 0.86,
            immediateRender: false,
          },
          0.04,
        );

        if (face) {
          reveal.fromTo(face, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0);
          reveal.fromTo(
            face,
            { scale: 1, transformOrigin: "50% 50%" },
            { scale: 0.35, ease: "power1.in", duration: 0.42, immediateRender: false },
            0.04,
          );
          // The face dissolves into the container roof beneath it — the two
          // textures are near-identical, which is what sells the rise.
          reveal.to(face, { autoAlpha: 0, ease: "none", duration: 0.24 }, 0.2);
        }

        // Hold the whole truck for a beat before the road takes over.
        reveal.to({}, { duration: 0.1 });
      }

      /* -- the road: one continuous drive --------------------------------- */
      // The road wrapper starts the moment the reveal unpins, so this
      // timeline opens with the truck exactly where the reveal left it.
      const road = document.getElementById("road");
      if (road) {
        const drive = gsap.timeline({
          scrollTrigger: {
            trigger: road,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        drive
          // slow creep while "driving" — dead stillness looks parked
          .fromTo(
            truck.current,
            { y: driveY },
            { y: () => 0.38 * vh(), ease: "none", duration: 0.85, immediateRender: false },
            0,
          )
          // The handoff: the camera keeps rising, the truck shrinks away,
          // and the flight zone's field + plane take over.
          .to(
            truck.current,
            { scale: 0.55, autoAlpha: 0, ease: "power1.in", duration: 0.15 },
            0.85,
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
