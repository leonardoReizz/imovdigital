import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode, type MouseEvent } from 'react';
import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core';
import type { Element, SectionLayout, TextElement } from '@imovdigital/types';
import { ELEMENT_LABELS } from '@imovdigital/types';
import { elementStyleToCss } from '@imovdigital/site-blocks';
import { useEditorStore } from './store';
import { ResizeHandles } from './ResizeHandles';
import type { DragPayload, DropPayload } from './dnd/types';

interface Props {
  element: Element;
  rendered: ReactNode;
  sectionId: string;
  layout: SectionLayout;
  parentCols?: number;
  parentGap?: number;
  parentDirection?: 'row' | 'column';
}

export function EditableElement(props: Props) {
  return props.layout === 'free' ? <FreeElement {...props} /> : <FlowElement {...props} />;
}

/* ─── Free layout ────────────────────────────────────────────── */

function FreeElement({ element, rendered, sectionId }: Props) {
  const payload: DragPayload = { kind: 'element', elementId: element.id, sectionId, isFree: true };
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element:${element.id}`,
    data: { payload },
    disabled: editing,
  });
  const dragTransform = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined;

  return (
    <EditableShell
      element={element}
      rendered={rendered}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      isDragging={isDragging}
      dragTransform={dragTransform}
      isFree
      editing={editing}
      setEditing={setEditing}
    />
  );
}

/* ─── Stack / grid layout ────────────────────────────────────── */

function FlowElement({ element, rendered, sectionId, layout, parentCols, parentGap, parentDirection }: Props) {
  const payload: DragPayload = { kind: 'element', elementId: element.id, sectionId, isFree: false };
  const dropPayload: DropPayload = { kind: 'element-slot', sectionId, elementId: element.id };
  const [editing, setEditing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `element:${element.id}`,
    data: { payload },
    disabled: editing,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `slot:${element.id}`,
    data: { payload: dropPayload },
  });

  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
    wrapperRef.current = node;
  };

  const dragTransform = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined;

  const { active } = useDndContext();
  const activePayload = active?.data.current?.payload as DragPayload | undefined;
  const isCompatibleDrag =
    !!activePayload &&
    (activePayload.kind === 'new-element' ||
     (activePayload.kind === 'element' && activePayload.elementId !== element.id));

  // Track which half of the item the cursor is over (horizontal for grid,
  // vertical for stack) so the indicator switches between "before" and
  // "after" and the drop commits to the right index.
  const [side, setSide] = useState<'before' | 'after' | null>(null);
  const setSlotHint = useEditorStore((s) => s.setSlotHint);

  useEffect(() => {
    if (!isOver || !isCompatibleDrag) {
      setSide(null);
      return;
    }
    const onMove = (e: PointerEvent) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const newSide: 'before' | 'after' =
        layout === 'grid'
          ? e.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
          : e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
      setSide((prev) => (prev === newSide ? prev : newSide));
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [isOver, isCompatibleDrag, layout]);

  useEffect(() => {
    if (side) setSlotHint({ elementId: element.id, side });
  }, [side, element.id, setSlotHint]);

  const showIndicator = !!side && !isDragging;

  return (
    <EditableShell
      element={element}
      rendered={rendered}
      setNodeRef={setRefs}
      listeners={listeners}
      attributes={attributes}
      isDragging={isDragging}
      dragTransform={dragTransform}
      isFree={false}
      parentLayout={layout}
      parentCols={parentCols}
      parentGap={parentGap}
      parentDirection={parentDirection}
      editing={editing}
      setEditing={setEditing}
      showIndicator={showIndicator}
      indicatorSide={side}
      indicatorOrientation={layout === 'grid' ? 'vertical' : 'horizontal'}
      wrapperRef={wrapperRef}
    />
  );
}

/* ─── Shared shell ───────────────────────────────────────────── */

interface ShellProps {
  element: Element;
  rendered: ReactNode;
  setNodeRef: (node: HTMLDivElement | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any;
  isDragging: boolean;
  dragTransform: string | undefined;
  isFree: boolean;
  parentLayout?: import('@imovdigital/types').SectionLayout;
  parentCols?: number;
  parentGap?: number;
  parentDirection?: 'row' | 'column';
  editing: boolean;
  setEditing: (v: boolean) => void;
  showIndicator?: boolean;
  indicatorSide?: 'before' | 'after' | null;
  indicatorOrientation?: 'horizontal' | 'vertical';
  wrapperRef?: React.RefObject<HTMLDivElement | null>;
}

function EditableShell({
  element, rendered, setNodeRef, listeners, attributes,
  isDragging, dragTransform, isFree, parentLayout, parentCols, parentGap,
  editing, setEditing,
  showIndicator, indicatorSide, indicatorOrientation = 'horizontal',
  wrapperRef: externalWrapperRef,
}: ShellProps) {
  const selectionId = useEditorStore((s) => (s.selection?.kind === 'element' ? s.selection.id : null));
  const hoverId = useEditorStore((s) => s.hoverId);
  const select = useEditorStore((s) => s.select);
  const hover = useEditorStore((s) => s.hover);
  const updateElement = useEditorStore((s) => s.updateElement);

  const isSelected = selectionId === element.id;
  const isHover = !isSelected && hoverId === element.id;
  const localRef = useRef<HTMLDivElement>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    localRef.current = node;
    if (externalWrapperRef) {
      (externalWrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  const outlineColor = isSelected ? '#2563eb' : isHover ? '#60a5fa' : 'transparent';
  const outlineWidth = isSelected ? 2 : isHover ? 1 : 0;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (editing) return;
    select({ kind: 'element', id: element.id });
  };
  const handleDoubleClick = (e: MouseEvent) => {
    if (element.type === 'text') { e.stopPropagation(); setEditing(true); }
  };
  const handleEnter = (e: MouseEvent) => { e.stopPropagation(); hover(element.id); };
  const handleLeave = () => hover(null);

  useEffect(() => {
    if (editing && !isSelected) setEditing(false);
  }, [editing, isSelected, setEditing]);

  const size = element.size;
  const width = size?.w === 'full' ? '100%' : size?.w;
  const height = size?.h;
  const intrinsicClamp: CSSProperties =
    element.type === 'image' ? {} : { minWidth: 'min-content', minHeight: 'min-content' };

  // In flow layouts (stack/grid) the parent container controls the
  // dimensions — respecting element.size here would force a fixed width
  // that overflows the allocated grid track and overlaps siblings.
  // `gridSpan` on the element expands the track count in grid layouts.
  const gridColumn =
    !isFree && element.gridSpan && element.gridSpan > 1
      ? `span ${element.gridSpan}`
      : undefined;
  // In stack layouts, children size to content (or explicit width) so that
  // flex alignment (justify/align) can actually position them. The flex
  // parent's `alignItems: stretch` (default) still stretches auto-width
  // items across the cross axis, so column-stacks with stretch behave like
  // width: 100%. In grid we keep width: 100% so the child fills its cell.
  const isStack = parentLayout === 'stack';
  const flowWidth: CSSProperties['width'] = isStack
    ? (width ?? 'auto')
    : '100%';
  const positionStyle: CSSProperties = isFree
    ? {
        position: 'absolute',
        left: element.position?.x ?? 0,
        top: element.position?.y ?? 0,
        width: width ?? 'auto',
        height: height ?? 'auto',
        ...intrinsicClamp,
      }
    : {
        position: 'relative',
        width: flowWidth,
        // Flow elements may carry an explicit height (resized via n/s
        // handles in grid). When omitted or 'auto', intrinsic sizing wins.
        ...(typeof height === 'number' ? { height } : {}),
        gridColumn,
        ...intrinsicClamp,
      };

  return (
    <div
      ref={setRefs}
      data-element-id={element.id}
      data-element-type={element.type}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...(editing ? {} : listeners)}
      {...(editing ? {} : attributes)}
      style={{
        ...positionStyle,
        outline: outlineWidth ? `${outlineWidth}px solid ${outlineColor}` : undefined,
        outlineOffset: 2,
        cursor: editing ? 'text' : isDragging ? 'grabbing' : 'grab',
        transform: dragTransform,
        opacity: isDragging ? 0.3 : 1,
        touchAction: editing ? 'auto' : 'none',
      }}
    >
      {showIndicator && indicatorSide && (
        <DropIndicator orientation={indicatorOrientation} side={indicatorSide} />
      )}

      {editing && element.type === 'text' ? (
        <InlineTextEditor
          element={element}
          onCommit={(content) => {
            updateElement(element.id, (e) => { (e as TextElement).content = content; });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        rendered
      )}

      {isSelected && !editing && (
        <ResizeHandles
          element={element}
          targetRef={localRef}
          isFree={isFree}
          parentLayout={parentLayout}
          parentCols={parentCols}
          parentGap={parentGap}
        />
      )}

      {(isSelected || isHover) && !editing && (
        <span
          style={{
            position: 'absolute',
            top: -22,
            left: 0,
            zIndex: 10,
            background: isSelected ? '#2563eb' : '#60a5fa',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 3,
            fontSize: 11,
            fontWeight: 500,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {ELEMENT_LABELS[element.type]}
        </span>
      )}
    </div>
  );
}

function DropIndicator({
  orientation,
  side,
}: {
  orientation: 'horizontal' | 'vertical';
  side: 'before' | 'after';
}) {
  const THICK = 4;
  const color = '#3b82f6';
  const glow = '0 0 0 2px rgba(255,255,255,0.9), 0 0 12px 2px rgba(59, 130, 246, 0.9)';

  const base: CSSProperties = {
    position: 'absolute',
    background: color,
    pointerEvents: 'none',
    zIndex: 50,
    borderRadius: 2,
    boxShadow: glow,
  };

  if (orientation === 'horizontal') {
    // stack: line above (before) or below (after) the item
    return (
      <div
        style={{
          ...base,
          left: 0,
          right: 0,
          height: THICK,
          ...(side === 'before' ? { top: -THICK } : { bottom: -THICK }),
        }}
      />
    );
  }

  // grid: line at left (before) or right (after) the item
  return (
    <div
      style={{
        ...base,
        top: 0,
        bottom: 0,
        width: THICK,
        ...(side === 'before' ? { left: -THICK } : { right: -THICK }),
      }}
    />
  );
}

function InlineTextEditor({
  element,
  onCommit,
  onCancel,
}: {
  element: TextElement;
  onCommit: (content: string) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  const commit = () => {
    const content = ref.current?.innerText ?? element.content;
    onCommit(content.trim());
  };

  return createElement(element.tag, {
    ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
      if (e.key === 'Enter' && !e.shiftKey && element.tag !== 'p') { e.preventDefault(); commit(); }
    },
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    style: {
      margin: 0,
      outline: 'none',
      minWidth: 20,
      ...elementStyleToCss(element.style),
    },
    children: element.content,
  });
}
