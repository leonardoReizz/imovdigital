import { useEditorStore } from './store';

/**
 * Magenta alignment guides drawn as full-viewport fixed 1px lines. The
 * snap modifier publishes viewport-absolute coordinates to the store on
 * every drag frame, so this component repaints instantly whenever the
 * dragged element aligns with a sibling edge/center or the section edge.
 */
export function SnapGuides() {
  const guides = useEditorStore((s) => s.snapGuides);

  if (!guides.active) return null;

  return (
    <>
      {guides.x.map((x, i) => (
        <div
          key={`x-${i}-${x}`}
          style={{
            position: 'fixed',
            left: x,
            top: 0,
            width: 1,
            height: '100vh',
            background: '#ec4899',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        />
      ))}
      {guides.y.map((y, i) => (
        <div
          key={`y-${i}-${y}`}
          style={{
            position: 'fixed',
            left: 0,
            top: y,
            width: '100vw',
            height: 1,
            background: '#ec4899',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        />
      ))}
    </>
  );
}
