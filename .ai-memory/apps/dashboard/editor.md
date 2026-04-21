# Apps/dashboard/editor Module

## Files (27)
- apps/dashboard/src/editor/Canvas.tsx
- apps/dashboard/src/editor/EditableElement.tsx
- apps/dashboard/src/editor/PageList.tsx
- apps/dashboard/src/editor/PageSwitcher.tsx
- apps/dashboard/src/editor/PreviewPage.tsx
- apps/dashboard/src/editor/ResizeHandles.tsx
- apps/dashboard/src/editor/SectionResizeHandle.tsx
- apps/dashboard/src/editor/ShortcutsModal.tsx
- apps/dashboard/src/editor/SiteEditor.tsx
- apps/dashboard/src/editor/SnapGuides.tsx
- apps/dashboard/src/editor/ThemePanel.tsx
- apps/dashboard/src/editor/Toolbar.tsx
- apps/dashboard/src/editor/api.ts
- apps/dashboard/src/editor/defaults.ts
- apps/dashboard/src/editor/store.ts
- apps/dashboard/src/editor/types.ts
- apps/dashboard/src/editor/dnd/EditorDndProvider.tsx
- apps/dashboard/src/editor/dnd/draggables.tsx
- apps/dashboard/src/editor/dnd/droppables.tsx
- apps/dashboard/src/editor/dnd/snap.ts
- apps/dashboard/src/editor/dnd/snapModifier.ts
- apps/dashboard/src/editor/dnd/types.ts
- apps/dashboard/src/editor/dnd/useDesktopImageDrop.ts
- apps/dashboard/src/editor/dnd/zoomModifier.ts
- apps/dashboard/src/editor/sidebar/ElementLibrary.tsx
- apps/dashboard/src/editor/sidebar/PropertiesPanel.tsx
- apps/dashboard/src/editor/sidebar/controls.tsx

## Exports

### Functions
- `Canvas(): React.JSX.Element`
- `EditableElement(props: Props): React.JSX.Element`
- `PageList(): React.JSX.Element`
- `PageSwitcher(): React.JSX.Element`
- `PreviewPage(): React.JSX.Element`
- `ResizeHandles({ element, targetRef, isFree, parentLayout, parentCols: propParentCols, parentGap: propParentGap }: Props): React.JSX.Element | null`
- `SectionResizeHandle({ section, sectionRef }: Props): React.JSX.Element`
- `ShortcutsModal({ open, onClose }: Props): React.JSX.Element | null`
- `SiteEditor(): React.JSX.Element | null`
- `SnapGuides(): React.JSX.Element | null`
- `ThemePanel({ open, onClose }: Props): React.JSX.Element | null`
- `Toolbar(): React.JSX.Element`
- `listPages(): Promise<PageListItem[]>`
- `getPage(id: string): Promise<Page>`
- `createPage(slug: string, title: string): Promise<Page>`
- `updatePage(id: string, payload: { slug?: string | undefined; title?: string | undefined; data?: { seo: PageSeo; theme: ThemeToken...): Promise<Page>`
- `publishPage(id: string): Promise<Page>`
- `resetPageToTemplate(id: string): Promise<Page>`
- `deletePage(id: string): Promise<void>`
- `loadTenantProperties(): Promise<Property[]>`
- `loadTenantFilters(): Promise<{ cities: string[]; neighborhoods: string[]; }>`
- `getTenantTheme(): Promise<TenantTheme>`
- `updateTenantTheme(patch: Partial<TenantTheme>): Promise<TenantTheme>`
- `buildDefaultElement(type: ElementType, id: string, isFreeLayout: boolean): Element`
- `selectSelectedSection(state: EditorState): Section | null`
- `selectSelectedElement(state: EditorState): Element | null`
- `selectCanUndo(state: EditorState): boolean`
- `selectCanRedo(state: EditorState): boolean`
- `EditorDndProvider({ children }: Props): React.JSX.Element`
- `NewSectionDraggable({
  sectionType,
  children,
}: { sectionType: SectionType; children: React.ReactNode; }): React.JSX.Element`
- `NewElementDraggable({
  elementType,
  children,
}: { elementType: ElementType; children: React.ReactNode; }): React.JSX.Element`
- `SectionDragHandle({
  sectionId,
  children,
}: { sectionId: string; children: React.ReactNode; }): React.JSX.Element`
- `ElementDraggable({
  elementId,
  sectionId,
  isFree,
  children,
  style,
}: { elementId: string; sectionId: string; isFree: boolean; children: React.ReactNode; style?: React...): React.JSX.Element`
- `SectionGapDropZone({ index, active }: { index: number; active: boolean; }): React.JSX.Element`
- `SectionBodyDropZone({
  sectionId,
  children,
  active,
}: { sectionId: string; children: React.ReactNode; active: boolean; }): React.JSX.Element`
- `FreeCanvasDropZone({
  sectionId,
  children,
  active,
}: { sectionId: string; children: React.ReactNode; active: boolean; }): React.JSX.Element`
- `resetSnapSticky(): void`
- `computeSnap(dragging: Rect, ctx: SnapContext): SnapResult`
- `useDesktopImageDrop({ rootRef }: Options): UploadStatus`
- `ElementLibrary(): React.JSX.Element`
- `PropertiesPanel(): React.JSX.Element`
- `Field({ label, hint, children }: BaseProps & { children: React.ReactNode; }): React.JSX.Element`
- `TextField({ label, value, onChange, placeholder, hint }: TextFieldProps): React.JSX.Element`
- `TextAreaField({ label, value, onChange, rows = 3, hint }: TextAreaProps): React.JSX.Element`
- `NumberField({ label, value, onChange, min, max, step = 1, suffix, hint }: NumberFieldProps): React.JSX.Element`
- `SelectField({ label, value, onChange, options, hint }: SelectFieldProps<T>): React.JSX.Element`
- `ColorField({ label, value, onChange, hint }: ColorFieldProps): React.JSX.Element`
- `ToggleGroup({ label, value, onChange, options, hint }: ToggleGroupProps<T>): React.JSX.Element`
- `ImageUploadField({
  label,
  value,
  onChange,
  folder = 'gallery',
  hint,
}: ImageUploadFieldProps): React.JSX.Element`
- `Toggle({ label, checked, onChange, hint }: ToggleProps): React.JSX.Element`

### Interfaces
- `interface PageListItem { id: string; slug: string; title: string; status: "draft" | "published"; publishedAt: string | null; updatedAt: string }`
- `interface TenantTheme { primaryColor: string; secondaryColor: string; fontFamily: string; faviconUrl: string | null }`
- `interface SnapGuides { active: boolean; x: number[]; y: number[]; sectionId: string | null }`
- `interface SlotHint { elementId: string; side: "before" | "after" }`
- `interface DraggingState { payload: DragPayload }`
- `interface ElementLocation { sectionId: string; parentContainerId: string | null; index: number }`
- `interface ResolvedSelection { target: SelectionTarget; section: Section; element: Element | null }`
- `interface Rect { left: number; top: number; right: number; bottom: number; width: number; height: number }`
- `interface SnapResult { deltaX: number; deltaY: number; guidesX: number[]; guidesY: number[] }`
- `interface SnapContext { container: Rect; siblings: Rect[]; threshold: number; grid: number }`
- `interface DraggableMeta { payload: DragPayload }`
- `interface DroppableMeta { payload: DropPayload }`

### Types
- `type SelectionTarget = SelectionTarget`
- `type DragPayload = DragPayload`
- `type DropPayload = DropPayload`

### Variables
- `useEditorStore: UseBoundStore<StoreApi<EditorState>>`
- `snapModifier: Modifier`
- `zoomModifier: Modifier`

## Internal dependencies
- → apps/dashboard/hooks
- → apps/dashboard

## External dependencies
`react`, `lucide-react`, `@imovdigital/site-blocks`, `@imovdigital/types`, `@dnd-kit/core`, `react-router`, `zustand`, `immer`

---
_Auto-generated by code-memory_
