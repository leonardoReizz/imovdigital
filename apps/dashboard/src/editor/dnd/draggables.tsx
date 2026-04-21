import type { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ElementType, SectionType } from '@imovdigital/types';
import type { DragPayload } from './types';

export function NewSectionDraggable({
  sectionType,
  children,
}: {
  sectionType: SectionType;
  children: ReactNode;
}) {
  const payload: DragPayload = { kind: 'new-section', sectionType };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-section:${sectionType}`,
    data: { payload },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.5 : 1, touchAction: 'none' }}
    >
      {children}
    </div>
  );
}

export function NewElementDraggable({
  elementType,
  children,
}: {
  elementType: ElementType;
  children: ReactNode;
}) {
  const payload: DragPayload = { kind: 'new-element', elementType };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-element:${elementType}`,
    data: { payload },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.5 : 1, touchAction: 'none' }}
    >
      {children}
    </div>
  );
}

export function SectionDragHandle({
  sectionId,
  children,
}: {
  sectionId: string;
  children: ReactNode;
}) {
  const payload: DragPayload = { kind: 'section', sectionId };
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `section:${sectionId}`,
    data: { payload },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.3 : 1, touchAction: 'none', cursor: 'grab' }}
    >
      {children}
    </div>
  );
}

export function ElementDraggable({
  elementId,
  sectionId,
  isFree,
  children,
  style,
}: {
  elementId: string;
  sectionId: string;
  isFree: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  const payload: DragPayload = { kind: 'element', elementId, sectionId, isFree };
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element:${elementId}`,
    data: { payload },
  });

  const appliedTransform = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        transform: appliedTransform,
        opacity: isDragging ? 0.6 : 1,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </div>
  );
}
