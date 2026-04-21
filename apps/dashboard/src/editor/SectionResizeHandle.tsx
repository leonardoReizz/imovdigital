import { useRef, type PointerEvent } from 'react';
import type { Section } from '@imovdigital/types';
import { useEditorStore } from './store';

interface Props {
  section: Section;
  sectionRef: React.RefObject<HTMLElement | null>;
}

const MIN_HEIGHT = 80;

/** Single bottom-edge handle that adjusts `section.style.minHeight`. */
export function SectionResizeHandle({ section, sectionRef }: Props) {
  const updateSection = useEditorStore((s) => s.updateSection);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  const onPointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const zoom = useEditorStore.getState().zoom;
    dragRef.current = {
      startY: e.clientY,
      startH: rect.height / zoom,
    };

    const move = (ev: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const z = useEditorStore.getState().zoom;
      const dy = (ev.clientY - drag.startY) / z;
      const newH = Math.max(MIN_HEIGHT, Math.round(drag.startH + dy));
      updateSection(section.id, (s) => {
        s.style.minHeight = newH;
      });
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: -4,
        left: '50%',
        transform: 'translate(-50%, 0)',
        width: 48,
        height: 8,
        background: '#fff',
        border: '1.5px solid #2563eb',
        borderRadius: 3,
        cursor: 'ns-resize',
        zIndex: 25,
      }}
      title="Arraste para ajustar a altura da seção"
    />
  );
}
