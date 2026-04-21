import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { DropPayload } from './types';

/**
 * Thin horizontal drop zone between sections. Expands visually when a
 * section/new-section is being dragged.
 */
export function SectionGapDropZone({ index, active }: { index: number; active: boolean }) {
  const payload: DropPayload = { kind: 'section-gap', index };
  const { isOver, setNodeRef } = useDroppable({
    id: `section-gap:${index}`,
    data: { payload },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        height: active ? 32 : 6,
        transition: 'height 120ms ease, background-color 120ms ease',
        background: isOver ? '#3b82f6' : active ? '#dbeafe' : 'transparent',
        borderRadius: 4,
      }}
    />
  );
}

/** Drop zone filling the section body (used in stack/grid layouts). */
export function SectionBodyDropZone({
  sectionId,
  children,
  active,
}: {
  sectionId: string;
  children: ReactNode;
  active: boolean;
}) {
  const payload: DropPayload = { kind: 'section-body', sectionId };
  const { isOver, setNodeRef } = useDroppable({
    id: `section-body:${sectionId}`,
    data: { payload },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'relative',
        outline: isOver && active ? '2px dashed #3b82f6' : undefined,
        outlineOffset: -2,
        transition: 'outline 120ms ease',
      }}
    >
      {children}
    </div>
  );
}

/** Drop zone used inside "free" layout sections to capture absolute-position drops. */
export function FreeCanvasDropZone({
  sectionId,
  children,
  active,
}: {
  sectionId: string;
  children: ReactNode;
  active: boolean;
}) {
  const payload: DropPayload = { kind: 'free-canvas', sectionId };
  const { isOver, setNodeRef } = useDroppable({
    id: `free-canvas:${sectionId}`,
    data: { payload },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        outline: isOver && active ? '2px dashed #3b82f6' : undefined,
        outlineOffset: -2,
        transition: 'outline 120ms ease',
      }}
    >
      {children}
    </div>
  );
}
