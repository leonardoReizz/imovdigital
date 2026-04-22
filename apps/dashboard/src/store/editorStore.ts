import { create } from 'zustand';
import type {
  SiteConfig,
  Section,
  SectionType,
  Property,
} from '@imovdigital/types';
import { DEFAULT_SECTION_SETTINGS, DEFAULT_PROPERTY_DETAIL_CONFIG, DEFAULT_SEARCH_PAGE_CONFIG } from '@imovdigital/types';
import { api } from '../lib/api';

const MAX_HISTORY = 50;

// Preview navigation
export type PreviewPage =
  | { type: 'home' }
  | { type: 'search'; query?: string }
  | { type: 'property'; propertyId: string };

interface ContactData {
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string | null;
  phone: string | null;
}

interface EditorStore {
  config: SiteConfig | null;
  contactData: ContactData | null;
  history: SiteConfig[];
  historyIndex: number;
  selectedSectionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  previewBreakpoint: 'desktop' | 'tablet' | 'mobile';

  // Preview navigation
  previewPage: PreviewPage;
  properties: Property[];
  propertiesLoaded: boolean;

  // Actions
  loadConfig: () => Promise<void>;
  loadProperties: () => Promise<void>;
  setConfig: (config: SiteConfig) => void;
  updateSection: (sectionId: string, settings: Partial<Record<string, unknown>>) => void;
  reorderSections: (newOrder: string[]) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  updateGlobal: (updates: Partial<SiteConfig>) => void;
  selectSection: (sectionId: string | null) => void;
  setBreakpoint: (bp: 'desktop' | 'tablet' | 'mobile') => void;
  navigatePreview: (page: PreviewPage) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
  publish: () => Promise<void>;
}

function pushHistory(state: { history: SiteConfig[]; historyIndex: number }, config: SiteConfig) {
  // Discard any forward history
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(structuredClone(config));
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  }
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

function generateId() {
  return crypto.randomUUID();
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  config: null,
  contactData: null,
  history: [],
  historyIndex: -1,
  selectedSectionId: null,
  isDirty: false,
  isSaving: false,
  isLoading: false,
  previewBreakpoint: 'desktop',

  // Preview navigation
  previewPage: { type: 'home' },
  properties: [],
  propertiesLoaded: false,

  loadConfig: async () => {
    set({ isLoading: true });
    try {
      const [{ data }, contactRes] = await Promise.all([
        api.get('/site-config'),
        api.get('/contact').catch(() => ({ data: null })),
      ]);
      const config = {
        ...data,
        template: data.template || 'classic',
        propertyDetail: data.propertyDetail || DEFAULT_PROPERTY_DETAIL_CONFIG,
        searchPage: data.searchPage || DEFAULT_SEARCH_PAGE_CONFIG,
      } as SiteConfig;

      const cd = contactRes.data;

      set({
        config,
        contactData: cd ? {
          address: cd.address,
          latitude: cd.latitude,
          longitude: cd.longitude,
          whatsapp: cd.whatsapp,
          phone: cd.phone,
        } : null,
        history: [structuredClone(config)],
        historyIndex: 0,
        isDirty: false,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setConfig: (config) => {
    const state = get();
    set({
      config,
      ...pushHistory({ history: state.history, historyIndex: state.historyIndex }, config),
      isDirty: true,
    });
  },

  updateSection: (sectionId, settings) => {
    const state = get();
    if (!state.config) return;

    const config = structuredClone(state.config);
    const section = config.sections.find((s) => s.id === sectionId);
    if (!section) return;

    section.settings = { ...section.settings, ...settings };
    set({
      config,
      ...pushHistory({ history: state.history, historyIndex: state.historyIndex }, config),
      isDirty: true,
    });
  },

  reorderSections: (newOrder) => {
    const state = get();
    if (!state.config) return;

    const config = structuredClone(state.config);
    const sectionMap = new Map(config.sections.map((s) => [s.id, s]));
    config.sections = newOrder
      .map((id, index) => {
        const section = sectionMap.get(id);
        if (section) section.order = index;
        return section;
      })
      .filter(Boolean) as Section[];

    set({
      config,
      ...pushHistory({ history: state.history, historyIndex: state.historyIndex }, config),
      isDirty: true,
    });
  },

  addSection: (type) => {
    const state = get();
    if (!state.config) return;

    const config = structuredClone(state.config);
    const newSection: Section = {
      id: generateId(),
      type,
      order: config.sections.length,
      visible: true,
      settings: structuredClone(DEFAULT_SECTION_SETTINGS[type]),
    };
    config.sections.push(newSection);
    set({
      config,
      ...pushHistory({ history: state.history, historyIndex: state.historyIndex }, config),
      isDirty: true,
      selectedSectionId: newSection.id,
    });
  },

  removeSection: (sectionId) => {
    const state = get();
    if (!state.config) return;

    const config = structuredClone(state.config);
    config.sections = config.sections
      .filter((s) => s.id !== sectionId)
      .map((s, i) => ({ ...s, order: i }));

    set({
      config,
      ...pushHistory({ history: state.history, historyIndex: state.historyIndex }, config),
      isDirty: true,
      selectedSectionId:
        state.selectedSectionId === sectionId ? null : state.selectedSectionId,
    });
  },

  toggleSectionVisibility: (sectionId) => {
    const state = get();
    if (!state.config) return;

    const config = structuredClone(state.config);
    const section = config.sections.find((s) => s.id === sectionId);
    if (!section) return;

    section.visible = !section.visible;
    set({
      config,
      ...pushHistory({ history: state.history, historyIndex: state.historyIndex }, config),
      isDirty: true,
    });
  },

  updateGlobal: (updates) => {
    const state = get();
    if (!state.config) return;

    const config = { ...structuredClone(state.config), ...updates };
    set({
      config,
      ...pushHistory({ history: state.history, historyIndex: state.historyIndex }, config),
      isDirty: true,
    });
  },

  selectSection: (sectionId) => {
    set({ selectedSectionId: sectionId });
  },

  loadProperties: async () => {
    if (get().propertiesLoaded) return;
    try {
      const { data } = await api.get('/properties');
      const list = Array.isArray(data) ? data : data.data ?? [];
      set({ properties: list, propertiesLoaded: true });
    } catch {
      set({ propertiesLoaded: true });
    }
  },

  setBreakpoint: (bp) => {
    set({ previewBreakpoint: bp });
  },

  navigatePreview: (page) => {
    set({ previewPage: page });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    set({
      config: structuredClone(state.history[newIndex]),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    set({
      config: structuredClone(state.history[newIndex]),
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  save: async () => {
    const state = get();
    if (!state.config || state.isSaving) return;

    set({ isSaving: true });
    try {
      const { id, tenantId, updatedAt, ...payload } = state.config;
      await api.patch('/site-config', payload);
      set({ isDirty: false, isSaving: false });
    } catch {
      set({ isSaving: false });
      throw new Error('Erro ao salvar configuração');
    }
  },

  publish: async () => {
    const state = get();
    if (!state.config) return;

    // Save first if dirty
    if (state.isDirty) {
      await get().save();
    }

    await api.post('/site-config/publish');
  },
}));
