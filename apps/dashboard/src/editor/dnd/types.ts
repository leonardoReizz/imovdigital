import type { ElementType, SectionType } from '@imovdigital/types';

export type DragPayload =
  | { kind: 'new-section'; sectionType: SectionType }
  | { kind: 'new-element'; elementType: ElementType }
  | { kind: 'section'; sectionId: string }
  | { kind: 'element'; elementId: string; sectionId: string; isFree: boolean };

export type DropPayload =
  | { kind: 'section-gap'; index: number }
  | { kind: 'section-body'; sectionId: string }
  | { kind: 'element-slot'; sectionId: string; elementId: string }
  | { kind: 'free-canvas'; sectionId: string };

export interface DraggableMeta {
  payload: DragPayload;
}

export interface DroppableMeta {
  payload: DropPayload;
}
