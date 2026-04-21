import type { Modifier } from '@dnd-kit/core';
import { useEditorStore } from '../store';

/**
 * Compensates the visual `transform: scale(zoom)` applied to the canvas
 * frame. Without this, dragging inside a zoomed-out canvas feels fast
 * (the element lags the pointer) or slow (when zoomed in).
 *
 * Since dnd-kit reports pointer delta in viewport px but the canvas is
 * CSS-scaled, we divide the transform by zoom so the element stays under
 * the pointer regardless of zoom level.
 */
export const zoomModifier: Modifier = ({ transform }) => {
  const zoom = useEditorStore.getState().zoom;
  if (zoom === 1) return transform;
  return {
    ...transform,
    x: transform.x / zoom,
    y: transform.y / zoom,
  };
};
