import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { GripVertical, Image as ImageIcon, Upload } from 'lucide-react';
import {
  BlocksProvider,
  SectionRenderer,
  buildMockProperties,
  MOCK_CITIES_LIST,
  MOCK_NEIGHBORHOODS_LIST,
  type WrapElementContext,
} from '@imovdigital/site-blocks';
import type { Element, Section } from '@imovdigital/types';
import { SECTION_LABELS } from '@imovdigital/types';
import { useEditorStore } from './store';
import { EditableElement } from './EditableElement';
import { SectionDragHandle } from './dnd/draggables';
import {
  FreeCanvasDropZone,
  SectionBodyDropZone,
  SectionGapDropZone,
} from './dnd/droppables';
import { useDesktopImageDrop } from './dnd/useDesktopImageDrop';
import { SectionResizeHandle } from './SectionResizeHandle';
import { useGoogleFont } from './useGoogleFont';

const VIEWPORT_WIDTH: Record<'desktop' | 'tablet' | 'mobile', number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
};

export function Canvas() {
  const page = useEditorStore((s) => s.page);
  const selection = useEditorStore((s) => s.selection);
  const viewport = useEditorStore((s) => s.viewport);
  const dragging = useEditorStore((s) => s.dragging);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const resetZoom = useEditorStore((s) => s.resetZoom);
  const properties = useEditorStore((s) => s.properties);
  const propertiesLoaded = useEditorStore((s) => s.propertiesLoaded);
  const cities = useEditorStore((s) => s.cities);
  const neighborhoods = useEditorStore((s) => s.neighborhoods);
  const tenantTheme = useEditorStore((s) => s.tenantTheme);
  const toggleLeft = useEditorStore((s) => s.toggleLeftPanel);
  const toggleRight = useEditorStore((s) => s.toggleRightPanel);

  // When the tenant has no real properties yet, inject mocks so Listings/
  // Search blocks show populated cards (titled "Adicione imóveis").
  const mocks = useMemo(() => buildMockProperties(12), []);
  const useMocks = propertiesLoaded && properties.length === 0;
  const effectiveProperties = useMocks ? mocks : properties;
  const effectiveCities = useMocks ? MOCK_CITIES_LIST : cities;
  const effectiveNeighborhoods = useMocks ? MOCK_NEIGHBORHOODS_LIST : neighborhoods;

  // On the `property` template page, expose a single "current property"
  // to the context — real property in production, mock/first available
  // while editing — so TextBlocks with bindings render representative
  // content in the canvas.
  const contextProperty =
    page?.slug === 'property' ? (effectiveProperties[0] ?? null) : null;

  // Tenant theme overrides per-page theme so colors/fonts stay consistent
  // across the site. Load the Google Font for the active family so the
  // canvas actually renders in that typeface.
  const effectiveTheme = {
    ...(page?.theme ?? {}),
    ...(tenantTheme ?? {}),
  } as NonNullable<typeof page>['theme'];
  useGoogleFont(effectiveTheme?.fontFamily);

  const select = useEditorStore((s) => s.select);
  const hover = useEditorStore((s) => s.hover);
  const removeElement = useEditorStore((s) => s.removeElement);
  const removeSection = useEditorStore((s) => s.removeSection);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const duplicateSection = useEditorStore((s) => s.duplicateSection);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const desktopDrop = useDesktopImageDrop({ rootRef: frameRef });

  // Frame (pre-scale) dimensions and scroll viewport dimensions. Combined
  // to build a canvas surface that's always bigger than the scaled page
  // plus 500px of "air" on every side so the user can pan freely.
  const [frameSize, setFrameSize] = useState({ w: VIEWPORT_WIDTH.desktop, h: 600 });
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setFrameSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [page?.id, viewport]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaledW = frameSize.w * zoom;
  const scaledH = frameSize.h * zoom;
  const AIR = 500; // navigable space in each direction
  const canvasW = Math.max(viewportSize.w, scaledW) + AIR * 2;
  const canvasH = Math.max(viewportSize.h, scaledH) + AIR * 2;
  const pageLeft = (canvasW - scaledW) / 2;
  const pageTop = (canvasH - scaledH) / 2;

  // Pan mode: Space + drag moves the viewport (like Figma).
  const spaceDownRef = useRef(false);
  const panningRef = useRef<{ startX: number; startY: number; scrollX: number; scrollY: number } | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      if (spaceDownRef.current) return;
      spaceDownRef.current = true;
      if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      spaceDownRef.current = false;
      panningRef.current = null;
      if (scrollRef.current) scrollRef.current.style.cursor = '';
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const pan = panningRef.current;
      if (!pan || !scrollRef.current) return;
      scrollRef.current.scrollLeft = pan.scrollX - (e.clientX - pan.startX);
      scrollRef.current.scrollTop = pan.scrollY - (e.clientY - pan.startY);
    };
    const onUp = () => {
      if (panningRef.current && scrollRef.current) {
        scrollRef.current.style.cursor = spaceDownRef.current ? 'grab' : '';
      }
      panningRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const handlePanPointerDown = (e: React.PointerEvent) => {
    if (!spaceDownRef.current || !scrollRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    panningRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollX: scrollRef.current.scrollLeft,
      scrollY: scrollRef.current.scrollTop,
    };
    scrollRef.current.style.cursor = 'grabbing';
  };

  // Global keyboard shortcuts while editor is focused.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable = target && (
        target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.isContentEditable
      );
      if (isEditable) return;

      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }

      // Zoom shortcuts
      if (meta && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
        return;
      }
      if (meta && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
      }
      if (meta && e.key === '0') {
        e.preventDefault();
        resetZoom();
        return;
      }
      // Toggle panels
      if (meta && e.key === ',') {
        e.preventDefault();
        toggleLeft();
        return;
      }
      if (meta && e.key === '.') {
        e.preventDefault();
        toggleRight();
        return;
      }
      // Cmd+/ → shortcuts menu (dispatched via custom event so Toolbar opens)
      if (meta && e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor:toggle-shortcuts'));
        return;
      }

      const sel = useEditorStore.getState().selection;
      if (!sel) {
        if (e.key === 'Escape') select(null);
        return;
      }

      if (e.key === 'Escape') {
        select(null);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (sel.kind === 'element') removeElement(sel.id);
        else removeSection(sel.id);
        return;
      }

      if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (sel.kind === 'element') duplicateElement(sel.id);
        else duplicateSection(sel.id);
        return;
      }

      if (meta && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        useEditorStore.getState().copySelection();
        return;
      }

      if (meta && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        useEditorStore.getState().pasteClipboard();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [select, undo, redo, removeElement, removeSection, duplicateElement, duplicateSection, zoomIn, zoomOut, resetZoom, toggleLeft, toggleRight]);

  // Ctrl/Cmd + scroll wheel → zoom (like Figma).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const step = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(useEditorStore.getState().zoom + step);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setZoom]);

  if (!page) {
    return <div className="flex items-center justify-center h-full text-slate-400">Carregando…</div>;
  }

  // Dropzones reveal themselves when a compatible drag is active.
  const dragKind = dragging?.payload.kind ?? null;
  const gapActive = dragKind === 'new-section' || dragKind === 'section';
  const bodyActive = dragKind === 'new-element' || dragKind === 'element';

  const handleCanvasClick = () => select(null);

  const wrapElement = (element: Element, rendered: ReactNode, ctx: WrapElementContext) => (
    <EditableElement
      key={element.id}
      element={element}
      rendered={rendered}
      sectionId={ctx.sectionId}
      layout={ctx.layout}
      parentCols={ctx.parentCols}
      parentGap={ctx.parentGap}
    />
  );

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-auto bg-slate-100"
      onClick={handleCanvasClick}
      onPointerDownCapture={handlePanPointerDown}
    >
      {/* Canvas surface: always bigger than scaled page + 500px of air on
          every side. Scrolls freely in all directions. */}
      <div
        style={{
          position: 'relative',
          width: canvasW,
          height: canvasH,
        }}
      >
        {/* Scaled page wrapper, positioned absolutely and centered. */}
        <div
          style={{
            position: 'absolute',
            left: pageLeft,
            top: pageTop,
            width: scaledW,
            height: scaledH,
          }}
        >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: VIEWPORT_WIDTH[viewport],
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
        <div
          ref={frameRef}
          className="bg-white shadow-xl relative"
          style={{ minHeight: 600, fontFamily: effectiveTheme.fontFamily }}
        >
          <BlocksProvider
            breakpoint={viewport}
            theme={effectiveTheme}
            tenantSlug=""
            properties={effectiveProperties}
            property={contextProperty}
            cities={effectiveCities}
            neighborhoods={effectiveNeighborhoods}
            wrapElement={wrapElement}
          >
            <SectionGapDropZone index={0} active={gapActive} />

            {page.sections.map((section, i) => (
              <div key={section.id}>
                <SectionFrame
                  section={section}
                  isSelected={selection?.kind === 'section' && selection.id === section.id}
                  bodyActive={bodyActive}
                  onSelect={(e) => {
                    e.stopPropagation();
                    select({ kind: 'section', id: section.id });
                  }}
                  onEnter={(e) => {
                    e.stopPropagation();
                    hover(section.id);
                  }}
                  onLeave={() => hover(null)}
                />
                <SectionGapDropZone index={i + 1} active={gapActive} />
              </div>
            ))}
          </BlocksProvider>

          {page.sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <p className="text-sm">Sua página está vazia.</p>
              <p className="text-xs mt-1">Arraste uma seção da barra lateral para começar.</p>
            </div>
          )}

          {desktopDrop.isOver && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-blue-500/10 border-2 border-dashed border-blue-500 rounded">
              <div className="bg-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm text-blue-600 font-medium">
                <ImageIcon className="w-4 h-4" />
                Solte a imagem aqui
              </div>
            </div>
          )}

          {desktopDrop.uploading && (
            <div className="absolute top-2 right-2 z-40 bg-white rounded-md shadow px-3 py-1.5 flex items-center gap-2 text-xs text-slate-600">
              <Upload className="w-3.5 h-3.5 animate-pulse text-blue-500" />
              Enviando imagem… {desktopDrop.progress}%
            </div>
          )}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}


interface SectionFrameProps {
  section: Section;
  isSelected: boolean;
  bodyActive: boolean;
  onSelect: (e: MouseEvent) => void;
  onEnter: (e: MouseEvent) => void;
  onLeave: () => void;
}

function SectionFrame({
  section,
  isSelected,
  bodyActive,
  onSelect,
  onEnter,
  onLeave,
}: SectionFrameProps) {
  const sectionFrameRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={sectionFrameRef}
      onClick={onSelect}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #2563eb' : undefined,
        outlineOffset: -2,
      }}
    >
      {/* Left-side drag handle (visible on selection/hover) */}
      <SectionDragHandle sectionId={section.id}>
        <div
          className="absolute top-1/2 -left-6 -translate-y-1/2 w-5 h-10 bg-slate-200 hover:bg-blue-400 hover:text-white rounded flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            opacity: isSelected ? 1 : 0,
            transition: 'opacity 120ms ease',
          }}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </SectionDragHandle>

      {isSelected && (
        <span
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            zIndex: 20,
            background: '#2563eb',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          {SECTION_LABELS[section.type]}
        </span>
      )}

      {isSelected && <SectionResizeHandle section={section} sectionRef={sectionFrameRef} />}

      {section.layout === 'free' ? (
        <FreeCanvasDropZone sectionId={section.id} active={bodyActive}>
          <SectionRenderer sections={[section]} />
        </FreeCanvasDropZone>
      ) : (
        <SectionBodyDropZone sectionId={section.id} active={bodyActive}>
          <SectionRenderer sections={[section]} />
        </SectionBodyDropZone>
      )}
    </div>
  );
}
