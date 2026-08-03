/* ===========================================================================
   PRELOADER GLOBE

   A point-cloud sphere with shipping routes arcing across it, rotating slowly.
   Everything is generated in code — no textures, no models — so it renders the
   instant the page mounts and adds nothing to the network payload.

   Colours are read from the brand CSS variables at mount, so the globe
   re-skins with the rest of the site.
   =========================================================================== */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const RADIUS = 1.6;
const DOT_COUNT = 2600;

/** Read a brand token so the scene stays themeable from theme.css. */
function brandColor(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value || fallback;
}

/** Evenly distributed points on a sphere (Fibonacci lattice — no clustering at the poles). */
function useSpherePoints(count: number, radius: number) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / (count - 1)) * 2;
      const ringRadius = Math.sqrt(1 - y * y);
      const theta = golden * i;

      positions[i * 3] = Math.cos(theta) * ringRadius * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = Math.sin(theta) * ringRadius * radius;
    }
    return positions;
  }, [count, radius]);
}

/** Convert latitude/longitude to a point on the globe. */
function latLonToVector(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Rough real routes: China → Beirut, Hong Kong → Dubai, Shenzhen → Jeddah. */
const ROUTES: Array<[number, number, number, number]> = [
  [31.2, 121.5, 33.9, 35.5], // Shanghai   -> Beirut
  [22.3, 114.2, 25.2, 55.3], // Hong Kong  -> Dubai
  [22.5, 114.1, 21.5, 39.2], // Shenzhen   -> Jeddah
  [39.9, 116.4, 41.0, 28.9], // Beijing    -> Istanbul
  [23.1, 113.3, 30.0, 31.2], // Guangzhou  -> Cairo
];

function useRouteCurves() {
  return useMemo(
    () =>
      ROUTES.map(([lat1, lon1, lat2, lon2]) => {
        const start = latLonToVector(lat1, lon1, RADIUS);
        const end = latLonToVector(lat2, lon2, RADIUS);
        // Lift the midpoint off the surface so the route arcs above the globe.
        const mid = start
          .clone()
          .add(end)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(RADIUS * 1.5);
        return new THREE.QuadraticBezierCurve3(start, mid, end);
      }),
    [],
  );
}

type GlobeProps = {
  /** 0–1. Drives how much of each route has been drawn. */
  progress: number;
  reducedMotion: boolean;
};

export function Globe({ progress, reducedMotion }: GlobeProps) {
  const group = useRef<THREE.Group>(null);
  const dotPositions = useSpherePoints(DOT_COUNT, RADIUS);
  const curves = useRouteCurves();

  const dotColor = useMemo(() => brandColor("--neutral-100", "#eef2f6"), []);
  const accent = useMemo(() => brandColor("--brand-accent", "#e08733"), []);

  const travellers = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    if (group.current) {
      group.current.rotation.y += delta * 0.18;
    }

    // A dot runs each route, looping — the "things in motion" idea.
    curves.forEach((curve, index) => {
      const mesh = travellers.current[index];
      if (!mesh) return;
      const offset = index * 0.33;
      const t = (state.clock.elapsedTime * 0.22 + offset) % 1;
      mesh.position.copy(curve.getPoint(t));
    });
  });

  return (
    /* Outer group holds a fixed axial tilt so we view the globe from three-
       quarters rather than edge-on — that is what makes the routes read as arcs
       and the orbit ring as an ellipse. The inner group does the spinning. */
    <group rotation={[0.42, 0, -0.24]}>
      <group ref={group}>
        {/* the sphere of points */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[dotPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.026}
            color={dotColor}
            transparent
            opacity={0.9}
            sizeAttenuation
            depthWrite={false}
          />
        </points>

        {/* Solid core. Must be LIGHTER than the overlay background or the globe has
          no silhouette — it also hides the dots on the far side, which is what
          makes the sphere read as solid rather than as a cloud. */}
        <mesh>
          <sphereGeometry args={[RADIUS * 0.985, 48, 48]} />
          {/* The SOFT primary, not the primary — against the near-black overlay
              the darkest green leaves the globe with no silhouette. This sits in
              the same mid-tone band as the video's lit surfaces. */}
          <meshBasicMaterial
            color={brandColor("--brand-primary-soft", "#1e3a30")}
          />
        </mesh>

        {/* orbit ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[RADIUS * 1.2, RADIUS * 1.212, 128]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* shipping routes — each draws itself as loading advances */}
        {curves.map((curve, index) => {
          const drawn = Math.max(
            0.02,
            Math.min(1, progress * 1.2 - index * 0.12),
          );
          const points = curve
            .getPoints(64)
            .slice(0, Math.max(2, Math.floor(64 * drawn)));
          return (
            <group key={index}>
              <Line
                points={points}
                color={accent}
                lineWidth={2.2}
                transparent
                opacity={0.95}
              />
              <mesh ref={(node) => (travellers.current[index] = node)}>
                <sphereGeometry args={[0.045, 14, 14]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
