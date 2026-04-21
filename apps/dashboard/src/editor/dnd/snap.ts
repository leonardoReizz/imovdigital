/**
 * Snap + smart guides math, completely pure. Given a dragged rect and the
 * surrounding candidate rects (section bounds + sibling elements), returns a
 * delta adjustment and the guide lines that should be rendered.
 */

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface SnapResult {
  deltaX: number;
  deltaY: number;
  guidesX: number[]; // absolute x coordinates (horizontal guides are vertical lines)
  guidesY: number[];
}

export interface SnapContext {
  /** The rect of the parent section — used for edge + center snapping. */
  container: Rect;
  /** Sibling element rects (same section). */
  siblings: Rect[];
  /** Snap tolerance in px. */
  threshold: number;
  /** Grid base in px. */
  grid: number;
}

interface Candidate {
  /** Target coordinate we may snap to. */
  value: number;
  /** Guide line coordinate (usually same as value). */
  guide: number;
}

function collectAxisCandidates(
  container: Rect,
  siblings: Rect[],
  axis: 'x' | 'y',
): Candidate[] {
  const out: Candidate[] = [];

  // Container: only outer edges. No center/middle snap — that feels
  // "magnetic to the middle" and fights free placement.
  if (axis === 'x') {
    out.push({ value: container.left, guide: container.left });
    out.push({ value: container.right, guide: container.right });
    for (const s of siblings) {
      out.push({ value: s.left, guide: s.left });
      out.push({ value: s.right, guide: s.right });
      out.push({ value: s.left + s.width / 2, guide: s.left + s.width / 2 });
    }
  } else {
    out.push({ value: container.top, guide: container.top });
    out.push({ value: container.bottom, guide: container.bottom });
    for (const s of siblings) {
      out.push({ value: s.top, guide: s.top });
      out.push({ value: s.bottom, guide: s.bottom });
      out.push({ value: s.top + s.height / 2, guide: s.top + s.height / 2 });
    }
  }

  return out;
}

/**
 * Per-drag sticky state (module-level). Once an axis has snapped to a
 * candidate value, we prefer that same value until the pointer moves
 * beyond `threshold + STICKY_BUFFER` — this prevents jitter when the
 * user wiggles near the alignment.
 */
let stickyX: number | null = null;
let stickyY: number | null = null;

const STICKY_BUFFER = 6;

/** Reset the sticky state. Call on drag end / cancel. */
export function resetSnapSticky(): void {
  stickyX = null;
  stickyY = null;
}

function snapAxis(
  dragging: { min: number; center: number; max: number },
  candidates: Candidate[],
  threshold: number,
  sticky: number | null,
): { delta: number; guides: number[]; target: number | null } {
  const draggingPoints = [dragging.min, dragging.center, dragging.max];

  // If we already had a sticky target and it's still within the buffered
  // threshold, keep it. This is the main anti-jitter mechanism.
  if (sticky !== null) {
    let stickyDist = Infinity;
    let stickyDelta = 0;
    for (const dp of draggingPoints) {
      const d = Math.abs(dp - sticky);
      if (d < stickyDist) {
        stickyDist = d;
        stickyDelta = sticky - dp;
      }
    }
    if (stickyDist <= threshold + STICKY_BUFFER) {
      const guides = collectFiringGuides(draggingPoints, candidates, stickyDelta);
      return { delta: stickyDelta, guides, target: sticky };
    }
  }

  // No sticky, or sticky too far — find the best new candidate.
  let bestDelta = 0;
  let bestDist = threshold + 1;
  let bestValue: number | null = null;

  for (const dp of draggingPoints) {
    for (const c of candidates) {
      const dist = Math.abs(dp - c.value);
      if (dist < bestDist) {
        bestDist = dist;
        bestDelta = c.value - dp;
        bestValue = c.value;
      }
    }
  }

  const guides = collectFiringGuides(draggingPoints, candidates, bestDelta);
  return { delta: bestDelta, guides, target: bestValue };
}

/** Candidates that align exactly (within 0.5px) after the delta is applied. */
function collectFiringGuides(
  draggingPoints: number[],
  candidates: Candidate[],
  delta: number,
): number[] {
  const guides = new Set<number>();
  const postSnap = draggingPoints.map((p) => p + delta);
  for (const c of candidates) {
    for (const p of postSnap) {
      if (Math.abs(p - c.value) <= 0.5) {
        guides.add(c.guide);
      }
    }
  }
  return [...guides];
}

export function computeSnap(dragging: Rect, ctx: SnapContext): SnapResult {
  const xCandidates = collectAxisCandidates(ctx.container, ctx.siblings, 'x');
  const yCandidates = collectAxisCandidates(ctx.container, ctx.siblings, 'y');

  const x = snapAxis(
    { min: dragging.left, center: dragging.left + dragging.width / 2, max: dragging.right },
    xCandidates,
    ctx.threshold,
    stickyX,
  );
  const y = snapAxis(
    { min: dragging.top, center: dragging.top + dragging.height / 2, max: dragging.bottom },
    yCandidates,
    ctx.threshold,
    stickyY,
  );

  stickyX = x.target;
  stickyY = y.target;

  // Grid snap is intentionally not applied here — it made movement feel
  // sticky in every direction. Keep `grid` for future opt-in via Shift.
  void ctx.grid;

  return { deltaX: x.delta, deltaY: y.delta, guidesX: x.guides, guidesY: y.guides };
}
