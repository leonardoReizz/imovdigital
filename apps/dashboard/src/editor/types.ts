import type { Breakpoint, Element, ElementType, Section, SectionType } from '@imovdigital/types';
import type { DragPayload } from './dnd/types';

export type SelectionTarget =
  | { kind: 'section'; id: string }
  | { kind: 'element'; id: string };

export interface DraggingState {
  payload: DragPayload;
}

export interface ElementLocation {
  sectionId: string;
  parentContainerId: string | null;
  index: number;
}

export interface ResolvedSelection {
  target: SelectionTarget;
  section: Section;
  element: Element | null;
}

export type { Breakpoint, Element, ElementType, Section, SectionType };
