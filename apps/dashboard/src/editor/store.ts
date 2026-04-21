import { create } from 'zustand';
import {
  applyPatches,
  enablePatches,
  produceWithPatches,
  type Patch,
} from 'immer';
import type {
  Breakpoint,
  Element,
  ElementStyle,
  ElementType,
  Page,
  Property,
  ResponsiveElementOverride,
  Section,
  SectionLayout,
  SectionType,
} from '@imovdigital/types';
import { createDefaultSection } from '@imovdigital/types';
import type { DraggingState, SelectionTarget } from './types';
import {
  getPage as apiGetPage,
  updatePage as apiUpdatePage,
  publishPage as apiPublishPage,
  resetPageToTemplate as apiResetPageToTemplate,
  loadTenantProperties,
  getTenantTheme,
  updateTenantTheme,
  type TenantTheme,
} from './api';
import { buildDefaultElement } from './defaults';

enablePatches();

const MAX_HISTORY = 50;

interface HistoryEntry {
  patches: Patch[];
  inverse: Patch[];
}

export interface SnapGuides {
  active: boolean;
  /** Viewport-absolute x coordinates for vertical guide lines. */
  x: number[];
  /** Viewport-absolute y coordinates for horizontal guide lines. */
  y: number[];
  sectionId: string | null;
}

/**
 * Which side of the hovered slot the dragged item will land on. Set by
 * EditableElement while the pointer is over it; read in handleDragEnd to
 * pick between `index` and `index + 1`.
 */
export interface SlotHint {
  elementId: string;
  side: 'before' | 'after';
}

interface EditorState {
  page: Page | null;
  selection: SelectionTarget | null;
  hoverId: string | null;
  viewport: Breakpoint;
  dragging: DraggingState | null;
  snapGuides: SnapGuides;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  history: { past: HistoryEntry[]; future: HistoryEntry[] };

  // chrome / canvas ui
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  zoom: number; // 1 = 100%
  slotHint: SlotHint | null;

  // tenant data for Listings/Search blocks
  properties: Property[];
  cities: string[];
  neighborhoods: string[];
  propertiesLoaded: boolean;

  // Global tenant theme — overrides per-page theme so colors/fonts are
  // consistent across every page of the site.
  tenantTheme: TenantTheme | null;
  savingTheme: boolean;

  // In-memory clipboard for Cmd+C / Cmd+V. Sections and elements are
  // copied by value (structured clone); ids are regenerated on paste.
  clipboard:
    | { kind: 'section'; data: Section }
    | { kind: 'element'; data: Element; sourceSectionId: string }
    | null;

  // loaders
  loadPage: (id: string) => Promise<void>;
  save: () => Promise<void>;
  publish: () => Promise<void>;
  saveTenantTheme: (patch: Partial<TenantTheme>) => Promise<void>;
  /** Local-only update of tenantTheme — for live preview in ThemePanel
   *  before the user clicks save. Nothing hits the backend. */
  setTenantThemeLocal: (patch: Partial<TenantTheme>) => void;
  resetPageToTemplate: () => Promise<void>;

  // ui
  select: (target: SelectionTarget | null) => void;
  hover: (id: string | null) => void;
  setViewport: (bp: Breakpoint) => void;
  setDragging: (d: DraggingState | null) => void;
  setSnapGuides: (guides: SnapGuides) => void;
  setSlotHint: (hint: SlotHint | null) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // page-level
  updatePageMeta: (patch: Partial<Pick<Page, 'slug' | 'title'>> & { seo?: Partial<Page['seo']>; theme?: Partial<Page['theme']> }) => void;

  // sections
  insertSection: (type: SectionType, index?: number) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, toIndex: number) => void;
  duplicateSection: (id: string) => void;
  updateSection: (id: string, mutator: (section: Section) => void) => void;
  setSectionLayout: (id: string, layout: SectionLayout) => void;

  // elements
  insertElement: (sectionId: string, elementType: ElementType, parentContainerId?: string | null, index?: number) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  updateElement: (id: string, mutator: (element: Element) => void) => void;
  updateElementStyle: (id: string, style: Partial<ElementStyle>) => void;
  moveElementToSection: (id: string, targetSectionId: string, index?: number) => void;
  moveElementToParent: (
    id: string,
    targetSectionId: string,
    parentContainerId: string | null,
    index?: number,
  ) => void;
  setElementPosition: (id: string, x: number, y: number) => void;
  setElementSize: (id: string, w: number | 'auto' | 'full', h: number | 'auto') => void;
  setElementBox: (id: string, box: { x: number; y: number; w: number; h: number }) => void;
  setElementGridSpan: (id: string, span: number) => void;
  setElementHiddenAtBreakpoint: (id: string, breakpoint: Breakpoint, hidden: boolean) => void;
  resetElementResponsive: (id: string, breakpoint: Breakpoint) => void;

  // history
  undo: () => void;
  redo: () => void;

  // clipboard
  copySelection: () => void;
  pasteClipboard: () => void;
}

function genId(): string {
  return crypto.randomUUID();
}

/** Walks the tree (sections + nested containers) applying a mutator when id matches. */
function walkElements(
  elements: Element[],
  id: string,
  mutator: (el: Element, parent: Element[], index: number) => void,
): boolean {
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.id === id) {
      mutator(el, elements, i);
      return true;
    }
    if (el.type === 'container') {
      if (walkElements(el.children, id, mutator)) return true;
    }
  }
  return false;
}

function findSectionOf(page: Page, elementId: string): Section | null {
  for (const section of page.sections) {
    let found = false;
    walkElements(section.children, elementId, () => {
      found = true;
    });
    if (found) return section;
  }
  return null;
}

export const useEditorStore = create<EditorState>((set, get) => {
  /**
   * Apply a mutator on the current page, producing patches for history.
   * If the mutator produces no changes, the history stays untouched.
   */
  function commit(mutator: (draft: Page) => void) {
    const state = get();
    if (!state.page) return;

    const [next, patches, inverse] = produceWithPatches(state.page, mutator);
    if (patches.length === 0) return;

    set({
      page: next,
      isDirty: true,
      history: {
        past: [...state.history.past.slice(-(MAX_HISTORY - 1)), { patches, inverse }],
        future: [],
      },
    });
  }

  return {
    page: null,
    selection: null,
    hoverId: null,
    viewport: 'desktop',
    dragging: null,
    snapGuides: { active: false, x: [], y: [], sectionId: null },
    leftPanelOpen: readPanelPref('left', true),
    rightPanelOpen: readPanelPref('right', true),
    zoom: 1,
    slotHint: null,
    properties: [],
    cities: [],
    neighborhoods: [],
    propertiesLoaded: false,
    tenantTheme: null,
    savingTheme: false,
    clipboard: null,
    isDirty: false,
    isSaving: false,
    isLoading: false,
    error: null,
    history: { past: [], future: [] },

    async loadPage(id) {
      set({ isLoading: true, error: null });
      try {
        const page = await apiGetPage(id);
        set({
          page,
          isLoading: false,
          isDirty: false,
          history: { past: [], future: [] },
          selection: null,
          hoverId: null,
        });
        // Load tenant theme once per editor session.
        if (!get().tenantTheme) {
          getTenantTheme()
            .then((theme) => set({ tenantTheme: theme }))
            .catch(() => {});
        }
        // Load properties once per editor session to power Listings/Search.
        if (!get().propertiesLoaded) {
          loadTenantProperties()
            .then((properties) => {
              const cities = Array.from(new Set(properties.map((p) => p.city).filter(Boolean))).sort();
              const neighborhoods = Array.from(
                new Set(properties.map((p) => p.neighborhood).filter(Boolean)),
              ).sort();
              set({ properties, cities, neighborhoods, propertiesLoaded: true });
            })
            .catch(() => {
              set({ propertiesLoaded: true });
            });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar página';
        set({ error: message, isLoading: false });
      }
    },

    async save() {
      const { page, isSaving } = get();
      if (!page || isSaving) return;
      set({ isSaving: true, error: null });
      try {
        const updated = await apiUpdatePage(page.id, {
          slug: page.slug,
          title: page.title,
          data: { seo: page.seo, theme: page.theme, sections: page.sections },
        });
        set({ page: updated, isDirty: false, isSaving: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar';
        set({ error: message, isSaving: false });
        throw err;
      }
    },

    async publish() {
      const { page, isDirty } = get();
      if (!page) return;
      if (isDirty) await get().save();
      const updated = await apiPublishPage(page.id);
      set({ page: updated });
    },

    async saveTenantTheme(patch) {
      set({ savingTheme: true });
      try {
        const updated = await updateTenantTheme(patch);
        set({ tenantTheme: updated });
      } finally {
        set({ savingTheme: false });
      }
    },

    setTenantThemeLocal(patch) {
      const current = get().tenantTheme;
      if (!current) return;
      set({ tenantTheme: { ...current, ...patch } });
    },

    async resetPageToTemplate() {
      const { page } = get();
      if (!page) return;
      const updated = await apiResetPageToTemplate(page.id);
      set({
        page: updated,
        isDirty: false,
        history: { past: [], future: [] },
        selection: null,
      });
    },

    select(target) {
      set({ selection: target });
    },

    hover(id) {
      set({ hoverId: id });
    },

    setViewport(bp) {
      set({ viewport: bp });
    },

    setDragging(d) {
      set({ dragging: d });
      if (!d) {
        set({
          snapGuides: { active: false, x: [], y: [], sectionId: null },
          slotHint: null,
        });
      }
    },

    setSnapGuides(guides) {
      set({ snapGuides: guides });
    },

    setSlotHint(hint) {
      set({ slotHint: hint });
    },

    toggleLeftPanel() {
      const next = !get().leftPanelOpen;
      writePanelPref('left', next);
      set({ leftPanelOpen: next });
    },

    toggleRightPanel() {
      const next = !get().rightPanelOpen;
      writePanelPref('right', next);
      set({ rightPanelOpen: next });
    },

    setZoom(zoom) {
      set({ zoom: clampZoom(zoom) });
    },

    zoomIn() {
      set({ zoom: clampZoom(get().zoom + 0.1) });
    },

    zoomOut() {
      set({ zoom: clampZoom(get().zoom - 0.1) });
    },

    resetZoom() {
      set({ zoom: 1 });
    },

    updatePageMeta(patch) {
      commit((draft) => {
        if (patch.slug !== undefined) draft.slug = patch.slug;
        if (patch.title !== undefined) draft.title = patch.title;
        if (patch.seo) draft.seo = { ...draft.seo, ...patch.seo };
        if (patch.theme) draft.theme = { ...draft.theme, ...patch.theme };
      });
    },

    insertSection(type, index) {
      const id = genId();
      commit((draft) => {
        const section = createDefaultSection(type, id);
        // Pinned positions: navbar stays at the top, footer at the bottom.
        const forced =
          type === 'navbar' ? 0
          : type === 'footer' ? draft.sections.length
          : index ?? draft.sections.length;
        draft.sections.splice(forced, 0, section);
      });
      set({ selection: { kind: 'section', id } });
    },

    removeSection(id) {
      commit((draft) => {
        draft.sections = draft.sections.filter((s) => s.id !== id);
      });
      const sel = get().selection;
      if (sel?.kind === 'section' && sel.id === id) set({ selection: null });
    },

    moveSection(id, toIndex) {
      commit((draft) => {
        const from = draft.sections.findIndex((s) => s.id === id);
        if (from === -1) return;
        const [section] = draft.sections.splice(from, 1);
        draft.sections.splice(Math.max(0, Math.min(toIndex, draft.sections.length)), 0, section);
      });
    },

    duplicateSection(id) {
      const newId = genId();
      commit((draft) => {
        const idx = draft.sections.findIndex((s) => s.id === id);
        if (idx === -1) return;
        const clone = structuredClone(draft.sections[idx]);
        clone.id = newId;
        // Regenerate element ids recursively to avoid collisions.
        const renameIds = (els: Element[]) => {
          for (const el of els) {
            el.id = genId();
            if (el.type === 'container') renameIds(el.children);
          }
        };
        renameIds(clone.children);
        draft.sections.splice(idx + 1, 0, clone);
      });
      set({ selection: { kind: 'section', id: newId } });
    },

    updateSection(id, mutator) {
      commit((draft) => {
        const section = draft.sections.find((s) => s.id === id);
        if (!section) return;
        mutator(section);
      });
    },

    setSectionLayout(id, layout) {
      commit((draft) => {
        const section = draft.sections.find((s) => s.id === id);
        if (!section) return;
        section.layout = layout;
        if (layout === 'grid' && !section.gridConfig) {
          section.gridConfig = { cols: 3, gap: 24 };
        }
      });
    },

    insertElement(sectionId, elementType, parentContainerId = null, index) {
      const id = genId();
      commit((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (!section) return;

        const target: Element[] = parentContainerId
          ? findChildrenOfContainer(section.children, parentContainerId) ?? section.children
          : section.children;

        const element = buildDefaultElement(elementType, id, section.layout === 'free');
        const at = index ?? target.length;
        target.splice(at, 0, element);
      });
      set({ selection: { kind: 'element', id } });
    },

    removeElement(id) {
      commit((draft) => {
        for (const section of draft.sections) {
          let removed = false;
          walkElements(section.children, id, (_el, parent, index) => {
            parent.splice(index, 1);
            removed = true;
          });
          if (removed) break;
        }
      });
      const sel = get().selection;
      if (sel?.kind === 'element' && sel.id === id) set({ selection: null });
    },

    duplicateElement(id) {
      const newId = genId();
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el, parent, index) => {
            const clone = structuredClone(el);
            clone.id = newId;
            if (clone.type === 'container') {
              const renameIds = (els: Element[]) => {
                for (const sub of els) {
                  sub.id = genId();
                  if (sub.type === 'container') renameIds(sub.children);
                }
              };
              renameIds(clone.children);
            }
            // Offset free-positioned copies slightly so they don't stack.
            if (clone.position) {
              clone.position = { x: clone.position.x + 16, y: clone.position.y + 16 };
            }
            parent.splice(index + 1, 0, clone);
            done = true;
          });
          if (done) break;
        }
      });
      set({ selection: { kind: 'element', id: newId } });
    },

    updateElement(id, mutator) {
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el) => {
            mutator(el);
            done = true;
          });
          if (done) break;
        }
      });
    },

    updateElementStyle(id, style) {
      const vp = get().viewport;
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el) => {
            if (vp === 'desktop') {
              el.style = { ...el.style, ...style };
            } else {
              const override: ResponsiveElementOverride = el.responsive?.[vp] ?? {};
              el.responsive = {
                ...el.responsive,
                [vp]: { ...override, style: { ...(override.style ?? {}), ...style } },
              };
            }
            done = true;
          });
          if (done) break;
        }
      });
    },

    moveElementToSection(id, targetSectionId, index) {
      get().moveElementToParent(id, targetSectionId, null, index);
    },

    moveElementToParent(id, targetSectionId, parentContainerId, index) {
      commit((draft) => {
        // Extract the active element from wherever it lives (any depth).
        let extracted: Element | null = null;
        let sourceParent: Element[] | null = null;
        let sourceIndex = -1;
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (_el, parent, idx) => {
            sourceParent = parent;
            sourceIndex = idx;
            [extracted] = parent.splice(idx, 1);
            done = true;
          });
          if (done) break;
        }
        if (!extracted) return;

        const sourceParentArr = sourceParent as Element[] | null;

        // Refuse to drop a container into one of its own descendants —
        // would create an infinite tree on next render.
        if (parentContainerId && elementContains(extracted, parentContainerId)) {
          // Put it back where it was and bail.
          if (sourceParentArr && sourceIndex >= 0) {
            sourceParentArr.splice(sourceIndex, 0, extracted);
          }
          return;
        }

        const target = draft.sections.find((s) => s.id === targetSectionId);
        if (!target) return;

        const targetChildren: Element[] = parentContainerId
          ? findChildrenOfContainer(target.children, parentContainerId) ?? target.children
          : target.children;

        // Adjust the index when the source and destination are the same
        // collection — splice shifted everything after sourceIndex by -1.
        let at = index ?? targetChildren.length;
        if (sourceParentArr === targetChildren && sourceIndex < at) {
          at -= 1;
        }
        at = Math.max(0, Math.min(at, targetChildren.length));

        targetChildren.splice(at, 0, extracted);
      });
    },

    setElementPosition(id, x, y) {
      const vp = get().viewport;
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el) => {
            if (vp === 'desktop') {
              el.position = { x, y };
            } else {
              const override: ResponsiveElementOverride = el.responsive?.[vp] ?? {};
              el.responsive = {
                ...el.responsive,
                [vp]: { ...override, position: { x, y } },
              };
            }
            done = true;
          });
          if (done) break;
        }
      });
    },

    setElementSize(id, w, h) {
      const vp = get().viewport;
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el) => {
            if (vp === 'desktop') {
              el.size = { w, h };
            } else {
              const override: ResponsiveElementOverride = el.responsive?.[vp] ?? {};
              el.responsive = {
                ...el.responsive,
                [vp]: { ...override, size: { w, h } },
              };
            }
            done = true;
          });
          if (done) break;
        }
      });
    },

    setElementGridSpan(id, span) {
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el) => {
            el.gridSpan = Math.max(1, Math.round(span));
            done = true;
          });
          if (done) break;
        }
      });
    },

    setElementBox(id, { x, y, w, h }) {
      const vp = get().viewport;
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el) => {
            if (vp === 'desktop') {
              el.position = { x, y };
              el.size = { w, h };
            } else {
              const override: ResponsiveElementOverride = el.responsive?.[vp] ?? {};
              el.responsive = {
                ...el.responsive,
                [vp]: { ...override, position: { x, y }, size: { w, h } },
              };
            }
            done = true;
          });
          if (done) break;
        }
      });
    },

    setElementHiddenAtBreakpoint(id, breakpoint, hidden) {
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el) => {
            el.hidden = { ...(el.hidden ?? {}), [breakpoint]: hidden };
            done = true;
          });
          if (done) break;
        }
      });
    },

    resetElementResponsive(id, breakpoint) {
      commit((draft) => {
        for (const section of draft.sections) {
          let done = false;
          walkElements(section.children, id, (el) => {
            if (el.responsive) {
              const { [breakpoint]: _, ...rest } = el.responsive;
              el.responsive = Object.keys(rest).length > 0 ? rest : undefined;
            }
            if (el.hidden) {
              const { [breakpoint]: _, ...rest } = el.hidden;
              el.hidden = Object.keys(rest).length > 0 ? rest : undefined;
            }
            done = true;
          });
          if (done) break;
        }
      });
    },

    undo() {
      const state = get();
      const last = state.history.past[state.history.past.length - 1];
      if (!last || !state.page) return;
      const next = applyPatches(state.page, last.inverse);
      set({
        page: next,
        isDirty: true,
        history: {
          past: state.history.past.slice(0, -1),
          future: [last, ...state.history.future],
        },
      });
    },

    redo() {
      const state = get();
      const first = state.history.future[0];
      if (!first || !state.page) return;
      const next = applyPatches(state.page, first.patches);
      set({
        page: next,
        isDirty: true,
        history: {
          past: [...state.history.past, first],
          future: state.history.future.slice(1),
        },
      });
    },

    copySelection() {
      const state = get();
      const sel = state.selection;
      if (!sel || !state.page) return;

      if (sel.kind === 'section') {
        const section = state.page.sections.find((s) => s.id === sel.id);
        if (!section) return;
        set({ clipboard: { kind: 'section', data: structuredClone(section) } });
      } else {
        for (const section of state.page.sections) {
          let element: Element | null = null;
          walkElements(section.children, sel.id, (el) => { element = el; });
          if (element) {
            set({
              clipboard: {
                kind: 'element',
                data: structuredClone(element) as Element,
                sourceSectionId: section.id,
              },
            });
            return;
          }
        }
      }
    },

    pasteClipboard() {
      const state = get();
      const clip = state.clipboard;
      if (!clip || !state.page) return;

      const regenElementIds = (els: Element[]) => {
        for (const el of els) {
          el.id = genId();
          if (el.type === 'container') regenElementIds(el.children);
        }
      };

      if (clip.kind === 'section') {
        const newId = genId();
        const clone = structuredClone(clip.data);
        clone.id = newId;
        regenElementIds(clone.children);

        const sel = state.selection;
        commit((draft) => {
          let insertAt = draft.sections.length;
          if (sel?.kind === 'section') {
            const idx = draft.sections.findIndex((s) => s.id === sel.id);
            if (idx !== -1) insertAt = idx + 1;
          }
          draft.sections.splice(insertAt, 0, clone);
        });
        set({ selection: { kind: 'section', id: newId } });
        return;
      }

      // clip.kind === 'element'
      const newId = genId();
      const clone = structuredClone(clip.data);
      clone.id = newId;
      if (clone.type === 'container') regenElementIds(clone.children);
      // Small offset for free-positioned clones so they're not on top.
      if (clone.position) {
        clone.position = { x: clone.position.x + 16, y: clone.position.y + 16 };
      }

      const sel = state.selection;
      let targetSectionId = clip.sourceSectionId;
      let targetIndex: number | null = null;

      if (sel?.kind === 'section') {
        targetSectionId = sel.id;
        targetIndex = null; // append to end
      } else if (sel?.kind === 'element') {
        for (const section of state.page.sections) {
          const idx = section.children.findIndex((c) => c.id === sel.id);
          if (idx !== -1) {
            targetSectionId = section.id;
            targetIndex = idx + 1;
            break;
          }
        }
      }

      commit((draft) => {
        const section = draft.sections.find((s) => s.id === targetSectionId);
        if (!section) return;
        const at = targetIndex ?? section.children.length;
        section.children.splice(at, 0, clone);
      });
      set({ selection: { kind: 'element', id: newId } });
    },
  };
});

const PANEL_STORAGE_KEY = 'editor:panels';
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

function readPanelPref(side: 'left' | 'right', fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(PANEL_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { left?: boolean; right?: boolean };
    const value = parsed[side];
    return typeof value === 'boolean' ? value : fallback;
  } catch {
    return fallback;
  }
}

function writePanelPref(side: 'left' | 'right', value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(PANEL_STORAGE_KEY);
    const parsed = (raw ? JSON.parse(raw) : {}) as { left?: boolean; right?: boolean };
    parsed[side] = value;
    window.localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

/** Recursive `id in element subtree?` — used to block self-parenting drops. */
function elementContains(root: Element, id: string): boolean {
  if (root.id === id) return true;
  if (root.type !== 'container') return false;
  for (const child of root.children) {
    if (elementContains(child, id)) return true;
  }
  return false;
}

function findChildrenOfContainer(elements: Element[], containerId: string): Element[] | null {
  for (const el of elements) {
    if (el.id === containerId && el.type === 'container') return el.children;
    if (el.type === 'container') {
      const found = findChildrenOfContainer(el.children, containerId);
      if (found) return found;
    }
  }
  return null;
}

// ─── Selectors ───────────────────────────────────────────────

export function selectSelectedSection(state: EditorState): Section | null {
  if (!state.page || !state.selection) return null;
  if (state.selection.kind === 'section') {
    return state.page.sections.find((s) => s.id === state.selection!.id) ?? null;
  }
  return findSectionOf(state.page, state.selection.id);
}

export function selectSelectedElement(state: EditorState): Element | null {
  if (!state.page || state.selection?.kind !== 'element') return null;
  let result: Element | null = null;
  for (const section of state.page.sections) {
    walkElements(section.children, state.selection.id, (found) => {
      result = found;
    });
    if (result) break;
  }
  return result;
}

export function selectCanUndo(state: EditorState): boolean {
  return state.history.past.length > 0;
}

export function selectCanRedo(state: EditorState): boolean {
  return state.history.future.length > 0;
}
