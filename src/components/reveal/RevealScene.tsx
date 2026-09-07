/* ===========================================================================
   REVEAL SCENE — the drone shot, for real.

   A small Three.js scene that turns the container face into the top-down
   truck with one continuous camera move. The container is an actual box:
   the face texture on its long sides, the sprite's roof region on top. It
   stands on the truck sprite lying flat as the ground, exactly over the
   sprite's container area. The cab is a second, smaller box.

   The camera orbits from t=0 to t=1 (driven by scroll through
   revealProgress):
     t=0  straight in front of the +X side, so close the side fills the
          viewport height — pixel-for-pixel what the fixed curtain shows.
     t=1  straight above, framed so the flat truck projects onto exactly the
          DOM sprite's rectangle. Then the DOM sprite takes over.
   In between: it rises (pitch 0 -> 90), swings around the cab end (azimuth
   0 -> 90, which is what turns the wide wall into the vertical roof), and
   pulls back. Rise, tilt, turn, shrink — the owner's brief, verbatim.

   Why 3D and not video: the textures are our sharpest images, so the shot
   is crisp at every altitude and every screen size, it scrubs backwards,
   and it costs a few hundred KB instead of megabytes of footage that was
   soft on desktop (both Veo attempts are retired in assets-src/).

   Rendering is on demand — the scene only draws when scroll changes it.
   =========================================================================== */

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { revealProgress } from "@/lib/revealProgress";
import {
  CAB,
  CAB_PX,
  CONTAINER,
  CONTAINER_PX,
  FACE_ASPECT,
  FOV,
  L,
  PLANE_W,
  SPRITE_H,
  SPRITE_W,
  endCamera,
  startCamera,
} from "./revealMath";

const FACE_URL = "/media/bg-container-face.webp";
const SPRITE_URL = "/media/sprite-truck-top.webp";

// Both are in the preloader's manifest, so they come from cache; preloading
// here as well means the GPU upload happens long before the pin engages.
useTexture.preload(FACE_URL);
useTexture.preload(SPRITE_URL);

const POLE = (89.5 * Math.PI) / 180;
const HALF = Math.PI / 2;

/**
 * The cab's side panel, painted once: the sprite only has a top view, and a
 * flat yellow slab read as a block in the oblique frames. Body colour with
 * a dark lower skirt, a wheel arch at the back and a door window at the
 * front — enough for the eye to accept it as a cab at the sizes it appears.
 */
function cabSide(mirror: boolean): THREE.Texture {
  const W = 256;
  const H = 320;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  if (mirror) {
    g.translate(W, 0);
    g.scale(-1, 1);
  }
  // body
  g.fillStyle = "#d6a33a";
  g.fillRect(0, 0, W, H);
  // subtle vertical shading toward the rear, like the container's paint
  const shade = g.createLinearGradient(0, 0, W, 0);
  shade.addColorStop(0, "rgba(255,255,255,0.08)");
  shade.addColorStop(1, "rgba(0,0,0,0.10)");
  g.fillStyle = shade;
  g.fillRect(0, 0, W, H);
  // chassis skirt
  g.fillStyle = "#2b2e33";
  g.fillRect(0, H * 0.8, W, H * 0.2);
  // wheel arch, rear
  g.beginPath();
  g.arc(W * 0.74, H * 0.8, W * 0.19, Math.PI, 0);
  g.fillStyle = "#1c1e21";
  g.fill();
  // door line
  g.strokeStyle = "rgba(0,0,0,0.25)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(W * 0.46, H * 0.12);
  g.lineTo(W * 0.46, H * 0.8);
  g.stroke();
  // door window
  g.fillStyle = "#2e3a44";
  g.beginPath();
  g.roundRect(W * 0.1, H * 0.16, W * 0.31, H * 0.26, 10);
  g.fill();
  // glass highlight
  g.fillStyle = "rgba(255,255,255,0.18)";
  g.beginPath();
  g.roundRect(W * 0.12, H * 0.18, W * 0.13, H * 0.22, 8);
  g.fill();
  return new THREE.CanvasTexture(c);
}

function Scene() {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const [face, sprite] = useTexture([FACE_URL, SPRITE_URL]) as [THREE.Texture, THREE.Texture];

  // Re-render only when scroll moves the camera.
  useEffect(() => revealProgress.subscribe(() => invalidate()), [invalidate]);

  const tex = useMemo(() => {
    const aniso = gl.capabilities.getMaxAnisotropy();
    const prep = (t: THREE.Texture) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.needsUpdate = true;
      return t;
    };
    prep(face);
    prep(sprite);

    // A container side: the face texture, mirror-repeated to the box length
    // and CENTRED (offset), so the middle of the image sits at the middle of
    // the side — the same centre crop object-cover gives the curtain.
    const side = (repeatX: number) => {
      const t = face.clone();
      t.wrapS = THREE.MirroredRepeatWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.repeat.set(repeatX, 1);
      t.offset.set(0.5 - repeatX / 2, 0);
      return prep(t);
    };
    const longRepeat = CONTAINER.l / (FACE_ASPECT * CONTAINER.h);
    const endRepeat = CONTAINER.w / (FACE_ASPECT * CONTAINER.h);

    // A region of the sprite as its own texture (roof, cab top). flipY is
    // on, so v=0 is the image's bottom row: offset.y = 1 - y1/H.
    const crop = (r: { x0: number; x1: number; y0: number; y1: number }) => {
      const t = sprite.clone();
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.repeat.set((r.x1 - r.x0) / SPRITE_W, (r.y1 - r.y0) / SPRITE_H);
      t.offset.set(r.x0 / SPRITE_W, 1 - r.y1 / SPRITE_H);
      return prep(t);
    };

    return {
      sidePX: side(longRepeat),
      sideNX: side(longRepeat),
      endPZ: side(endRepeat),
      endNZ: side(endRepeat),
      roof: crop(CONTAINER_PX),
      cabTop: crop(CAB_PX),
      ground: prep(sprite.clone()),
      // Box UVs run front-to-back on +X and back-to-front on -X, so the
      // two sides are mirror images of one painted panel.
      cabPX: prep(cabSide(false)),
      cabNX: prep(cabSide(true)),
    };
  }, [face, sprite, gl]);

  useFrame(({ camera, size }) => {
    const t = revealProgress.get();
    const { d0, target: c0 } = startCamera();
    const { d1, tz } = endCamera(size.width, size.height);

    // Orbit centre, radius, pitch and azimuth all travel together. The
    // radius climbs geometrically, not linearly: the far distance is about
    // eight times the near one, and a linear pull-back would spend that
    // whole ratio in the first few percent (the wall visibly shrank away
    // from the viewport edges within 20px of scroll). Geometric means the
    // truck loses the same fraction of its size per unit of scroll — a
    // steady climb, gentle at the wall, still moving at the top.
    const cx = c0.x + (0 - c0.x) * t;
    const cy = c0.y + (0 - c0.y) * t;
    const cz = c0.z + (tz - c0.z) * t;
    const r = d0 * Math.pow(d1 / d0, t);
    const pitch = HALF * t;
    const azimuth = HALF * t;

    camera.position.set(
      cx + r * Math.cos(pitch) * Math.cos(azimuth),
      cy + r * Math.sin(pitch),
      cz + r * Math.cos(pitch) * Math.sin(azimuth),
    );
    // Near the pole "up" must become the direction of travel (-Z), which is
    // also what the +Y up resolves to just before it — so the roll is
    // continuous and the cab ends at the bottom of the screen.
    if (pitch > POLE) camera.up.set(0, 0, -1);
    else camera.up.set(0, 1, 0);
    camera.lookAt(cx, cy, cz);

    const persp = camera as THREE.PerspectiveCamera;
    if (persp.fov !== FOV) {
      persp.fov = FOV;
      persp.updateProjectionMatrix();
    }
  });

  return (
    <>
      {/* the truck, flat on the ground — shadow, chassis and all */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
        <planeGeometry args={[PLANE_W, L]} />
        <meshBasicMaterial
          map={tex.ground}
          transparent
          depthWrite={false}
          alphaTest={0.02}
          toneMapped={false}
        />
      </mesh>

      {/* the container: box faces in three.js order +X -X +Y -Y +Z -Z */}
      <mesh position={[CONTAINER.cx, CONTAINER.h / 2, CONTAINER.cz]}>
        <boxGeometry args={[CONTAINER.w, CONTAINER.h, CONTAINER.l]} />
        <meshBasicMaterial attach="material-0" map={tex.sidePX} toneMapped={false} />
        <meshBasicMaterial attach="material-1" map={tex.sideNX} toneMapped={false} />
        <meshBasicMaterial attach="material-2" map={tex.roof} toneMapped={false} />
        <meshBasicMaterial attach="material-3" color="#1a1a1a" toneMapped={false} />
        <meshBasicMaterial attach="material-4" map={tex.endPZ} toneMapped={false} />
        <meshBasicMaterial attach="material-5" map={tex.endNZ} toneMapped={false} />
      </mesh>

      {/* the cab: roof from the sprite, painted sides, dark front */}
      <mesh position={[CAB.cx, CAB.h / 2, CAB.cz]}>
        <boxGeometry args={[CAB.w, CAB.h, CAB.l]} />
        <meshBasicMaterial attach="material-0" map={tex.cabPX} toneMapped={false} />
        <meshBasicMaterial attach="material-1" map={tex.cabNX} toneMapped={false} />
        <meshBasicMaterial attach="material-2" map={tex.cabTop} toneMapped={false} />
        <meshBasicMaterial attach="material-3" color="#1a1a1a" toneMapped={false} />
        <meshBasicMaterial attach="material-4" color="#2e3438" toneMapped={false} />
        <meshBasicMaterial attach="material-5" color="#d9a63a" toneMapped={false} />
      </mesh>
    </>
  );
}

export function RevealScene() {
  return (
    <div id="reveal-canvas" className="pointer-events-none absolute inset-0">
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: FOV, near: 0.1, far: 300 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
