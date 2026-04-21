import type { Modifier } from '@dnd-kit/core';
import { useEditorStore } from '../store';
import { computeSnap, type Rect } from './snap';

const THRESHOLD = 8;
const GRID = 8;

/** Tracks Alt key state globally — Alt disables snap while held. */
const altKey = { down: false };

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Alt') altKey.down = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Alt') altKey.down = false;
  });
  window.addEventListener('blur', () => {
    altKey.down = false;
  });
}

interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function toRect(r: RectLike | null | undefined): Rect | null {
  if (!r) return null;
  return {
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
}

export const snapModifier: Modifier = (args) => {
  const { transform, active } = args;
  if (!transform) return transform;

  // Only snap free-layout element drags.
  const payload = active?.data?.current?.payload;
  if (!payload || payload.kind !== 'element' || !payload.isFree) {
    return transform;
  }

  if (altKey.down) {
    // Alt pressed → free drag, clear any existing guides.
    const { snapGuides, setSnapGuides } = useEditorStore.getState();
    if (snapGuides.active) setSnapGuides({ ...snapGuides, x: [], y: [] });
    return transform;
  }

  // Find the actual parent section (data-section-id is only set on real
  // sections, not on containers). If dragging inside a container, walk up.
  const elementEl = document.querySelector(
    `[data-element-id="${payload.elementId}"]`,
  ) as HTMLElement | null;
  const sectionEl = elementEl?.closest('[data-section-id]') as HTMLElement | null;
  const container = toRect(sectionEl?.getBoundingClientRect());

  // IMPORTANT: compute the dragging rect ourselves from `initial + transform`
  // instead of reading `rect.current.translated`. The DOM-synced rect
  // reflects the element's position AFTER the previous frame's snap was
  // applied, which creates a feedback loop: we'd see an already-snapped
  // rect, compute delta=0, element would jump to the raw cursor position,
  // next frame re-snaps — user sees jitter around the guide line.
  const initial = active?.rect.current.initial;
  if (!container || !sectionEl || !initial) return transform;

  const dragging: Rect = {
    left: initial.left + transform.x,
    top: initial.top + transform.y,
    right: initial.right + transform.x,
    bottom: initial.bottom + transform.y,
    width: initial.width,
    height: initial.height,
  };

  const siblingEls = Array.from(
    sectionEl.querySelectorAll<HTMLElement>('[data-element-id]'),
  ).filter((el) => el.dataset.elementId !== payload.elementId);
  const siblings = siblingEls
    .map((el) => toRect(el.getBoundingClientRect()))
    .filter((r): r is Rect => r !== null);

  const snap = computeSnap(dragging, {
    container,
    siblings,
    threshold: THRESHOLD,
    grid: GRID,
  });

  // Guides are rounded for crisp 1px lines. The snap delta stays
  // fractional — rounding it causes ±1px oscillation when the cursor is
  // near a half-pixel boundary, which the user perceives as tremor.
  useEditorStore.getState().setSnapGuides({
    active: true,
    x: snap.guidesX.map(Math.round),
    y: snap.guidesY.map(Math.round),
    sectionId: payload.sectionId,
  });

  return {
    ...transform,
    x: transform.x + snap.deltaX,
    y: transform.y + snap.deltaY,
  };
};
