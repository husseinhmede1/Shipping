/* ---------------------------------------------------------------------------
   REVEAL MATH — shared by the 3D scene and the scroll timeline.

   World space: the truck is a flat textured plane lying on y=0, its long
   axis along Z with the cab toward +Z. The container is a box standing on
   that plane exactly over the sprite's container region, so that seen from
   directly above the box's roof coincides with the sprite — which is what
   lets the scene hand off to the flat DOM sprite without a visible seam.

   Everything is derived from the sprite's pixel measurements so the two
   worlds (3D and DOM) can never drift apart.
--------------------------------------------------------------------------- */

export const FOV = 26; // at the wall: a drone with a long lens, little distortion
/** At the top the lens goes VERY long. With a 26° lens the roof (h above
    the ground) rendered 6% larger than the wheels, so the last 3D frame and
    the flat DOM sprite could never match and their crossfade ghosted. At
    1.5° the difference is a third of a percent — under a pixel. */
export const FOV_END = 1.5;
const tanHalf = (fovDeg: number) => Math.tan(((fovDeg / 2) * Math.PI) / 180);
const HALF_TURN = Math.PI / 2;

/** sprite-truck-top.png, pixels */
export const SPRITE_W = 574;
export const SPRITE_H = 2421;
/** measured regions of the sprite (px from the top-left) */
export const CONTAINER_PX = { x0: 0, x1: 507, y0: 40, y1: 1700 };
export const CAB_PX = { x0: 20, x1: 500, y0: 1965, y1: 2375 };

/** bg-container-face: 4169x1412 */
export const FACE_ASPECT = 4169 / 1412;
/** a container's height relative to its width (standard box: 2.59m / 2.44m) */
export const CONTAINER_H_RATIO = 1.06;

/** truck plane length in world units — everything else scales from this */
export const L = 10;
export const S = L / SPRITE_H; // world units per sprite pixel
export const PLANE_W = SPRITE_W * S;

/** px -> world (x across the truck, z along it) */
export const px2x = (px: number) => -PLANE_W / 2 + px * S;
export const py2z = (py: number) => -L / 2 + py * S;

export const CONTAINER = (() => {
  const x0 = px2x(CONTAINER_PX.x0), x1 = px2x(CONTAINER_PX.x1);
  const z0 = py2z(CONTAINER_PX.y0), z1 = py2z(CONTAINER_PX.y1);
  const w = x1 - x0, l = z1 - z0, h = w * CONTAINER_H_RATIO;
  return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w, l, h };
})();

export const CAB = (() => {
  const x0 = px2x(CAB_PX.x0), x1 = px2x(CAB_PX.x1);
  const z0 = py2z(CAB_PX.y0), z1 = py2z(CAB_PX.y1);
  const w = x1 - x0, l = z1 - z0, h = CONTAINER.h * 0.98;
  return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w, l, h };
})();

/** The DOM sprite's rendered width — MUST mirror the Tailwind clamp on the
    truck image in JourneyLayers: clamp(64px, min(10vw, 13.5vh), 150px). */
export function spriteWidthPx(vw: number, vh: number) {
  return Math.min(150, Math.max(64, Math.min(0.1 * vw, 0.135 * vh)));
}

/** The DOM sprite's resting top — mirrors driveY in JourneyLayers (0.3vh). */
export const DRIVE_Y_FRACTION = 0.3;

/** Camera at t=0: straight in front of the container's +X side, close
    enough that the side's height exactly fills the viewport height — which
    is precisely how the fixed curtain (object-cover of a wide image) shows
    the same texture. Same crop, same scale: an invisible switch. */
export function startCamera() {
  const th = tanHalf(FOV);
  const d0 = CONTAINER.h / (2 * th);
  const target = { x: CONTAINER.cx + CONTAINER.w / 2, y: CONTAINER.h / 2, z: CONTAINER.cz };
  return { d0, target };
}

/** Camera at t=1: straight above, framed so the truck plane projects onto
    exactly the DOM sprite's rectangle (centred, top at 0.3vh, width per the
    clamp). d1 = distance, tz = where the camera looks on the plane. */
export function endCamera(vw: number, vh: number) {
  const th = tanHalf(FOV_END);
  const wPx = spriteWidthPx(vw, vh);
  const hPx = (wPx * SPRITE_H) / SPRITE_W;
  const k = hPx / L; // screen px per world unit at the plane
  const d1 = vh / (2 * th * k);
  const spriteCentreY = DRIVE_Y_FRACTION * vh + hPx / 2;
  const tz = -(spriteCentreY - vh / 2) / k; // look-at offset so the truck sits lower than centre
  return { d1, tz, hPx, wPx };
}

/** The whole camera path, one value in. Framing (screen px per world unit
    at the point the camera looks at) shrinks GEOMETRICALLY — the same
    fraction of size lost per unit of scroll, a steady climb — while the
    lens narrows linearly; the distance falls out of the two. Pitch and
    azimuth both sweep 0 -> 90°: rise, tilt, turn. */
export function cameraAt(t: number, vw: number, vh: number) {
  const { target: c0 } = startCamera();
  const { tz, hPx } = endCamera(vw, vh);
  const fov = FOV + (FOV_END - FOV) * t;
  const k0 = vh / CONTAINER.h;
  const k1 = hPx / L;
  const k = k0 * Math.pow(k1 / k0, t);
  const r = vh / (2 * tanHalf(fov) * k);
  const centre = { x: c0.x * (1 - t), y: c0.y * (1 - t), z: c0.z + (tz - c0.z) * t };
  return { fov, r, centre, pitch: HALF_TURN * t, azimuth: HALF_TURN * t };
}

/** Perspective makes the elevated roof render this much larger than the
    flat plane at t=1. The DOM sprite starts at this scale and eases to 1 so
    the climb visibly continues through the handoff instead of jumping. */
export function handoffScale(vw: number, vh: number) {
  const { d1 } = endCamera(vw, vh);
  return d1 / (d1 - CONTAINER.h);
}

/** That perspective scaling is about the viewport centre, which sits this
    many px below the DOM sprite's top edge (sprite top = 0.3vh). */
export function handoffOriginY(vh: number) {
  return vh / 2 - DRIVE_Y_FRACTION * vh;
}
