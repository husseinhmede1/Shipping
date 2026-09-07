/* ===========================================================================
   JOURNEY LAYERS — one truck, one camera, no cuts.

   Fixed, viewport-anchored elements that the scroll story drives:

     truck   THE element of the page. It takes over from the reveal's 3D
             drone shot (`#reveal-zone`), drives down the page centre through Order,
             Ledger, Pipeline and Journey (`#road`), and finally exits by
             driving off the bottom edge as the flight zone takes over.
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
   the truck: one proxy value drives the 3D camera (components/reveal) from
   the container wall to straight above the truck, and in the last 10% the
   canvas hands over to this fixed sprite at exactly the size and place the
   3D truck holds. Both switches are pixel-matched — a crossfade between two
   different renderings of the container read as double exposure.

   The truck drives down the CENTRE everywhere. On desktop the road
   sections keep their middle column empty for it; on phones content is
   full-width, so whenever a text block passes over the truck's zone the
   truck softens to keep the words readable (see the dim triggers).

   Reduced motion: this component renders nothing. The flight-zone sections
   paint their own static field background; the story reads without vehicles.
   =========================================================================== */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { revealProgress } from "@/lib/revealProgress";
import { handoffOriginY, handoffScale } from "@/components/reveal/revealMath";

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

    const narrow = () => window.innerWidth < 768;

    const context = gsap.context(() => {
      gsap.set(truck.current, { xPercent: -50, transformOrigin: "50% 50%" });
      gsap.set(plane.current, { xPercent: -50 });

      /* -- the reveal: the 3D drone shot ----------------------------------- */
      const revealZone = document.getElementById("reveal-zone");
      if (revealZone) {
        const backdrop = document.getElementById("reveal-backdrop");
        const canvas = document.getElementById("reveal-canvas");
        const groundRoll = document.getElementById("reveal-ground-roll");

        // 140%, not more — the owner flagged the section-2-to-Order stretch
        // as a long scroll where nothing happens. Keep this tight.
        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: revealZone,
            start: "top top",
            end: "+=140%",
            pin: revealZone,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // The scene switches on at pin start. Invisible: at t=0 the 3D
        // container side renders the same crop of the same texture at the
        // same scale as the fixed curtain behind it (see RevealScene).
        // fromTo (never .set) so scrubbing back above the pin restores it.
        if (backdrop) {
          reveal.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0);
        }

        // THE CAMERA. One proxy value 0..1 across 90% of the pin, handed to
        // the scene through revealProgress: rise, tilt, turn, pull back.
        const cam = { t: 0 };
        reveal.fromTo(
          cam,
          { t: 0 },
          {
            t: 1,
            ease: "none",
            duration: 0.9,
            onUpdate: () => revealProgress.set(cam.t),
          },
          0,
        );

        // THE HANDOFF (last 10%). The scene's final frame puts the flat truck
        // exactly on the DOM sprite's rectangle; the canvas fades out while
        // the sprite fades in. Perspective renders the elevated roof slightly
        // larger than the flat plane, so the sprite starts at that scale
        // (about the viewport centre, where the camera axis is) and eases to
        // 1 — the climb visibly continues through the switch, no jump.
        if (canvas) {
          reveal.to(canvas, { autoAlpha: 0, ease: "none", duration: 0.1 }, 0.9);
        }
        reveal.fromTo(
          truck.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, ease: "none", duration: 0.1 },
          0.9,
        );
        reveal.fromTo(
          truck.current,
          {
            scale: () => handoffScale(window.innerWidth, vh()),
            y: driveY,
            transformOrigin: () => `50% ${handoffOriginY(vh())}px`,
          },
          {
            scale: 1,
            y: driveY,
            ease: "power1.out",
            duration: 0.1,
            immediateRender: false,
          },
          0.9,
        );

        // The ground fades in once the camera has lifted off the wall and out
        // near the top of the climb (high enough that surface texture
        // disappears).
        if (groundRoll) {
          const groundLane = groundRoll.parentElement;
          reveal
            .fromTo(
              groundLane,
              { autoAlpha: 0 },
              { autoAlpha: 1, ease: "none", duration: 0.1 },
              0.3,
            )
            .to(groundLane, { autoAlpha: 0, ease: "none", duration: 0.1 }, 0.86);

          // Constant drift — driving speed, independent of scroll. The roll
          // translates by exactly one tile (50% of the two-image stack) and
          // repeats; the mirror-built tile hides the seam.
          gsap.to(groundRoll, {
            yPercent: -50,
            ease: "none",
            duration: 9,
            repeat: -1,
          });
        }
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
          // Arriving at the field, the truck is already lined up with the
          // road painted down its centre, and drives OFF THE BOTTOM EDGE of
          // the screen — a physical exit, not a fade (owner: "it comes out
          // of the screen"). The plane only enters after it is gone.
          .to(
            truck.current,
            { y: () => 1.3 * vh(), ease: "power1.in", duration: 0.16 },
            0.84,
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

      // MOBILE READABILITY. The truck drives the centre on phones too (the
      // storyboard), where content is full-width — so text blocks pass right
      // over it. While any block is inside the truck's zone the inner image
      // softens; between blocks it comes back. The dim lives on the INNER
      // element (the outer's opacity belongs to the journey timelines).
      // Desktop's centre lane is empty by design, so narrow() gates it.
      {
        let overlaps = 0;
        const applyDim = () => {
          gsap.to(truckInner.current, {
            opacity: narrow() && overlaps > 0 ? 0.22 : 1,
            duration: 0.35,
            overwrite: "auto",
          });
        };
        gsap.utils.toArray<HTMLElement>("#road [data-lane]").forEach((el) =>
          ScrollTrigger.create({
            trigger: el,
            start: "top 82%",
            end: "bottom 25%",
            onToggle: (self) => {
              overlaps += self.isActive ? 1 : -1;
              applyDim();
            },
          }),
        );
      }

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
          // Enters at 0.3, not 0 — the truck must first drive off the bottom
          // of the screen (see the road timeline); only then the plane.
          .fromTo(
            plane.current,
            { y: () => -0.5 * vh(), autoAlpha: 0 },
            { y: () => 0.18 * vh(), autoAlpha: 1, ease: "power1.out", duration: 0.15 },
            0.3,
          )
          .to(plane.current, { y: () => 0.5 * vh(), ease: "none", duration: 0.4 }, 0.45)
          // gone BEFORE the closing form arrives — the form stands alone
          .to(
            plane.current,
            { y: () => 0.85 * vh(), autoAlpha: 0, ease: "power1.in", duration: 0.15 },
            0.85,
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
        className="invisible fixed top-0 left-1/2 z-[5] pointer-events-none"
      >
        <picture>
          <source srcSet="/media/sprite-truck-top.webp" type="image/webp" />
          <img
            ref={truckInner}
            src="/media/sprite-truck-top.png"
            alt=""
            loading="lazy"
            decoding="async"
            // Width capped by BOTH axes: 10vw for narrow screens, 13.5vh for
            // short/wide laptops — the sprite is ~4.1x taller than wide, and
            // it rides at y=30vh, so width must stay under ~13.5vh or the cab
            // falls below the fold on short viewports (owner report).
            className="w-[clamp(64px,min(10vw,13.5vh),150px)]"
          />
        </picture>
      </div>
    </>
  );
}
