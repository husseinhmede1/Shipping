/* ===========================================================================
   JOURNEY LAYERS — one truck, one camera, no cuts.

   Fixed, viewport-anchored elements that the scroll story drives:

     truck   THE element of the page. It takes over from the reveal video's
             final frame (`#reveal-zone`) at matched size and position, then
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
   the truck. There is NO crossfade in the reveal: the curtain the visitor
   has been staring at IS the reveal video's first frame, so switching the
   video stack on at pin start changes nothing on screen — the picture just
   starts moving. The scroll then scrubs the drone rise; at the apex a white
   wash brightens the frame and the fixed sprite truck fades in matched to
   the video truck's final size and position, then eases to driving size.

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

    // The reveal footage: portrait 1080x1920; at its final frame (the apex of
    // the rise) the truck stands ~636px tall in source pixels. From that, the
    // truck's on-screen height at any viewport is 636 * the object-cover
    // scale — which is what the sprite must match at the moment it takes over.
    const VIDEO_W = 1080;
    const VIDEO_H = 1920;
    const VIDEO_TRUCK_H = 636;

    const context = gsap.context(() => {
      gsap.set(truck.current, { xPercent: -50, transformOrigin: "50% 50%" });
      gsap.set(plane.current, { xPercent: -50 });

      /* -- the reveal: real drone footage, scrubbed by scroll ------------- */
      const revealZone = document.getElementById("reveal-zone");
      if (revealZone) {
        const backdrop = document.getElementById("reveal-backdrop");
        const whiteWash = document.getElementById("reveal-white");
        const face = document.getElementById("face-zoom");
        const flash = document.getElementById("reveal-flash");

        const narrow = () => window.innerWidth < 768;
        const coverScale = () =>
          Math.max(window.innerWidth / VIDEO_W, window.innerHeight / VIDEO_H);
        // Sprite scale that makes it the same size as the truck in the
        // video's final frame, and the y that centres it where the video
        // truck sits (mid-frame; origin is the sprite's centre).
        const matchScale = () => {
          const spriteH = truck.current?.offsetHeight || 1;
          return (VIDEO_TRUCK_H * coverScale()) / spriteH;
        };
        const matchY = () => {
          const spriteH = truck.current?.offsetHeight || 1;
          return 0.5 * vh() - spriteH / 2;
        };

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

        // The video stack switches on at pin start, hidden under face-zoom.
        // fromTo (never .set) so scrubbing back above the pin restores it.
        if (backdrop) {
          reveal.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0);
        }

        // TAKE-OFF. The sharp face still (identical to the curtain, so the
        // switch-on is invisible) pushes in as the drone lifts off the wall...
        if (face) {
          reveal.fromTo(face, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, 0);
          reveal.fromTo(
            face,
            { scale: 1, transformOrigin: "50% 50%" },
            { scale: 1.55, ease: "power2.in", duration: 0.28, immediateRender: false },
            0.02,
          );
          // ...and is dropped ONLY while the flash below is at full white —
          // the still and the footage never share the screen. A crossfade
          // between them read as a double exposure; this is the fix.
          reveal.to(face, { autoAlpha: 0, ease: "none", duration: 0.02 }, 0.32);
        }

        // The exposure flash: blows out to full white as the drone clears
        // the container's shadow into sunlight, then clears to reveal the
        // footage already moving.
        if (flash) {
          reveal
            .fromTo(
              flash,
              { opacity: 0 },
              { opacity: 1, ease: "power2.in", duration: 0.1 },
              0.22,
            )
            .to(flash, { opacity: 0, ease: "power1.out", duration: 0.14 }, 0.36);
        }

        // Scrub the footage across the rest of the pin. Proxy playhead as
        // in the hero: the file may not have arrived and duration is unknown
        // until metadata lands, so nothing is baked in at build time. The
        // element is resolved on EVERY update — Beat1bReveal remounts the
        // <video> when the deferred src lands (key change), so any reference
        // captured here would go stale and scrub a detached node.
        {
          const playhead = { progress: 0 };
          reveal.to(
            playhead,
            {
              progress: 1,
              ease: "none",
              duration: 0.54,
              onUpdate: () => {
                const media = document.getElementById(
                  "reveal-video",
                ) as HTMLVideoElement | null;
                if (!media || media.readyState < 1 || !media.duration) return;
                media.currentTime = playhead.progress * media.duration;
              },
            },
            0.36,
          );
        }

        // The white wash: as the drone tops out, altitude becomes whiteness —
        // the concrete brightens into the page's own ground.
        if (whiteWash) {
          reveal.fromTo(
            whiteWash,
            { opacity: 0 },
            { opacity: 1, ease: "power1.in", duration: 0.16 },
            0.8,
          );
        }

        // The handoff: the sprite fades in at exactly the size and place the
        // video's truck holds in its final frame, then eases to driving size
        // (and, on phones, drifts from the video's centre into its lane).
        reveal
          .fromTo(
            truck.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: "none", duration: 0.08 },
            0.84,
          )
          .fromTo(
            truck.current,
            {
              scale: matchScale,
              x: () => (narrow() ? -0.35 * window.innerWidth : 0),
              y: matchY,
            },
            {
              scale: 1,
              x: 0,
              y: driveY,
              ease: "power1.inOut",
              duration: 0.16,
              immediateRender: false,
            },
            0.84,
          );
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
