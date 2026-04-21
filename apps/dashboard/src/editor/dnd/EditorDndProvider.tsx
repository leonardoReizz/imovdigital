import { useState, type ReactNode } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  type CollisionDetection,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core';
import type { Element as PageElement, ElementType, SectionType } from '@imovdigital/types';
import { ELEMENT_LABELS, SECTION_LABELS } from '@imovdigital/types';
import { useEditorStore } from '../store';
import type { DragPayload, DropPayload } from './types';
import { snapModifier } from './snapModifier';
import { resetSnapSticky } from './snap';
import { zoomModifier } from './zoomModifier';

interface Props {
  children: ReactNode;
}

export function EditorDndProvider({ children }: Props) {
  const insertSection = useEditorStore((s) => s.insertSection);
  const moveSection = useEditorStore((s) => s.moveSection);
  const insertElement = useEditorStore((s) => s.insertElement);
  const moveElementToSection = useEditorStore((s) => s.moveElementToSection);
  const setElementPosition = useEditorStore((s) => s.setElementPosition);
  const setDragging = useEditorStore((s) => s.setDragging);
  const select = useEditorStore((s) => s.select);

  const [activePayload, setActivePayload] = useState<DragPayload | null>(null);

  // 5px activation distance so clicks don't register as drags.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Custom collision detection:
  // 1. Prefer element slots (the per-item droppables) over section-body
  //    and gap zones — this makes reorder-inside-section feel precise.
  // 2. If the pointer isn't directly over any droppable (e.g. hovering in
  //    the gap between two items), fall back to the closest slot by
  //    center distance so the indicator still shows up.
  const collisionDetection: CollisionDetection = (args) => {
    const isSlot = (id: string | number) => String(id).startsWith('slot:');

    const within = pointerWithin(args);
    const slotsWithin = within.filter((c) => isSlot(c.id));
    if (slotsWithin.length > 0) return slotsWithin;
    if (within.length > 0) return within;

    const closest = closestCenter(args);
    const slotsClosest = closest.filter((c) => isSlot(c.id));
    if (slotsClosest.length > 0) return slotsClosest;
    return closest;
  };

  function handleDragStart(event: DragStartEvent) {
    const payload = event.active.data.current?.payload as DragPayload | undefined;
    if (!payload) return;
    setActivePayload(payload);
    setDragging({ payload });

    // Select the item under the cursor so the properties panel reflects
    // it immediately — otherwise the user has to click once to select,
    // then click-and-drag to move.
    if (payload.kind === 'element') {
      select({ kind: 'element', id: payload.elementId });
    } else if (payload.kind === 'section') {
      select({ kind: 'section', id: payload.sectionId });
    }
  }

  function handleDragOver(_event: DragOverEvent) {
    // placeholder — on-hover feedback is handled by each droppable's isOver.
  }

  function handleDragEnd(event: DragEndEvent) {
    const active = event.active.data.current?.payload as DragPayload | undefined;
    const over = event.over?.data.current?.payload as DropPayload | undefined;

    setActivePayload(null);
    setDragging(null);
    resetSnapSticky();

    if (!active || !over) return;

    // Reorder inside a stack/grid section. Each EditableElement in flow
    // mode exposes a `element-slot` droppable. Compute the before/after
    // side SYNCHRONOUSLY from the target's current rect + the pointer
    // position at drop — reading from the store-backed slotHint is racy
    // when the cursor moves fast across items.
    if (
      (active.kind === 'element' || active.kind === 'new-element')
      && over.kind === 'element-slot'
    ) {
      const page = useEditorStore.getState().page;
      const section = page?.sections.find((s) => s.id === over.sectionId);
      const targetIndex = section?.children.findIndex((c) => c.id === over.elementId) ?? -1;
      if (!section || targetIndex < 0) return;

      // Pointer position at drop: activator event + accumulated delta.
      const activator = event.activatorEvent as PointerEvent | MouseEvent;
      const cursorX = activator.clientX + event.delta.x;
      const cursorY = activator.clientY + event.delta.y;

      const targetEl = document.querySelector(
        `[data-element-id="${over.elementId}"]`,
      ) as HTMLElement | null;
      const rect = targetEl?.getBoundingClientRect();

      let side: 'before' | 'after' = 'before';
      if (rect) {
        side = section.layout === 'grid'
          ? (cursorX < rect.left + rect.width / 2 ? 'before' : 'after')
          : (cursorY < rect.top + rect.height / 2 ? 'before' : 'after');
      }
      const insertIndex = side === 'after' ? targetIndex + 1 : targetIndex;

      if (active.kind === 'new-element') {
        insertElement(over.sectionId, active.elementType, null, insertIndex);
      } else if (active.kind === 'element' && active.elementId !== over.elementId) {
        moveElementToSection(active.elementId, over.sectionId, insertIndex);
      }
      return;
    }

    // ── Free layout: element positioning ─────────────────────────
    if (active.kind === 'element' && active.isFree && over.kind === 'free-canvas' && over.sectionId === active.sectionId) {
      // `event.delta` is the transform after all modifiers (snap, zoom),
      // which in our setup equals the logical shift (parent is scaled and
      // zoomModifier divides by zoom, so delta is already in pre-scale
      // coords). Add it to the element's pre-drag position to get the
      // final logical position that matches the snap-adjusted visual.
      const page = useEditorStore.getState().page;
      let element: PageElement | undefined;
      for (const section of page?.sections ?? []) {
        element = section.children.find((c) => c.id === active.elementId);
        if (element) break;
      }
      if (!element) return;

      const initialX = element.position?.x ?? 0;
      const initialY = element.position?.y ?? 0;
      const x = Math.round(initialX + event.delta.x);
      const y = Math.round(initialY + event.delta.y);
      setElementPosition(active.elementId, Math.max(0, x), Math.max(0, y));
      return;
    }

    // ── Insert new section ───────────────────────────────────────
    if (active.kind === 'new-section') {
      if (over.kind === 'section-gap') {
        insertSection(active.sectionType, over.index);
      }
      return;
    }

    // ── Insert new element ───────────────────────────────────────
    if (active.kind === 'new-element') {
      if (over.kind === 'section-body' || over.kind === 'free-canvas') {
        insertElement(over.sectionId, active.elementType);
      } else if (over.kind === 'element-slot') {
        // drop beside an existing element — insert at its index+1
        // we don't have index info here, append to end for now
        insertElement(over.sectionId, active.elementType);
      }
      return;
    }

    // ── Reorder sections ─────────────────────────────────────────
    if (active.kind === 'section') {
      if (over.kind === 'section-gap') {
        moveSection(active.sectionId, over.index);
      }
      return;
    }

    // ── Move element between sections (stack/grid) ───────────────
    if (active.kind === 'element' && !active.isFree) {
      if (over.kind === 'section-body') {
        moveElementToSection(active.elementId, over.sectionId);
      } else if (over.kind === 'element-slot') {
        moveElementToSection(active.elementId, over.sectionId);
      }
      return;
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={[snapModifier, zoomModifier]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActivePayload(null);
        setDragging(null);
        resetSnapSticky();
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activePayload && (activePayload.kind === 'new-section' || activePayload.kind === 'new-element')
          ? <NewItemPreview payload={activePayload} />
          : null}
      </DragOverlay>
    </DndContext>
  );
}

function NewItemPreview({ payload }: { payload: DragPayload }) {
  // Only shown when dragging a fresh item from the sidebar — existing
  // elements/sections move via transform, so they don't need an overlay
  // (which would show a duplicate label over the dragged node).
  const label =
    payload.kind === 'new-section'
      ? SECTION_LABELS[payload.sectionType as SectionType]
      : payload.kind === 'new-element'
        ? ELEMENT_LABELS[payload.elementType as ElementType]
        : '';
  return (
    <div className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-md shadow-lg pointer-events-none">
      {label}
    </div>
  );
}
