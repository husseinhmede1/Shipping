/* ---------------------------------------------------------------------------
   FRAME SEQUENCE — scroll-scrubbed footage without a <video> element.

   Seeking a video by scroll is at the mercy of the browser: seeks are
   throttled, Safari refuses them until the decoder has a frame, iOS Low
   Power Mode blocks the muted play() that primes it, and any of those
   shows up as "the hero sometimes does not move" (owner report). A folder
   of still frames drawn onto a canvas has none of those failure modes —
   an image either decoded or it did not, and the nearest decoded frame is
   always drawable.

   Loading is prioritised so the scrub works long before every frame is in:
   frame 0 first, then every 8th, every 4th, every 2nd, then the rest. The
   nearest loaded frame stands in for a missing one, so early scrolling
   simply plays at a coarser step and refines as frames arrive.
--------------------------------------------------------------------------- */

export type FrameSet = {
  /** URL prefix, e.g. "/media/hero/d" — files are `${base}/0001.webp` */
  base: string;
  count: number;
  /** zero-padded width of the frame number in the filename */
  pad?: number;
  ext?: string;
};

export function frameUrl(set: FrameSet, index: number) {
  const n = String(index + 1).padStart(set.pad ?? 4, "0");
  return `${set.base}/${n}.${set.ext ?? "webp"}`;
}

/** Coarse-to-fine order: 0, then strides 8, 4, 2, 1 (no repeats). */
function loadOrder(count: number) {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const stride of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

export type FrameLoader = {
  /** the frame itself, or the nearest loaded neighbour, or null if none yet */
  nearest(index: number): HTMLImageElement | null;
  cancel(): void;
};

export function createFrameLoader(
  set: FrameSet,
  onFrame: (index: number) => void,
  concurrency = 4,
): FrameLoader {
  const frames: (HTMLImageElement | null)[] = new Array(set.count).fill(null);
  const order = loadOrder(set.count);
  let cursor = 0;
  let cancelled = false;

  const load = (index: number) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (!cancelled) {
          frames[index] = img;
          onFrame(index);
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = frameUrl(set, index);
    });

  const worker = async () => {
    while (!cancelled && cursor < order.length) {
      const index = order[cursor++];
      if (!frames[index]) await load(index);
    }
  };
  for (let i = 0; i < concurrency; i++) void worker();

  return {
    nearest(index) {
      const i = Math.max(0, Math.min(set.count - 1, Math.round(index)));
      if (frames[i]) return frames[i];
      // walk outwards; the earlier frame wins a tie so the footage never
      // jumps ahead of the scroll
      for (let d = 1; d < set.count; d++) {
        const before = frames[i - d];
        if (before) return before;
        const after = frames[i + d];
        if (after) return after;
      }
      return null;
    },
    cancel() {
      cancelled = true;
    },
  };
}

/** Paint a frame onto a canvas with CSS object-fit: cover semantics. */
export function drawCover(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  focusX = 0.5,
  focusY = 0.5,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) * focusX;
  const dy = (ch - dh) * focusY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** Size the canvas backing store to its CSS box at (capped) device pixels.
    Returns true when the size changed, so the caller can redraw. */
export function fitCanvas(canvas: HTMLCanvasElement, maxDpr = 2) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}
