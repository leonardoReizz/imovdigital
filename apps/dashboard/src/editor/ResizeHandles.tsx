import { useRef, type PointerEvent } from 'react';
import type { Element, SectionLayout } from '@imovdigital/types';
import { useEditorStore } from './store';

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface Props {
  element: Element;
  targetRef: React.RefObject<HTMLElement | null>;
  isFree: boolean;
  parentLayout?: SectionLayout;
  parentCols?: number;
  parentGap?: number;
}

const HANDLE_STYLES: Record<Handle, React.CSSProperties> = {
  n:  { top: -4, left: '50%', transform: 'translate(-50%, 0)', cursor: 'ns-resize' },
  s:  { bottom: -4, left: '50%', transform: 'translate(-50%, 0)', cursor: 'ns-resize' },
  e:  { top: '50%', right: -4, transform: 'translate(0, -50%)', cursor: 'ew-resize' },
  w:  { top: '50%', left: -4, transform: 'translate(0, -50%)', cursor: 'ew-resize' },
  ne: { top: -4, right: -4, cursor: 'nesw-resize' },
  nw: { top: -4, left: -4, cursor: 'nwse-resize' },
  se: { bottom: -4, right: -4, cursor: 'nwse-resize' },
  sw: { bottom: -4, left: -4, cursor: 'nesw-resize' },
};

const FREE_HANDLES: Handle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
/** Grid controls the width via gridSpan (horizontal handles) while
 *  vertical handles adjust element.size.h for any element type. */
const GRID_HANDLES: Handle[] = ['e', 'w', 'n', 's'];
/** Stack supports both axes — `n/s` resize height, `e/w` resize width
 *  (px, stored on element.size.w). */
const STACK_HANDLES: Handle[] = ['n', 's', 'e', 'w'];
const MIN_SIZE = 24;

interface DragState {
  handle: Handle;
  mode: 'free' | 'grid-span' | 'grid-height' | 'stack-width';
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  startPosX: number;
  startPosY: number;
  aspectRatio: number;
  // grid-span mode — viewport-absolute anchors of the element and grid
  startSpan: number;
  /** Last span actually dispatched during this drag. Compared (not
   *  startSpan) to decide whether to dispatch again — otherwise we never
   *  dispatch when the cursor returns to the original value. */
  lastDispatchedSpan: number;
  cellWidth: number;
  parentCols: number;
  /** Fixed viewport edge of the element opposite to the handle — the
   *  edge that DOES NOT move while dragging. Used to recompute the
   *  current width absolutely (avoids cumulative-delta drift). */
  anchorX: number;
  /** Viewport-absolute left of the parent grid container. */
  parentLeft: number;
  gap: number;
}

export function ResizeHandles({ element, targetRef, isFree, parentLayout, parentCols: propParentCols, parentGap: propParentGap }: Props) {
  const setElementSize = useEditorStore((s) => s.setElementSize);
  const setElementBox = useEditorStore((s) => s.setElementBox);
  const setElementGridSpan = useEditorStore((s) => s.setElementGridSpan);
  const dragRef = useRef<DragState | null>(null);
  const isImage = element.type === 'image';

  const start = (handle: Handle, e: PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = targetRef.current?.getBoundingClientRect();
    if (!rect) return;
    const zoom = useEditorStore.getState().zoom;

    // Grid-span resize: read parent grid config + anchor the non-moving edge.
    let mode: DragState['mode'] = 'free';
    let cellWidth = 0;
    let parentCols = 1;
    const startSpan = element.gridSpan ?? 1;
    let anchorX = 0;
    let parentLeft = 0;
    let gap = 0;

    if (!isFree) {
      const isVerticalHandle = handle === 'n' || handle === 's';
      if (parentLayout === 'stack') {
        // Vertical handles → height; horizontal handles → explicit px width.
        mode = isVerticalHandle ? 'grid-height' : 'stack-width';
      } else if (parentLayout === 'grid') {
        if (isVerticalHandle) {
          // Height-only resize for any element in grid. Width stays under
          // grid control; only element.size.h is adjusted via setElementBox.
          mode = 'grid-height';
        } else {
          mode = 'grid-span';
          const parent = targetRef.current?.parentElement as HTMLElement | null;
          const parentRect = parent?.getBoundingClientRect();
          const parentW = parentRect ? parentRect.width / zoom : 0;
          parentLeft = parentRect ? parentRect.left : 0;
          // Read the true column count + gap from the section's gridConfig
          // (passed via props) — computed style can return unexpanded
          // `minmax(…)` tokens that break naive parsing.
          parentCols = propParentCols ?? 3;
          gap = propParentGap ?? 0;
          cellWidth = (parentW - gap * (parentCols - 1)) / parentCols;

          // Anchor the edge that stays still while the opposite edge is dragged.
          anchorX = handle.includes('e') ? rect.left : rect.right;
        }
      }
    }

    dragRef.current = {
      handle,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width / zoom,
      startH: rect.height / zoom,
      startPosX: element.position?.x ?? 0,
      startPosY: element.position?.y ?? 0,
      aspectRatio: rect.height > 0 ? rect.width / rect.height : 0,
      startSpan,
      lastDispatchedSpan: startSpan,
      cellWidth,
      parentCols,
      anchorX,
      parentLeft,
      gap,
    };

    const move = (ev: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const z = useEditorStore.getState().zoom;
      const dx = (ev.clientX - drag.startX) / z;
      const dy = (ev.clientY - drag.startY) / z;

      if (drag.mode === 'grid-span') {
        // Recompute width from absolute cursor position vs the anchor
        // (the edge that stays put). This way the span always reflects
        // where the cursor IS — no cumulative drift after clamping.
        const cursorX = ev.clientX / z;
        const anchorX = drag.anchorX / z;
        const widthViewport = drag.handle.includes('e')
          ? cursorX - anchorX
          : anchorX - cursorX;
        const step = drag.cellWidth + drag.gap;
        if (step <= 0) return;
        const rawSpan = (widthViewport + drag.gap) / step;
        const newSpan = Math.max(1, Math.min(drag.parentCols, Math.round(rawSpan)));
        if (newSpan !== drag.lastDispatchedSpan) {
          setElementGridSpan(element.id, newSpan);
          drag.lastDispatchedSpan = newSpan;
        }
        return;
      }

      if (drag.mode === 'grid-height') {
        // Image in grid — width is grid-controlled, only height changes.
        let h = drag.startH;
        if (drag.handle === 's') h = drag.startH + dy;
        else if (drag.handle === 'n') h = drag.startH - dy;
        const floor = 48;
        if (h < floor) h = floor;
        // Keep width/x/y as-is; setElementBox treats them as a package
        // but the grid wrapper ignores w and position, only h takes effect.
        setElementBox(element.id, {
          x: 0,
          y: 0,
          w: Math.round(drag.startW),
          h: Math.round(h),
        });
        return;
      }

      if (drag.mode === 'stack-width') {
        // Stack: adjust explicit pixel width on element.size.w so individual
        // items can be wider/narrower than siblings. Preserve existing h.
        let w = drag.startW;
        if (drag.handle === 'e') w = drag.startW + dx;
        else if (drag.handle === 'w') w = drag.startW - dx;
        if (w < MIN_SIZE) w = MIN_SIZE;
        setElementSize(element.id, Math.round(w), element.size?.h ?? 'auto');
        return;
      }

      // Free resize (original logic)
      let w = drag.startW;
      let h = drag.startH;
      let x = drag.startPosX;
      let y = drag.startPosY;

      if (drag.handle.includes('e')) {
        w = drag.startW + dx;
      } else if (drag.handle.includes('w')) {
        w = drag.startW - dx;
        x = drag.startPosX + dx;
      }

      if (drag.handle.includes('s')) {
        h = drag.startH + dy;
      } else if (drag.handle.includes('n')) {
        h = drag.startH - dy;
        y = drag.startPosY + dy;
      }

      if (isImage && !ev.shiftKey && drag.aspectRatio > 0) {
        const isCorner = drag.handle.length === 2;
        const isHorizontal = drag.handle.includes('e') || drag.handle.includes('w');
        if (isCorner || isHorizontal) {
          h = w / drag.aspectRatio;
          if (drag.handle.includes('n')) y = drag.startPosY + (drag.startH - h);
        } else {
          w = h * drag.aspectRatio;
          if (drag.handle.includes('w')) x = drag.startPosX + (drag.startW - w);
        }
      }

      const floor = isImage ? 48 : MIN_SIZE;
      if (w < floor) {
        if (drag.handle.includes('w')) x = drag.startPosX + drag.startW - floor;
        w = floor;
        if (isImage && !ev.shiftKey && drag.aspectRatio > 0) h = floor / drag.aspectRatio;
      }
      if (h < floor) {
        if (drag.handle.includes('n')) y = drag.startPosY + drag.startH - floor;
        h = floor;
        if (isImage && !ev.shiftKey && drag.aspectRatio > 0) w = floor * drag.aspectRatio;
      }

      w = Math.round(w);
      h = Math.round(h);
      setElementBox(element.id, { x: Math.round(x), y: Math.round(y), w, h });
    };

    const up = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const handles = isFree
    ? FREE_HANDLES
    : parentLayout === 'grid'
      ? GRID_HANDLES
      : parentLayout === 'stack'
        ? STACK_HANDLES
        : null;

  if (!handles) return null;

  return (
    <>
      {handles.map((h) => (
        <div
          key={h}
          onPointerDown={(e) => start(h, e)}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            background: '#fff',
            border: '1.5px solid #2563eb',
            borderRadius: 2,
            zIndex: 11,
            ...HANDLE_STYLES[h],
          }}
        />
      ))}
    </>
  );
}
